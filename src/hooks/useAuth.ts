import { useState } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import type { Camera } from 'react-native-vision-camera';
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
  scanFace: (cameraRef: React.RefObject<Camera | null>) => Promise<void>;
  scanResult: any;
  clearScanResult: () => void;
  kioskLocation: { latitude: number; longitude: number } | null;
  setKioskLocation: (loc: { latitude: number; longitude: number } | null) => void;
  capturedImage: string | null;
}

export function useAuth(): UseAuthReturn {
  const [appScreen, setAppScreen] = useState<AppScreen>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const [kioskLocation, setKioskLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function checkExistingLocation() {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setKioskLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (e) {
      // Gracefully fail if location services are disabled
      console.log('Failed to fetch existing location:', e);
    }
  }

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
      await checkExistingLocation();
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
      await checkExistingLocation();
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

  async function scanFace(cameraRef: React.RefObject<Camera | null>) {
    if (!cameraRef.current || !session || busy) return;
    setBusy(true);
    setError('');
    try {
      const photo = await cameraRef.current.takePhoto({
        qualityPrioritization: 'speed',
        enableShutterSound: false
      });
      
      if (!photo) throw new Error('Unable to capture camera image.');
      
      // Vision Camera saves photo to file system. We need to convert it or pass the path.
      // Usually, backend takes base64. Let's assume we can fetch it, or if backend handles multipart, we can upload it.
      // For now, let's use fetch to read the local file to base64 or upload it as form data.
      
      const fileUri = `file://${photo.path}`;
      setCapturedImage(fileUri);

      // We have to convert local file to base64 to send it to the backend endpoint which expects JSON
      // Or we can modify to send FormData. For now, fetch and convert.
      const responseFile = await fetch(fileUri);
      const blob = await responseFile.blob();
      const reader = new FileReader();
      
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          // Extract just the base64 part
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const base64Data = await base64Promise;

      const response = await fetchWithTimeout(`${API_URL}/kiosk/attendance/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ 
          imageBase64: base64Data, 
          deviceId: session.deviceId,
          location: kioskLocation 
        }),
      });
      const result = await parseResponse(response);
      setScanResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Face scan failed.');
    } finally {
      setBusy(false);
      setCapturedImage(null);
    }
  }

  return {
    session,
    appScreen,
    email,
    password,
    busy,
    error,
    capturedImage,
    setEmail,
    setPassword,
    restoreSession,
    login,
    logout,
    scanFace,
    scanResult,
    clearScanResult: () => {
      setScanResult(null);
      setCapturedImage(null);
      setError('');
    },
    kioskLocation,
    setKioskLocation,
  };
}
