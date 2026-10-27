import React, { useRef, useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, Pressable, ActivityIndicator, Image, StyleSheet, Modal, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Colors, Radius } from '../../constants/theme';
import { styles } from './styles';
import { useEnroll } from '../../hooks/useEnroll';
import { Session } from '../../types';

export function NewScreen({ session }: { session: Session | null }) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isModalReady, setIsModalReady] = React.useState(false);
  const [cameraPosition, setCameraPosition] = React.useState<'front' | 'back'>('front');
  const [refreshing, setRefreshing] = useState(false);
  
  const {
    users,
    searchQuery,
    setSearchQuery,
    selectedUser,
    setSelectedUser,
    busy,
    error,
    success,
    capturedImage,
    captureAndEnroll,
    cancelEnrollment,
    refreshUsers
  } = useEnroll(session);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshUsers();
    } finally {
      setRefreshing(false);
    }
  }, [refreshUsers]);

  React.useEffect(() => {
    if (!selectedUser) {
      setIsModalReady(false);
    }
  }, [selectedUser]);

  // Loading state (permissions not loaded)
  if (!permission) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  // Permission denied UI
  if (!permission?.granted) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Ionicons name="camera-outline" size={48} color={Colors.primary} style={{ marginBottom: 16 }} />
        <Text style={styles.permTitle}>Camera Access Required</Text>
        <Text style={styles.permSubtitle}>We need camera access to enroll faces.</Text>
        <Pressable style={[styles.captureBtnInner, { width: 200, height: 48, borderRadius: Radius.button, marginTop: 20, backgroundColor: Colors.primary }]} onPress={requestPermission}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>Allow Camera Access</Text>
        </Pressable>
      </View>
    );
  }

  // Main UI
  return (
    <View style={styles.container}>
      
      {/* Search and List State */}
      {!selectedUser && (
        <View style={styles.content}>
          {/* Mobile Contacts-style Search Bar */}
          <View style={styles.searchWrap}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={18} color="#94A3B8" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search contacts..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
              />
              {!!searchQuery && (
                <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </Pressable>
              )}
            </View>
          </View>

          {busy && users.length === 0 ? (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={users}
              keyExtractor={u => u._id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[Colors.primary]}
                  tintColor={Colors.primary}
                />
              }
              renderItem={({ item, index }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.contactRow,
                    index < users.length - 1 && styles.contactRowDivider,
                    pressed && styles.contactRowPressed,
                  ]}
                  onPress={() => setSelectedUser(item)}
                >
                  {item.profilePicture ? (
                    <Image source={{ uri: item.profilePicture }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{item.name?.charAt(0).toUpperCase() || '?'}</Text>
                    </View>
                  )}

                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.handle}>@{item.username || 'employee'}</Text>
                  </View>

                  {item.isFaceEnrolled ? (
                    <View style={styles.statusBadge}>
                      <Ionicons name="checkmark-circle" size={12} color="#059669" />
                      <Text style={styles.statusBadgeText}>Enrolled</Text>
                    </View>
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color="#CBD5E1" style={styles.chevron} />
                  )}
                </Pressable>
              )}
            />
          )}
        </View>
      )}

      {/* Camera Capture State */}
      {selectedUser && (
        <Modal 
          visible={!!selectedUser} 
          animationType="slide" 
          transparent={false}
          onShow={() => setIsModalReady(true)}
          onRequestClose={cancelEnrollment}
        >
          <View style={styles.cameraContainer}>
            {isModalReady && (
              capturedImage ? (
                 <Image source={{ uri: capturedImage }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              ) : (
                 <CameraView 
                   ref={cameraRef} 
                   style={StyleSheet.absoluteFill} 
                   facing={cameraPosition} 
                 />
              )
            )}

            <View style={styles.overlayContainer} pointerEvents="box-none">
              
              {/* Top Bar */}
              <View style={styles.headerRow}>
                <Pressable style={styles.backBtn} onPress={cancelEnrollment} disabled={busy || success}>
                  <Ionicons name="arrow-back" size={24} color="#fff" />
                </Pressable>
                
                <View style={styles.enrollTarget}>
                  <Text style={styles.enrollTargetText}>Enrolling: {selectedUser.name}</Text>
                </View>
                
                {/* Toggle Camera Button */}
                <Pressable 
                  style={styles.backBtn} 
                  onPress={() => setCameraPosition(p => p === 'front' ? 'back' : 'front')} 
                  disabled={busy || success}
                >
                  <Ionicons name="camera-reverse-outline" size={24} color="#fff" />
                </Pressable>
              </View>

              {/* Error Display */}
              {error ? (
                <View style={{ backgroundColor: 'rgba(255,0,0,0.8)', padding: 12, borderRadius: Radius.input, marginHorizontal: 20 }}>
                  <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>{error}</Text>
                </View>
              ) : null}

              {/* Bottom Controls */}
              <View style={styles.captureContainer}>
                <Pressable style={styles.captureBtn} onPress={() => captureAndEnroll(cameraRef)} disabled={busy || success}>
                  <View style={styles.captureBtnInner}>
                    {busy ? <ActivityIndicator color={Colors.primary} size="large" /> : <Ionicons name="camera" size={32} color={Colors.primary} />}
                  </View>
                </Pressable>
              </View>
            </View>

            {/* Success Toast Overlay inside Modal */}
            {success && (
              <View style={styles.toastOverlay}>
                <View style={styles.toastContent}>
                  <Ionicons name="checkmark-circle" size={80} color={Colors.success || '#10B981'} />
                  <Text style={styles.toastTitle}>Enrolled!</Text>
                  <Text style={styles.toastSub}>{selectedUser?.name}'s face has been successfully secured in the AI database.</Text>
                </View>
              </View>
            )}
          </View>
        </Modal>
      )}

    </View>
  );
}
