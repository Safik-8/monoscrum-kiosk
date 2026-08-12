import { useState } from 'react';
import { Alert } from 'react-native';
import { CameraView } from 'expo-camera';
import { API_URL, REFRESH_TOKEN_KEY } from '../constants/config';
import { getDeviceId } from '../lib/deviceId';
import { tokenStore } from '../lib/tokenStore';
import { fetchWithTimeout, parseResponse } from '../lib/http';
import { AppScreen, Session } from '../types';

interface UseAuthReturn {
  session: Session | null;
  appScreen: AppScreen;
  email: string;
  password: string;
  busy: boolean;
  error: string;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  restoreSession: () => Promise<void>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  scanFace: (cameraRef: React.RefObject<CameraView | null>) => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [appScreen, setAppScreen] = useState<AppScreen>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function restoreSession() {
    try {
      const refreshToken = await tokenStore.get(REFRESH_TOKEN_KEY);
      if (!refreshToken) return setAppScreen('login');

      const deviceId = await getDeviceId();
      const response = await fetchWithTimeout(`${API_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform: 'mobile', deviceId, refreshToken }),
      });
      const data = await parseResponse(response);
      if (!data.token || !data.refreshToken) throw new Error('Invalid refresh response.');

      await tokenStore.set(REFRESH_TOKEN_KEY, data.refreshToken);
      setSession({ accessToken: data.token, deviceId, operatorName: data.data?.user?.name });
      setAppScreen('main');
    } catch {
      await tokenStore.remove(REFRESH_TOKEN_KEY);
      setAppScreen('login');
    }
  }

  async function login() {
    setBusy(true);
    setError('');
    try {
      const deviceId = await getDeviceId();
      const response = await fetchWithTimeout(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, platform: 'mobile', deviceId }),
      });
      const data = await parseResponse(response);
      if (!data.token || !data.refreshToken) {
        throw new Error('The server did not return a mobile session.');
      }

      await tokenStore.set(REFRESH_TOKEN_KEY, data.refreshToken);
      setSession({ accessToken: data.token, deviceId, operatorName: data.data?.user?.name });
      setPassword('');
      setAppScreen('main');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    try {
      const refreshToken = await tokenStore.get(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        await fetchWithTimeout(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ platform: 'mobile', refreshToken }),
        });
      }
    } finally {
      await tokenStore.remove(REFRESH_TOKEN_KEY);
      setSession(null);
      setAppScreen('login');
      setBusy(false);
    }
  }

  async function scanFace(cameraRef: React.RefObject<CameraView | null>) {
    if (!cameraRef.current || !session || busy) return;
    setBusy(true);
    setError('');
    try {
      const image = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.65 });
      if (!image?.base64) throw new Error('Unable to capture camera image.');

      const response = await fetchWithTimeout(`${API_URL}/kiosk/attendance/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ imageBase64: image.base64, deviceId: session.deviceId }),
      });
      const result = await parseResponse(response);
      Alert.alert('✅ Attendance Recorded', result.message || 'Scan completed successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Face scan failed.');
    } finally {
      setBusy(false);
    }
  }

  return {
    session,
    appScreen,
    email,
    password,
    busy,
    error,
    setEmail,
    setPassword,
    restoreSession,
    login,
    logout,
    scanFace,
  };
}
