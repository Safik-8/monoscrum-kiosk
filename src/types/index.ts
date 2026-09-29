export type Session = {
  accessToken: string;
  deviceId: string;
  operatorName?: string;
  regionId?: string;
  regionName?: string;
  organizationId?: string;
  organizationName?: string;
};

export type AppScreen = 'loading' | 'login' | 'main';

export type BottomTab = 'new' | 'history' | 'scan' | 'settings';

export type AuthResponse = {
  status: string;
  token?: string;
  refreshToken?: string;
  message?: string;
  data?: {
    user?: { 
      name?: string;
      regionId?: string;
      regionName?: string;
      organizationId?: string;
      organizationName?: string;
    };
  };
};
