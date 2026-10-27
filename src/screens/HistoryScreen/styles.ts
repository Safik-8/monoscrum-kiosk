import { StyleSheet, Dimensions } from 'react-native';
import { Colors, Radius } from '../../constants/theme';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 90,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSub,
    marginBottom: 16,
  },
  
  // Date Picker Header (Minimal native row)
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
    marginBottom: 16,
  },
  dateBtn: {
    padding: 6,
    borderRadius: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    includeFontPadding: false,
    letterSpacing: -0.2,
  },

  // Dropdown & Search Bar
  dropdownContainer: {
    position: 'relative',
    zIndex: 10,
  },
  dropdownInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: Colors.text,
    paddingVertical: 0,
    includeFontPadding: false,
  },
  dropdownList: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    maxHeight: 250,
    overflow: 'hidden',
    zIndex: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  userInitials: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 15,
    includeFontPadding: false,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    includeFontPadding: false,
  },
  userRole: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    includeFontPadding: false,
  },
  noUsersText: {
    padding: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  


  // Flat Native Activity Timeline
  timelineSection: {
    paddingVertical: 8,
  },
  timelineSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.8,
    marginTop: 8,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  flatSessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },
  sessionPoint: {
    width: '34%',
  },
  sessionTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  inIconBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outIconBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    includeFontPadding: false,
  },
  sessionTime: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    includeFontPadding: false,
    letterSpacing: -0.2,
  },
  sessionDurationCol: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '32%',
  },
  durationPill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  durationPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    includeFontPadding: false,
  },
  emptyStateText: {
    color: '#64748B',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 24,
    marginBottom: 24,
  },
  
  // Branch History Styles
  branchHistoryContainer: {
    marginTop: 4,
  },
  branchHistoryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 4,
  },
  branchHistoryTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  emptyBranchState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
    paddingHorizontal: 20,
  },
  emptyBranchText: {
    color: '#64748B',
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  branchHistoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  branchUserAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryDim,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  branchUserDetails: {
    flex: 1,
  },
  branchUserName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  branchStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  branchStatusText: {
    fontSize: 13,
    color: '#64748B',
  },
  branchTimeDetails: {
    alignItems: 'flex-end',
  },
  branchTimeLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  }
});
