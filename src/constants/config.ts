export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000/api'
).replace(/\/$/, '');

export const REFRESH_TOKEN_KEY = 'monoscrum.kiosk.refresh-token';
export const DEVICE_ID_KEY = 'monoscrum.kiosk.device-id';

export const DRAWER_WIDTH_RATIO = 0.78;
export const BOTTOM_BAR_HEIGHT = 80;
