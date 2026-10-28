import { StyleSheet } from 'react-native';
import { Colors, Radius } from '../../constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 90,
  },
  
  // Compact Profile Row (Native Android Account style)
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
    marginBottom: 20,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
  },
  profileDetails: {
    flex: 1,
  },
  operatorName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    letterSpacing: -0.2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.green,
  },
  statusText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },

  // Android Settings Section Headers
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.8,
    marginTop: 8,
    marginBottom: 6,
    textTransform: 'uppercase',
  },

  // Flat Info Rows with Hairline Dividers
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
    gap: 16,
  },
  infoLabelGroup: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
    flexShrink: 0,
    includeFontPadding: false,
  },
  infoSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    includeFontPadding: false,
  },
  infoValue: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    includeFontPadding: false,
  },

  // Android Settings Pill / Badge
  valBadge: {
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    minWidth: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    includeFontPadding: false,
  },

  // Sign out button (clean, un-bulky)
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginTop: 32,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  signOutBtnDisabled: {
    opacity: 0.5,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.red,
  },
  footer: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
});
