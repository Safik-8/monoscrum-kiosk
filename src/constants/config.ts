import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getBaseApiUrl = (): string => {
  // 1. Web browser environment
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
    if (__DEV__) {
      return process.env.EXPO_PUBLIC_LOCAL_API_URL || 'http://localhost:8000/api';
    }
    return (
      process.env.EXPO_PUBLIC_LIVE_API_URL ||
      process.env.EXPO_PUBLIC_API_URL ||
      `${window.location.origin}/api`
    );
  }

  // 2. Development / Testing Mode (__DEV__): Expo Go / Local Emulator
  if (__DEV__) {
    // Resolve Metro host IP for physical devices running Expo Go
    const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost;
    let devMachineIp: string | null = null;
    if (hostUri) {
      const parsed = hostUri.split(':')[0];
      if (parsed && parsed !== 'localhost' && parsed !== '127.0.0.1') {
        devMachineIp = parsed;
      }
    }

    // If explicitly provided via EXPO_PUBLIC_LOCAL_API_URL
    if (process.env.EXPO_PUBLIC_LOCAL_API_URL) {
      let url = process.env.EXPO_PUBLIC_LOCAL_API_URL;
      // On Android or real device, "localhost" points to the phone itself. Remap to computer's IP
      if (Platform.OS !== 'web' && (url.includes('localhost') || url.includes('127.0.0.1'))) {
        if (devMachineIp) {
          url = url.replace(/localhost|127\.0\.0\.1/, devMachineIp);
        } else if (Platform.OS === 'android') {
          url = url.replace(/localhost|127\.0\.0\.1/, '10.0.2.2');
        }
      }
      return url;
    }

    if (devMachineIp) {
      const port = process.env.EXPO_PUBLIC_API_PORT || '8000';
      return `http://${devMachineIp}:${port}/api`;
    }

    // Android emulator loopback alias
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:8000/api';
    }

    return 'http://localhost:8000/api';
  }

  // 3. Enterprise Production / Standalone APK / EAS Build:
  return (
    process.env.EXPO_PUBLIC_LIVE_API_URL ||
    process.env.EXPO_PUBLIC_API_URL ||
    'http://192.168.1.50:5178/api'
  );
};

export const API_URL = getBaseApiUrl().replace(/\/$/, '');

export const REFRESH_TOKEN_KEY = 'monoscrum.kiosk.refresh-token';
export const DEVICE_ID_KEY = 'monoscrum.kiosk.device-id';

export const DRAWER_WIDTH_RATIO = 0.78;
export const BOTTOM_BAR_HEIGHT = 80;
