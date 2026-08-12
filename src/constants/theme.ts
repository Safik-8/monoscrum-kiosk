import { Platform } from 'react-native';

export const Colors = {
  // Backgrounds
  bg: '#F4F7FF',
  surface: '#FFFFFF',
  surfaceUp: '#EEF3FF',
  border: '#DDE4F0',

  // Brand accent
  accent: '#1E56D9',
  accentGlow: 'rgba(30,86,217,0.20)',
  accentDim: '#DCE8FF',

  // Status
  green: '#16A34A',
  greenGlow: 'rgba(22,163,74,0.2)',
  red: '#DC2626',

  // Text
  text: '#0D1B3E',
  textSub: '#4A5F85',
  textMuted: '#8FA3C0',

  // Tab bar
  tabActive: '#1E56D9',
  tabInactive: '#8FA3C0',

  // Surfaces
  headerBg: 'rgba(255,255,255,0.97)',
  drawerBg: '#FFFFFF',
  white: '#ffffff',
  scanOverlay: 'rgba(0,0,0,0.55)',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  xxl: 40,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

export const Typography = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 28,
} as const;

export const Layout = {
  headerHeight: Platform.OS === 'ios' ? 90 : 70,
  headerPaddingTop: Platform.OS === 'ios' ? 44 : 24,
  bottomBarHeight: 80,
  drawerPaddingTop: Platform.OS === 'ios' ? 50 : 30,
  iosPaddingBottom: Platform.OS === 'ios' ? 16 : 4,
} as const;
