import React, { useRef } from 'react';
import { View, Text, TextInput, FlatList, Pressable, ActivityIndicator, Image, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Colors } from '../../constants/theme';
import { styles } from './styles';
import { useEnroll } from '../../hooks/useEnroll';
import { Session } from '../../types';

export function NewScreen({ session }: { session: Session | null }) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const [isModalReady, setIsModalReady] = React.useState(false);
  
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
    cancelEnrollment
  } = useEnroll(session);

  React.useEffect(() => {
    if (!selectedUser) {
      setIsModalReady(false);
    }
  }, [selectedUser]);

  // Loading state (permissions not loaded)
  if (!permission) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  // Permission denied UI
  if (!permission.granted) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Ionicons name="camera-outline" size={48} color={Colors.accent} style={{ marginBottom: 16 }} />
        <Text style={styles.heroTitle}>Camera Access Required</Text>
        <Text style={styles.heroSubtitle}>We need camera access to enroll faces.</Text>
        <Pressable style={[styles.captureBtnInner, { width: 200, height: 48, borderRadius: 24, marginTop: 20, backgroundColor: Colors.accent }]} onPress={requestPermission}>
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
          <View style={styles.hero}>
            <Ionicons name="person-add-outline" size={32} color={Colors.accent} style={{ marginBottom: 12 }} />
            <Text style={styles.heroTitle}>Face Enrollment</Text>
            <Text style={styles.heroSubtitle}>Select an employee to enroll their face into the Kiosk AI.</Text>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Search employees..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {busy && users.length === 0 ? (
            <ActivityIndicator color={Colors.accent} style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={users}
              keyExtractor={u => u._id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <Pressable style={styles.userCard} onPress={() => setSelectedUser(item)}>
                  {item.profilePicture ? (
                    <Image source={{ uri: item.profilePicture }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{item.name?.charAt(0).toUpperCase()}</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.userName}>{item.name}</Text>
                      {item.isFaceEnrolled && (
                        <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                          <Text style={{ color: '#10B981', fontSize: 10, fontWeight: 'bold' }}>ENROLLED</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.userHandle}>@{item.username || 'employee'}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} style={styles.chevron} />
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
        >
          <View style={styles.cameraContainer}>
            {isModalReady && (
              capturedImage ? (
                 <Image source={{ uri: capturedImage }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              ) : (
                 <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="front" mirror />
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
                
                {/* Placeholder for symmetry */}
                <View style={{ width: 44 }} />
              </View>

              {/* Error Display */}
              {error ? (
                <View style={{ backgroundColor: 'rgba(255,0,0,0.8)', padding: 12, borderRadius: 12, marginHorizontal: 20 }}>
                  <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>{error}</Text>
                </View>
              ) : null}

              {/* Bottom Controls */}
              <View style={styles.captureContainer}>
                <Pressable style={styles.captureBtn} onPress={() => captureAndEnroll(cameraRef)} disabled={busy || success}>
                  <View style={styles.captureBtnInner}>
                    {busy ? <ActivityIndicator color={Colors.accent} size="large" /> : <Ionicons name="camera" size={32} color={Colors.accent} />}
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
