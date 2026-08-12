import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
  ActivityIndicator,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Easing } from 'react-native';
import { Colors } from '../../constants/theme';
import { styles } from './styles';

interface Props {
  cameraPermission: ReturnType<typeof useCameraPermissions>[0];
  requestCameraPermission: ReturnType<typeof useCameraPermissions>[1];
  cameraRef: React.RefObject<CameraView | null>;
  busy: boolean;
  error: string;
  capturedImage?: string | null;
  scanResult?: any;
  onClearScanResult?: () => void;
  onScan: () => void;
}

export function ScanScreen({
  cameraPermission,
  requestCameraPermission,
  cameraRef,
  busy,
  error,
  capturedImage,
  scanResult,
  onClearScanResult,
  onScan,
}: Props) {
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const scanLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 220,
          duration: 2200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: 0,
          duration: 2200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );
    scanLoop.start();
    return () => scanLoop.stop();
  }, []);

  if (!cameraPermission) {
    return (
      <View style={styles.permCenter}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  if (!cameraPermission.granted) {
    return (
      <View style={styles.permCenter}>
        <Ionicons name="camera-outline" size={48} color={Colors.accent} style={{ marginBottom: 16 }} />
        <Text style={styles.permTitle}>Camera Access Required</Text>
        <Text style={styles.permText}>
          MonoScrum Kiosk needs camera access to scan attendance.
        </Text>
        <Pressable style={styles.permBtn} onPress={requestCameraPermission}>
          <Text style={styles.permBtnText}>Allow Camera Access</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      {/* Live camera or Captured Preview */}
      {capturedImage ? (
        <Image
          source={{ uri: capturedImage }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      ) : (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="front"
          mirror
          onCameraReady={() => {}}
        />
      )}

      {/* Overlay UI */}
      <View style={styles.overlayContainer} pointerEvents="box-none">
        {/* Top darkened area */}
        <View style={styles.overlayTop} />

        {/* Cutout row */}
        <View style={styles.middleRow}>
          <View style={styles.side} />
          <View style={styles.cutout}>
            {/* Corner brackets */}
            <View style={[styles.corner, styles.cTL]} />
            <View style={[styles.corner, styles.cTR]} />
            <View style={[styles.corner, styles.cBL]} />
            <View style={[styles.corner, styles.cBR]} />
            {/* Scan beam */}
            <Animated.View style={[styles.beam, { transform: [{ translateY: scanAnim }] }]} />
            {/* Face guide oval */}
            <View style={styles.faceOval} />
          </View>
          <View style={styles.side} />
        </View>

        {/* Bottom panel */}
        <View style={styles.bottomPanel}>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Camera Active · Face Detection Ready</Text>
          </View>

          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠ {error}</Text>
            </View>
          )}

          {/* <Text style={styles.hint}>Position your face inside the frame</Text> */}

          {/* Camera Controls */}
          <View style={styles.cameraControls}>
            <Pressable style={styles.secondaryBtn}>
              <Ionicons name="refresh-outline" size={24} color={styles.secondaryBtnIcon.color} />
            </Pressable>

            <Pressable
              style={[styles.captureBtn, busy && styles.captureBtnDisabled]}
              onPress={onScan}
              disabled={busy}
            >
              <View style={styles.captureBtnInner}>
                {busy ? (
                  <ActivityIndicator color={Colors.accent} size="large" />
                ) : (
                  <View style={styles.captureBtnCore} />
                )}
              </View>
            </Pressable>

            <Pressable style={styles.secondaryBtn}>
              <Ionicons name="flash-outline" size={24} color={styles.secondaryBtnIcon.color} />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Success/Result Overlay */}
      {scanResult && (
        <View style={styles.resultOverlay}>
          <ScrollView contentContainerStyle={styles.resultContent} showsVerticalScrollIndicator={false}>
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                {scanResult.user?.profileImage ? (
                  <Image source={{ uri: scanResult.user.profileImage }} style={styles.resultAvatar} />
                ) : (
                  <View style={styles.resultAvatar}>
                    <Text style={styles.resultAvatarText}>
                      {(scanResult.user?.fullName || 'User').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <Text style={styles.resultName}>{scanResult.user?.fullName || 'Unknown'}</Text>
                
                <View style={[styles.statusBadge, 
                  { backgroundColor: scanResult.attendance?.status === 'PRESENT' ? Colors.success : Colors.warning }
                ]}>
                  <Text style={styles.statusBadgeText}>
                    {scanResult.attendance?.status === 'PRESENT' ? 'CHECKED IN' : 'CHECKED OUT'}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.timelineTitle}>Today's Activity</Text>
              
              {scanResult.attendance?.sessions?.map((session: any, index: number) => {
                const checkInTime = session.checkIn?.time || session.checkIn;
                const checkOutTime = session.checkOut?.time || session.checkOut;
                const validCheckIn = checkInTime ? new Date(checkInTime) : null;
                const validCheckOut = checkOutTime ? new Date(checkOutTime) : null;
                
                // Calculate duration in minutes if both exist
                let durationStr = '';
                if (validCheckIn && validCheckOut) {
                  const diffMs = validCheckOut.getTime() - validCheckIn.getTime();
                  const diffMins = Math.floor(diffMs / 60000);
                  const hours = Math.floor(diffMins / 60);
                  const mins = diffMins % 60;
                  if (hours > 0) durationStr = `${hours}h ${mins}m`;
                  else durationStr = `${mins}m`;
                }

                return (
                  <View key={index} style={styles.timelineRow}>
                    <View style={styles.timelineIconContainer}>
                      <Ionicons name="log-in" size={20} color={Colors.success} style={{ marginLeft: 4 }} />
                    </View>
                    <View style={styles.timelineDetails}>
                      <Text style={styles.timelineAction}>Check In</Text>
                      <Text style={styles.timelineTime}>
                        {validCheckIn && !isNaN(validCheckIn.getTime()) 
                          ? validCheckIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '--:--'}
                      </Text>
                    </View>
                    
                    {validCheckOut && !isNaN(validCheckOut.getTime()) ? (
                      <>
                        <View style={styles.timelineDurationContainer}>
                          <View style={styles.timelineLine} />
                          <Text style={styles.timelineDurationText}>{durationStr || session.duration + 'm'}</Text>
                          <View style={styles.timelineLine} />
                        </View>
                        <View style={styles.timelineIconContainer}>
                          <Ionicons name="log-out" size={20} color={Colors.warning} style={{ marginRight: 2 }} />
                        </View>
                        <View style={[styles.timelineDetails, { alignItems: 'flex-end' }]}>
                          <Text style={styles.timelineAction}>Check Out</Text>
                          <Text style={styles.timelineTime}>
                            {validCheckOut.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                      </>
                    ) : (
                      <View style={{ flex: 1, alignItems: 'flex-end', justifyContent: 'center' }}>
                        <Text style={[styles.timelineTime, { color: Colors.success, fontStyle: 'italic' }]}>
                          Active Now
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}

              <Pressable style={styles.doneBtn} onPress={onClearScanResult}>
                <Text style={styles.doneBtnText}>Done</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      )}

    </View>
  );
}
