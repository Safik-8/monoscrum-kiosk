import { StyleSheet, Platform, StatusBar } from 'react-native';
import { Colors, Radius } from '../../constants/theme';

// Both side slots must be identical width — this is what guarantees true center
const SIDE_SLOT_WIDTH = 52;
const CONTENT_ROW_HEIGHT = 58;

export const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0', // border-slate-200 only, no shadows
    zIndex: 50,
  },

  // Explicit safe-area spacer — cleanly separated from the content row
  safeAreaSpacer: {
    height: Platform.OS === 'ios' ? 50 : Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0,
  },

  // Main content row — fixed height, all children share the same vertical midline
  contentRow: {
    height: CONTENT_ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',          // vertically centers all direct children
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },

  // ── Brand Cluster (Logo + Title adjacent) ──────────────────────────────────
  brandCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    includeFontPadding: false,
    letterSpacing: -0.3,
  },

  // ── Premium Avatar ────────────────────────────────────────────────────────
  avatarBtn: {
    position: 'relative',
    padding: 2,
  },
  avatarBtnPressed: {
    opacity: 0.75,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9', // light slate surface
    borderWidth: 1,
    borderColor: '#E2E8F0',    // border-slate-200
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOnlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981', // green active session dot
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  backBtn: {
    padding: 6,
    marginLeft: -6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarImg: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  userAvatarInitials: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    includeFontPadding: false,
  },
});
