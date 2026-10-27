import { StyleSheet } from 'react-native';
import { Colors, Radius } from '../../constants/theme';

export const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0', // border-slate-200 only, no shadows
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconWrap: {
    width: 60,
    height: 32,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  iconWrapActive: {
    // No background rectangle
  },
  icon: {
    fontSize: 18,
    color: Colors.tabInactive,
  },
  iconActive: {
    color: Colors.tabActive,
  },
  label: {
    fontSize: 12,
    color: Colors.tabInactive,
    fontWeight: '500',
    textAlign: 'center',
    includeFontPadding: false,
    letterSpacing: -0.1,
  },
  labelActive: {
    color: Colors.tabActive,
    fontWeight: '500',
  },

});
