import { Dimensions, StyleSheet, Platform, StatusBar } from 'react-native';
import { Colors, Layout } from '../../constants/theme';
import { DRAWER_WIDTH_RATIO } from '../../constants/config';

const DRAWER_WIDTH = Dimensions.get('window').width * DRAWER_WIDTH_RATIO;

export const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 200,
    elevation: 100,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_WIDTH,
    backgroundColor: Colors.drawerBg,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 25,
  },
  inner: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 20 : Layout.drawerPaddingTop,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  brandTag: {
    fontSize: 10,
    color: Colors.textSub,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.surfaceUp,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  closeIcon: {
    fontSize: 13,
    color: Colors.textSub,
  },

  // Operator card
  operatorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surfaceUp,
    borderRadius: 14,
    padding: 14,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  operatorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accentDim,
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  operatorAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.accent,
  },
  operatorName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.green,
  },
  statusText: {
    fontSize: 11,
    color: Colors.textSub,
  },

  // Nav items
  navSectionLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 2,
    fontWeight: '700',
    marginBottom: 10,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  navItemActive: {
    backgroundColor: Colors.surfaceUp,
  },
  navIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  navIconActive: {
    backgroundColor: Colors.accentDim,
    borderColor: Colors.accent,
  },
  navIconText: {
    fontSize: 16,
    color: Colors.textSub,
  },
  navIconTextActive: {
    color: Colors.accent,
  },
  navLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSub,
  },
  navLabelActive: {
    color: Colors.text,
  },
  navDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  activeIndicator: {
    width: 4,
    height: 28,
    borderRadius: 2,
    backgroundColor: Colors.accent,
  },

  // Footer
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 16,
  },
  // Override marginBottom on operatorCard when inside footer
  operatorCardFooter: {
    marginBottom: 12,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(220,38,38,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.2)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  logoutBtnDisabled: {
    opacity: 0.5,
  },
  logoutIcon: {
    fontSize: 18,
    color: Colors.red,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.red,
  },
  versionText: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
