import * as Device from 'expo-device';
import { DEVICE_ID_KEY } from '../constants/config';
import { tokenStore } from './tokenStore';

export async function getDeviceId(): Promise<string> {
  const saved = await tokenStore.get(DEVICE_ID_KEY);
  if (saved) return saved;

  const fingerprint =
    Device.osBuildId ||
    Device.modelId ||
    Device.modelName ||
    'unknown-device';

  const deviceId = `kiosk-${fingerprint}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;

  await tokenStore.set(DEVICE_ID_KEY, deviceId);
  return deviceId;
}
