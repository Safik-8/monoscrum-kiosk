import { StyleSheet, Platform, StatusBar } from 'react-native';
import { Colors } from '../../constants/theme';

// Both side slots must be identical width — this is what guarantees true center
const SIDE_SLOT_WIDTH = 52;
const CONTENT_ROW_HEIGHT = 54;

export const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    zIndex: 50,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
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

  // ── Side slots ────────────────────────────────────────────────────────────
  sideSlot: {
    width: SIDE_SLOT_WIDTH,
    height: CONTENT_ROW_HEIGHT,
    alignItems: 'flex-start',      // left slot: content hugs left
    justifyContent: 'center',      // vertically center within the slot
    zIndex: 2,                     // ensure it stays clickable above the absolute center
  },
  sideSlotRight: {
    alignItems: 'flex-end',        // right slot: content hugs right
  },

  // ── Center slot ───────────────────────────────────────────────────────────
  centerSlot: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',      // perfectly centered to the full header width
    gap: 8,
    zIndex: 1,                     // sits behind the side buttons
    pointerEvents: 'none',         // let clicks pass through to side buttons if they overlap
  },
  pageTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 18,
  },
  brand: {
    fontSize: 10,
    color: Colors.textSub,
    letterSpacing: 0.4,
  },

  // ── Hamburger ─────────────────────────────────────────────────────────────
  menuBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 5,
  },
  line: {
    width: 24,
    height: 2,
    backgroundColor: Colors.text,
    borderRadius: 2,
  },
  lineMid: {
    width: 16,
  },

  // ── Avatar ────────────────────────────────────────────────────────────────
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accentDim,
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.accent,
  },
});
