import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../constants/theme';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    padding: 24,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSub,
    marginBottom: 32,
  },
  
  // Date Picker Header
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.surfaceUp,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },

  // Dropdown
  dropdownContainer: {
    position: 'relative',
    zIndex: 10,
    marginBottom: 24,
  },
  dropdownInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 60,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.text,
  },
  dropdownList: {
    position: 'absolute',
    top: 68,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    maxHeight: 250,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceUp,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInitials: {
    color: Colors.textSub,
    fontWeight: '600',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  userRole: {
    fontSize: 14,
    color: Colors.textSub,
    marginTop: 2,
  },
  noUsersText: {
    padding: 16,
    color: Colors.textSub,
    textAlign: 'center',
  },
  
  // Selected User
  selectedUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  selectedUserAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 20,
  },
  selectedUserAvatarText: {
    fontSize: 24,
  },
  selectedUserDetails: {
    flex: 1,
  },
  selectedUserName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  selectedUserHandle: {
    fontSize: 16,
    color: Colors.textSub,
    marginTop: 4,
  },
  clearUserBtn: {
    padding: 10,
  },

  // Timeline
  timelineCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 20,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.surfaceUp,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timelineIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  timelineDurationContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  timelineLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  timelineDurationText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSub,
    marginHorizontal: 8,
  },
  timelineDetails: {
    justifyContent: 'center',
  },
  timelineAction: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  timelineTime: {
    fontSize: 14,
    color: Colors.textSub,
    marginTop: 2,
  },
  emptyStateText: {
    color: Colors.textSub,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 16,
    marginBottom: 16,
  },
  
  // Branch History Styles
  branchHistoryContainer: {
    marginTop: 16,
  },
  branchHistoryHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  branchHistoryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  emptyBranchState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyBranchText: {
    color: Colors.textSub,
    marginTop: 12,
    fontSize: 16,
  },
  branchHistoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  branchUserAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceUp,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  branchUserDetails: {
    flex: 1,
  },
  branchUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  branchStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  branchStatusText: {
    fontSize: 14,
    color: Colors.textSub,
  },
  branchTimeDetails: {
    alignItems: 'flex-end',
  },
  branchTimeLabel: {
    fontSize: 12,
    color: Colors.textSub,
    marginTop: 2,
  }
});
