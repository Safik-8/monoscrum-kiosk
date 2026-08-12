export type Session = {
  accessToken: string;
  deviceId: string;
  operatorName?: string;
};

export type AppScreen = 'loading' | 'login' | 'main';

export type BottomTab = 'new' | 'scan' | 'settings';

export type AuthResponse = {
  status: string;
  token?: string;
  refreshToken?: string;
  message?: string;
  data?: {
    user?: { name?: string };
  };
};
