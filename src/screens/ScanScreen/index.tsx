import React, { useEffect, useRef, useState } from 'react';
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
import { Camera, useCameraDevice, useFrameProcessor } from 'react-native-vision-camera';
import { useFaceDetector } from 'react-native-vision-camera-face-detector';
import { Worklets } from 'react-native-worklets-core';
import { Ionicons } from '@expo/vector-icons';
import { Easing } from 'react-native';
import { Colors } from '../../constants/theme';
import { styles } from './styles';

interface Props {
  hasCameraPermission: boolean;
  requestCameraPermission: () => Promise<boolean>;
  busy: boolean;
  error: string;
  capturedImage?: string | null;
  scanResult?: any;
  onClearScanResult?: () => void;
  onScan: (ref: React.RefObject<Camera | null>) => void;
}

export function ScanScreen({
  hasCameraPermission,
  requestCameraPermission,
  busy,
  error,
  capturedImage,
  scanResult,
  onClearScanResult,
  onScan,
}: Props) {
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('front');
  
  const scanAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Face alignment state (updated from worklet)
  const [isFaceAligned, setIsFaceAligned] = useState(false);

  const { detectFaces } = useFaceDetector({
    performanceMode: 'fast',
    contourMode: 'none',
    landmarkMode: 'none',
  });

  // Safely update JS state from the frame processor
  const setFaceAlignedJS = Worklets.createRunOnJS((aligned: boolean) => {
    setIsFaceAligned(aligned);
  });

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    const faces = detectFaces(frame);
    
    // Very basic alignment check: just check if exactly 1 face is present and large enough.
    // Production would calculate face bounds against screen coordinates.
    if (faces.length === 1) {
      const face = faces[0];
      // simplistic check: bounding box width > 20% of frame
      if (face.bounds.width > frame.width * 0.2) {
        setFaceAlignedJS(true);
      } else {
        setFaceAlignedJS(false);
      }
    } else {
      setFaceAlignedJS(false);
    }
  }, [detectFaces]);

  // Scanner beam animation
  useEffect(() => {
    const scanLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: 380, // Height of the cutout
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

  // Pulsing border glow animation
  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    if (busy) {
      pulseLoop.start();
    } else {
      pulseAnim.setValue(1);
    }
    return () => pulseLoop.stop();
  }, [busy]);

  // ── Auto-Capture Logic ──────────────────────────────────────────────────
  useEffect(() => {
    // If not busy, no result is shown, camera ready, and face is aligned
    if (!busy && !scanResult && !error && isFaceAligned && hasCameraPermission) {
      onScan(cameraRef);
    }
  }, [busy, scanResult, error, isFaceAligned, hasCameraPermission, onScan]);

  // If there's an error, dismiss it quickly to resume scanning
  useEffect(() => {
    if (error && onClearScanResult) {
      const timer = setTimeout(() => {
        onClearScanResult(); 
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [error, onClearScanResult]);

  // ── Auto-Dismiss Success Screen ───────────────────────────────────────────
  useEffect(() => {
    if (scanResult && onClearScanResult) {
      const timer = setTimeout(() => {
        onClearScanResult();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [scanResult, onClearScanResult]);

  if (!hasCameraPermission) {
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

  if (device == null) {
    return (
      <View style={styles.permCenter}>
        <ActivityIndicator color={Colors.accent} size="large" />
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
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={!busy && !scanResult && !capturedImage}
          frameProcessor={frameProcessor}
          photo={true}
        />
      )}

      {/* Overlay UI */}
      <View style={styles.overlayContainer} pointerEvents="box-none">
        <View style={styles.cutoutWrapper}>
          <View style={styles.cutoutHole}>
            <Animated.View style={[styles.beam, { transform: [{ translateY: scanAnim }] }]} />
          </View>
        </View>

        <Animated.View 
          style={[styles.cutoutBorder, { 
            transform: [{ scale: pulseAnim }],
            opacity: pulseAnim.interpolate({ inputRange: [1, 1.5], outputRange: [1, 0] })
          }]} 
          pointerEvents="none" 
        />
        <View style={styles.cutoutBorder} pointerEvents="none" />

        {/* Bottom panel */}
        <View style={styles.bottomPanel} pointerEvents="box-none">
          <View style={styles.statusPill}>
            <View style={[styles.statusDot, { backgroundColor: busy ? Colors.warning : Colors.accent }]} />
            <Text style={styles.statusText}>
              {busy ? 'Scanning...' : 'Position face to scan'}
            </Text>
          </View>

          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠ {error}</Text>
            </View>
          )}
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
