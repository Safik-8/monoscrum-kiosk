import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Image, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { styles } from './styles';
import { Session } from '../../types';
import { useHistory } from '../../hooks/useHistory';

interface Props {
  session: Session | null;
  onSelectedUserChange?: (user: any | null) => void;
  selectedUserOverride?: any | null;
}

export function HistoryScreen({ session, onSelectedUserChange, selectedUserOverride }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const {
    users,
    searchQuery,
    setSearchQuery,
    selectedUser,
    setSelectedUser,
    targetDate,
    changeDate,
    historyResult,
    branchHistory,
    refresh,
    refreshBranchHistory,
    busy,
  } = useHistory(session);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (selectedUser) {
        await refresh();
      } else {
        await refreshBranchHistory();
      }
    } finally {
      setRefreshing(false);
    }
  }, [selectedUser, refresh, refreshBranchHistory]);

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.substring(0, 2).toUpperCase();
  };

  React.useEffect(() => {
    if (selectedUserOverride !== undefined) {
      setSelectedUser(selectedUserOverride);
    }
  }, [selectedUserOverride]);

  const handleSelectUser = (user: any) => {
    setSelectedUser(user);
    onSelectedUserChange?.(user);
    setDropdownOpen(false);
    setSearchQuery('');
  };

  const clearUser = () => {
    setSelectedUser(null);
    onSelectedUserChange?.(null);
  };

  const isToday = () => {
    const today = new Date();
    return targetDate.getDate() === today.getDate() &&
           targetDate.getMonth() === today.getMonth() &&
           targetDate.getFullYear() === today.getFullYear();
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
      
        {/* User Selection */}
        {!selectedUser && (
          <View style={styles.dropdownContainer}>
            <View style={styles.dropdownInput}>
              <Ionicons name="search" size={20} color={Colors.textSub} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search Employee..."
                placeholderTextColor={Colors.textSub}
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  setDropdownOpen(true);
                }}
                onFocus={() => setDropdownOpen(true)}
              />
              {busy && !users.length && <ActivityIndicator size="small" color={Colors.accent} />}
            </View>

            {dropdownOpen && (
              <ScrollView style={styles.dropdownList} keyboardShouldPersistTaps="handled">
                {users.length > 0 ? (
                  users.map(u => (
                    <Pressable key={u._id} style={styles.userItem} onPress={() => handleSelectUser(u)}>
                      <View style={styles.userAvatar}>
                        {u.profileImage ? (
                          <Image source={{ uri: u.profileImage }} style={{ width: 40, height: 40, borderRadius: 20 }} />
                        ) : (
                          <Text style={styles.userInitials}>{getInitials(u.fullName || u.username)}</Text>
                        )}
                      </View>
                      <View>
                        <Text style={styles.userName}>{u.fullName || u.name || u.username}</Text>
                        <Text style={styles.userRole}>Employee ID: {u._id.substring(u._id.length - 6)}</Text>
                      </View>
                    </Pressable>
                  ))
                ) : (
                  <Text style={styles.noUsersText}>No employees found.</Text>
                )}
              </ScrollView>
            )}

            {/* Branch History List */}
            <View style={styles.branchHistoryContainer}>
              <View style={styles.branchHistoryHeaderRow}>
                <Text style={styles.branchHistoryTitle}>Today's Scans</Text>
                <Pressable onPress={refreshBranchHistory}>
                  <Ionicons name="refresh" size={20} color={Colors.accent} />
                </Pressable>
              </View>

              {!branchHistory.length && !busy ? (
                <View style={styles.emptyBranchState}>
                  <Ionicons name="finger-print-outline" size={48} color={Colors.border} />
                  <Text style={styles.emptyBranchText}>No scans recorded yet today.</Text>
                </View>
              ) : (
                branchHistory.map((record) => (
                  <Pressable 
                    key={record.id} 
                    style={styles.branchHistoryCard}
                    onPress={() => {
                      const userObj = users.find(u => u._id === record.employeeId);
                      if (userObj) handleSelectUser(userObj);
                    }}
                  >
                    <View style={styles.branchUserAvatar}>
                      {record.profileImage ? (
                        <Image source={{ uri: record.profileImage }} style={{ width: 44, height: 44, borderRadius: 22 }} />
                      ) : (
                        <Text style={styles.userInitials}>{getInitials(record.name)}</Text>
                      )}
                    </View>
                    <View style={styles.branchUserDetails}>
                      <Text style={styles.branchUserName}>{record.name}</Text>
                      <View style={styles.branchStatusRow}>
                        <View style={[styles.statusDot, { backgroundColor: record.status === 'PRESENT' ? Colors.success : Colors.warning }]} />
                        <Text style={styles.branchStatusText}>
                          {record.status === 'PRESENT' ? 'Checked In' : 'Checked Out'}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.branchTimeDetails}>
                      <Text style={styles.branchTimeLabel}>In: {record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</Text>
                      {record.checkOut && (
                        <Text style={styles.branchTimeLabel}>Out: {new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                      )}
                    </View>
                  </Pressable>
                ))
              )}
            </View>
          </View>
        )}

        {/* Date Navigation & Timeline */}
        {selectedUser && (
          <>
            <View style={styles.dateHeader}>
              <Pressable style={styles.dateBtn} onPress={() => changeDate(-1)} hitSlop={8}>
                <Ionicons name="chevron-back" size={20} color={Colors.text} />
              </Pressable>
              
              <Text style={styles.dateText}>
                {isToday() ? 'Today' : targetDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
              </Text>
              
              <Pressable style={styles.dateBtn} onPress={() => changeDate(1)} disabled={isToday()} hitSlop={8}>
                <Ionicons name="chevron-forward" size={20} color={isToday() ? '#CBD5E1' : Colors.text} />
              </Pressable>
            </View>

            <View style={styles.timelineSection}>
              <Text style={styles.timelineSectionTitle}>Activity Timeline</Text>
              
              {busy ? (
                <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 32 }} />
              ) : !historyResult?.attendance?.sessions?.length ? (
                <Text style={styles.emptyStateText}>No attendance recorded for this date.</Text>
              ) : (
                historyResult.attendance.sessions.map((session: any, index: number) => {
                  const checkInTime = session.checkIn?.time || session.checkIn;
                  const checkOutTime = session.checkOut?.time || session.checkOut;
                  const validCheckIn = checkInTime ? new Date(checkInTime) : null;
                  const validCheckOut = checkOutTime ? new Date(checkOutTime) : null;
                  
                  let durationStr = '';
                  if (validCheckIn && validCheckOut && !isNaN(validCheckIn.getTime()) && !isNaN(validCheckOut.getTime())) {
                    const diffMs = validCheckOut.getTime() - validCheckIn.getTime();
                    const diffMins = Math.floor(diffMs / 60000);
                    const hours = Math.floor(diffMins / 60);
                    const mins = diffMins % 60;
                    if (hours > 0) durationStr = `${hours}h ${mins}m`;
                    else durationStr = `${mins}m`;
                  }

                  return (
                    <View key={index} style={styles.flatSessionRow}>
                      {/* Check In Column */}
                      <View style={styles.sessionPoint}>
                        <View style={styles.sessionTypeRow}>
                          <View style={styles.inIconBadge}>
                            <Ionicons name="arrow-down" size={13} color="#10B981" />
                          </View>
                          <Text style={styles.sessionLabel}>Check In</Text>
                        </View>
                        <Text style={styles.sessionTime}>
                          {validCheckIn && !isNaN(validCheckIn.getTime()) 
                            ? validCheckIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : '--:--'}
                        </Text>
                      </View>

                      {/* Duration Indicator */}
                      <View style={styles.sessionDurationCol}>
                        <View style={styles.durationPill}>
                          <Text style={styles.durationPillText}>
                            {validCheckOut && !isNaN(validCheckOut.getTime()) 
                              ? (durationStr || session.duration + 'm')
                              : 'In Progress'}
                          </Text>
                        </View>
                      </View>

                      {/* Check Out Column */}
                      <View style={[styles.sessionPoint, { alignItems: 'flex-end' }]}>
                        <View style={[styles.sessionTypeRow, { justifyContent: 'flex-end' }]}>
                          <Text style={styles.sessionLabel}>Check Out</Text>
                          <View style={styles.outIconBadge}>
                            <Ionicons name="arrow-up" size={13} color="#F59E0B" />
                          </View>
                        </View>
                        <Text style={styles.sessionTime}>
                          {validCheckOut && !isNaN(validCheckOut.getTime()) 
                            ? validCheckOut.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : '--:--'}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
