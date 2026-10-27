import { StyleSheet } from 'react-native';
import { Colors, Radius } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20, // Clean side gutters
  },
  permTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  permSubtitle: {
    fontSize: 14,
    color: Colors.textSub,
    textAlign: 'center',
    marginBottom: 20,
  },
  searchWrap: {
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    paddingVertical: 0,
  },
  listContainer: {
    paddingBottom: 80,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    backgroundColor: '#FFFFFF',
  },
  contactRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  contactRowPressed: {
    backgroundColor: '#F8FAFC',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.primary,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    letterSpacing: -0.2,
  },
  handle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
    marginRight: 4,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  chevron: {
    marginLeft: 'auto',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  overlayContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  enrollTarget: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: Radius.pill,
  },
  enrollTargetText: {
    color: '#fff',
    fontWeight: '600',
  },
  captureContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureBtnInner: {
    width: 64,
    height: 64,
    borderRadius: Radius.pill,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastOverlay: {
    ...(StyleSheet.absoluteFill as any),
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  toastContent: {
    backgroundColor: Colors.surface,
    padding: 32,
    borderRadius: Radius.modal,
    alignItems: 'center',
    width: '80%',
    shadowColor: Colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  toastTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  toastSub: {
    fontSize: 15,
    color: Colors.textSub,
    textAlign: 'center',
  },
});
