import { Dimensions, StyleSheet, Platform, StatusBar } from 'react-native';
import { Colors, Layout, Radius } from '../../constants/theme';
import { DRAWER_WIDTH_RATIO } from '../../constants/config';

const DRAWER_WIDTH = Math.min(Dimensions.get('window').width * 0.82, 340);

export const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 200,
    elevation: 100,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  inner: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 16 : Layout.drawerPaddingTop,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  // ── Header & Profile ──
  header: {
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.text,
    letterSpacing: -0.2,
  },
  brandTag: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  // Profile Box inside Header
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  operatorAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  operatorAvatarText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.primary,
  },
  profileTextWrap: {
    flex: 1,
  },
  operatorName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    letterSpacing: -0.2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },

  // ── Nav Items ──
  navSection: {
    gap: 4,
  },
  navSectionLabel: {
    fontSize: 11,
    color: '#94A3B8',
    letterSpacing: 1.2,
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  navItemActive: {
    backgroundColor: Colors.primaryDim,
  },
  navItemPressed: {
    backgroundColor: '#F8FAFC',
  },
  navIcon: {
    marginRight: 14,
  },
  navLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#334155',
    flex: 1,
  },
  navLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  chevronActive: {
    marginLeft: 8,
  },

  // ── Footer ──
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
    gap: 10,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
  },
  logoutBtnPressed: {
    opacity: 0.8,
  },
  logoutBtnDisabled: {
    opacity: 0.5,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
  },
  versionText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
  },
});
