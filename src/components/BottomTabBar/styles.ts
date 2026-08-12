import { StyleSheet } from 'react-native';
import { Colors, Layout } from '../../constants/theme';

export const styles = StyleSheet.create({
  bar: {
    height: Layout.bottomBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 16,
    paddingBottom: Layout.iosPaddingBottom,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  iconWrapActive: {
    backgroundColor: Colors.accentDim,
  },
  icon: {
    fontSize: 18,
    color: Colors.tabInactive,
  },
  iconActive: {
    color: Colors.tabActive,
  },
  label: {
    fontSize: 11,
    color: Colors.tabInactive,
    fontWeight: '600',
  },
  labelActive: {
    color: Colors.tabActive,
  },

  // Center flush scan button
  scanWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  scanBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  scanBtnActive: {
    shadowOpacity: 0.7,
  },
  scanIcon: {
    fontSize: 26,
    color: Colors.white,
  },
  scanLabel: {
    marginTop: 4,
  },
});
