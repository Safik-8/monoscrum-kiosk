import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getBaseApiUrl = (): string => {
  // 1. If running in a web browser:
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    const isLocal =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.endsWith('.local');

    if (isLocal) {
      const port = process.env.EXPO_PUBLIC_API_PORT || '8000';
      return `${window.location.protocol}//${hostname}:${port}/api`;
    }

    if (process.env.EXPO_PUBLIC_LIVE_API_URL) {
      return process.env.EXPO_PUBLIC_LIVE_API_URL;
    }
    return process.env.EXPO_PUBLIC_API_URL || `${window.location.origin}/api`;
  }

  // 2. Explicit Environment Variables take precedence if provided
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (process.env.EXPO_PUBLIC_LOCAL_API_URL && __DEV__) {
    return process.env.EXPO_PUBLIC_LOCAL_API_URL;
  }

  // 3. Native Development (__DEV__): Automatically detect Metro server's IP address (Expo Go on phone/emulator)
  if (__DEV__) {
    // Expo provides the host URI used by Metro (e.g. "192.168.1.23:8081")
    const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost;
    if (hostUri) {
      const devMachineIp = hostUri.split(':')[0];
      if (devMachineIp && devMachineIp !== 'localhost' && devMachineIp !== '127.0.0.1') {
        const port = process.env.EXPO_PUBLIC_API_PORT || '8000';
        return `http://${devMachineIp}:${port}/api`;
      }
    }

    // Android emulator fallback
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8000/api';
    }
    return 'http://localhost:8000/api';
  }

  // 4. Live / Production Native Build:
  return (
    process.env.EXPO_PUBLIC_LIVE_API_URL ||
    'https://api.monoscrum.com/api'
  );
};

export const API_URL = getBaseApiUrl().replace(/\/$/, '');

export const REFRESH_TOKEN_KEY = 'monoscrum.kiosk.refresh-token';
export const DEVICE_ID_KEY = 'monoscrum.kiosk.device-id';

export const DRAWER_WIDTH_RATIO = 0.78;
export const BOTTOM_BAR_HEIGHT = 80;
