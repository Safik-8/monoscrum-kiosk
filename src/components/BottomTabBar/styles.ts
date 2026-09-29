import { StyleSheet } from 'react-native';
import { Colors, Layout } from '../../constants/theme';

export const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 36,
    paddingHorizontal: 8,
    shadowColor: Colors.accent,
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
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
    borderRadius: 16,
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
    fontWeight: '600',
  },
  labelActive: {
    color: Colors.tabActive,
    fontWeight: 'bold',
  },

});
