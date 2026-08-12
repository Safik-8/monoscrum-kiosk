import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
  ActivityIndicator,
  StyleSheet,
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
  onScan: () => void;
}

export function ScanScreen({
  cameraPermission,
  requestCameraPermission,
  cameraRef,
  busy,
  error,
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
      {/* Live camera */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="front"
        mirror
        onCameraReady={() => {}}
      />

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
    </View>
  );
}
