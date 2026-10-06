import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
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
  scanFace: (photoOutput: any) => Promise<void>;
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

  // Proactively refresh token every 10 minutes to prevent JWT expiration
  useEffect(() => {
    if (!session?.accessToken || appScreen !== 'main') return;
    
    const interval = setInterval(() => {
      const bgRefresh = async () => {
        try {
          const refreshToken = await tokenStore.get(REFRESH_TOKEN_KEY);
          if (!refreshToken) return;
          const deviceId = await getDeviceId();
          const response = await fetchWithTimeout(`${API_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ platform: 'mobile', deviceId, refreshToken }),
          });
          const data = await parseResponse(response);
          if (data.token && data.refreshToken) {
            await tokenStore.set(REFRESH_TOKEN_KEY, data.refreshToken);
            setSession(prev => prev ? { ...prev, accessToken: data.token } : null);
            console.log('Token refreshed in background');
          }
        } catch (e) {
          console.log('Background token refresh failed:', e);
        }
      };
      void bgRefresh();
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [session?.accessToken, appScreen]);

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

  /** Build session object from API response data */
  function buildSession(data: any, deviceId: string): Session {
    return {
      accessToken: data.token,
      deviceId,
      operatorName: data.data?.user?.name,
      regionId: data.data?.user?.regionId,
      regionName: data.data?.user?.regionName,
      organizationId: data.data?.user?.organizationId,
      organizationName: data.data?.user?.organizationName,
    };
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
      setSession(buildSession(data, deviceId));
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
      setSession(buildSession(data, deviceId));
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

  async function scanFace(photoOutput: any) {
    if (!photoOutput || !session || busy) {
      console.log(`[useAuth] scanFace aborted. photoOutput: ${!!photoOutput}, session: ${!!session}, busy: ${busy}`);
      return;
    }
    setBusy(true);
    setError('');
    console.log('[useAuth] Initiating scanFace...');
    try {
      // Vision Camera v5 uses photoOutput.takePhoto()
      console.log('[useAuth] Taking photo with camera...');
      const photo = await photoOutput.takePhoto({
        qualityPrioritization: 'speed',
      });
      
      if (!photo || !photo.path) throw new Error('Unable to capture camera image.');
      
      // Vision Camera returns a file path, not base64 directly.
      // We need to read the file and convert to base64.
      const photoUri = `file://${photo.path}`;
      setCapturedImage(photoUri);
      console.log(`[useAuth] Photo taken successfully: ${photoUri}`);

      console.log('[useAuth] Converting photo to Base64...');
      // Fetch the photo as base64 via XMLHttpRequest (safer than fetch().blob() in RN)
      const base64Data = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function() {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            // Strip the data:image/...;base64, prefix
            const base64 = result.split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(xhr.response);
        };
        xhr.onerror = function() {
          reject(new Error('Failed to read file as blob'));
        };
        xhr.responseType = 'blob';
        xhr.open('GET', photoUri, true);
        xhr.send(null);
      });
      console.log(`[useAuth] Base64 conversion successful. Length: ${base64Data.length}`);

      console.log(`[useAuth] Sending POST request to ${API_URL}/kiosk/attendance/scan...`);
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
      }, 15_000); // 15s timeout for face recognition pipeline
      
      console.log(`[useAuth] Received API response with status: ${response.status}`);
      const result = await parseResponse(response);
      console.log('[useAuth] API parseResponse result:', JSON.stringify(result, null, 2));
      setScanResult(result);
    } catch (err) {
      console.log('[useAuth] Face scan error caught:', err);
      setError(err instanceof Error ? err.message : 'Face scan failed.');
    } finally {
      console.log('[useAuth] scanFace process finished.');
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
