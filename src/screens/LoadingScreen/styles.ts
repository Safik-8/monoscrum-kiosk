import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../constants/theme';

const { width } = Dimensions.get('window');
const illustrationWidth = Math.min(width * 0.78, 320);

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 50,
    paddingHorizontal: 24,
  },
  topSpace: {
    flex: 0.6,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  illustrationContainer: {
    width: illustrationWidth,
    height: illustrationWidth * 0.95,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
  },
  brandTextWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandFirst: {
    fontSize: 24,
    fontWeight: '500',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  brandSecond: {
    fontSize: 24,
    fontWeight: '500',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  tagline: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    marginTop: 6,
  },
  bottomSection: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    paddingBottom: 24,
  },
  spinner: {
    marginBottom: 14,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
    letterSpacing: 0.3,
  },
  versionText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 8,
    fontWeight: '500',
  },
});
