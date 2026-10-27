import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  Modal,
  Animated,
  Platform,
  Easing,
  StatusBar,
} from 'react-native';
import { CameraView, CameraType } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { fetchWithTimeout, parseResponse } from '../../lib/http';
import { API_URL } from '../../constants/config';
import { Session } from '../../types';
import { Colors, Radius } from '../../constants/theme';
import { Logo } from '../../components/Logo';

const { width } = Dimensions.get('window');
const VIEWFINDER_SIZE = Math.min(width - 48, 380);

interface Props {
  session?: Session | null;
  hasCameraPermission: boolean;
  requestCameraPermission: () => Promise<any>;
  busy: boolean;
  error: string;
  capturedImage?: string | null;
  scanResult?: any;
  onClearScanResult?: () => void;
  onScan: (photoOutput: any) => void;
  onNavigateHistory?: () => void;
  onBack?: () => void;
  onOpenDrawer?: () => void;
}

export function ScanScreen({
  session,
  hasCameraPermission,
  requestCameraPermission,
  busy,
  error,
  capturedImage,
  scanResult,
  onClearScanResult,
  onScan,
  onNavigateHistory,
  onBack,
  onOpenDrawer,
}: Props) {
  const initial = session?.operatorName
    ? session.operatorName.charAt(0).toUpperCase()
    : 'K';
  const [facing, setFacing] = useState<CameraType>('front');
  const [stats, setStats] = useState<any>(null);
  const successAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (busy) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinAnim.stopAnimation();
      spinAnim.setValue(0);
    }
  }, [busy]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    if (scanResult && scanResult.match) {
      Animated.sequence([
        Animated.timing(successAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.delay(3500),
        Animated.timing(successAnim, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]).start();
    }
  }, [scanResult]);

  useEffect(() => {
    if (session?.accessToken && !scanResult) {
      fetchBranchStats();
    }
  }, [session, scanResult]);

  const fetchBranchStats = async () => {
    try {
      const response = await fetchWithTimeout(`${API_URL}/kiosk/branch-stats`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      const data = await parseResponse(response);
      if ((data as any).success) {
        setStats((data as any).stats);
      }
    } catch (err) {
      console.log('Failed to fetch branch stats', err);
    }
  };

  useEffect(() => {
    if (error && onClearScanResult) {
      const timer = setTimeout(() => {
        onClearScanResult();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, onClearScanResult]);

  useEffect(() => {
    if (scanResult && onClearScanResult) {
      const timer = setTimeout(() => {
        onClearScanResult();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [scanResult, onClearScanResult]);

  const toggleFacing = () => {
    setFacing((current) => (current === 'front' ? 'back' : 'front'));
  };

  if (!hasCameraPermission) {
    return (
      <View style={styles.permCenter}>
        <Ionicons name="camera-outline" size={48} color={Colors.primary} style={{ marginBottom: 16 }} />
        <Text style={styles.permTitle}>Camera Access Required</Text>
        <Text style={styles.permText}>MonoScrum Kiosk needs camera access to verify attendance.</Text>
        <Pressable style={styles.permBtn} onPress={requestCameraPermission}>
          <Text style={styles.permBtnText}>Allow Camera Access</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* ── Camera Viewfinder Area ── */}
      <View style={styles.viewfinderContainer}>
        {/* Guideline Hint directly above the rectangle camera card */}
        <View style={styles.guidelineHint}>
          <Ionicons name="shield-checkmark-outline" size={16} color={Colors.primary} />
          <Text style={styles.guidelineText}>Make sure the image is clear and well lit</Text>
        </View>

        <View style={styles.viewfinderCard}>
          {capturedImage ? (
            <Image source={{ uri: capturedImage }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing={facing}
            />
          )}

          {/* Frosted / Subtle Vignette Overlay */}
          <View style={styles.viewfinderTint} pointerEvents="none" />

          {/* 4 Corner Frame Brackets */}
          <View style={[styles.cornerBracket, styles.bracketTopLeft]} pointerEvents="none" />
          <View style={[styles.cornerBracket, styles.bracketTopRight]} pointerEvents="none" />
          <View style={[styles.cornerBracket, styles.bracketBottomLeft]} pointerEvents="none" />
          <View style={[styles.cornerBracket, styles.bracketBottomRight]} pointerEvents="none" />

          {/* Loading Ring Indicator when busy */}
          {busy && (
            <View style={styles.busyOverlay} pointerEvents="none">
              <Animated.View style={[styles.busySpinner, { transform: [{ rotate: spin }] }]} />
              <Text style={styles.busyText}>Verifying Face...</Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Bottom Controls ── */}
      <View style={styles.controlsRow}>
        {/* Left: History Button */}
        <View style={styles.controlItem}>
          <TouchableOpacity
            style={styles.circleActionButton}
            onPress={onNavigateHistory}
            activeOpacity={0.75}
          >
            <Ionicons name="time-outline" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.controlLabel}>History</Text>
        </View>

        {/* Center: Shutter Capture Button with Primary Blue Accent Ring */}
        <View style={styles.shutterWrapper}>
          <TouchableOpacity
            style={[styles.shutterOuterRing, busy && styles.shutterDisabled]}
            disabled={busy}
            onPress={() => onScan(cameraRef.current)}
            activeOpacity={0.85}
          >
            <View style={styles.shutterInnerButton} />
          </TouchableOpacity>
        </View>

        {/* Right: Flip Camera Button */}
        <View style={styles.controlItem}>
          <TouchableOpacity
            style={styles.circleActionButton}
            onPress={toggleFacing}
            activeOpacity={0.75}
          >
            <Ionicons name="sync-outline" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.controlLabel}>Flip</Text>
        </View>
      </View>

      {/* ── Attendance Verification Success Modal ── */}
      <Modal visible={!!scanResult} transparent animationType="fade">
        <View style={styles.modalBg}>
          <Animated.View
            style={[
              styles.modalCard,
              {
                opacity: successAnim,
                transform: [
                  {
                    scale: successAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View
              style={[
                styles.modalIconWrap,
                {
                  backgroundColor:
                    scanResult?.action === 'CHECKED_OUT'
                      ? 'rgba(234, 88, 12, 0.12)'
                      : Colors.primaryDim,
                },
              ]}
            >
              <Ionicons
                name={
                  scanResult?.action === 'CHECKED_OUT'
                    ? 'exit-outline'
                    : scanResult?.action === 'REVERIFIED'
                    ? 'checkmark-done-circle-outline'
                    : 'checkmark-circle'
                }
                size={44}
                color={scanResult?.action === 'CHECKED_OUT' ? '#ea580c' : Colors.primary}
              />
            </View>

            <Text style={styles.resultTitle}>
              {scanResult?.user?.fullName || 'Verified Employee'}
            </Text>

            {scanResult?.user?.department && (
              <Text style={styles.resultDept}>
                {scanResult.user.designation?.title || 'Staff'} •{' '}
                {scanResult.user.department?.name || 'MonoScrum'}
              </Text>
            )}

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    scanResult?.action === 'CHECKED_OUT'
                      ? '#fff7ed'
                      : Colors.surfaceUp,
                  borderColor:
                    scanResult?.action === 'CHECKED_OUT' ? '#fdba74' : Colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  {
                    color:
                      scanResult?.action === 'CHECKED_OUT' ? '#c2410c' : Colors.primary,
                  },
                ]}
              >
                {scanResult?.action === 'REVERIFIED' ||
                scanResult?.attendance?.status === 'REVERIFIED'
                  ? 'Reverified (Already Checked In)'
                  : scanResult?.action === 'CHECKED_OUT'
                  ? 'Checked Out Successfully'
                  : 'Checked In Successfully'}
              </Text>
            </View>

            {scanResult?.previousOperation && (
              <View style={styles.opHistoryBox}>
                <View style={styles.opHistoryRow}>
                  <Ionicons name="time-outline" size={16} color={Colors.textSub} />
                  <Text style={styles.opHistoryText}>
                    {scanResult.previousOperation.summary}
                  </Text>
                </View>
                {scanResult?.totalHoursToday && (
                  <View style={[styles.opHistoryRow, { marginTop: 4 }]}>
                    <Ionicons name="briefcase-outline" size={16} color={Colors.primary} />
                    <Text style={[styles.opHistoryText, { color: Colors.primary, fontWeight: '600' }]}>
                      Total Today: {scanResult.totalHoursToday}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <TouchableOpacity onPress={onClearScanResult} style={styles.continueBtn}>
              <Text style={styles.continueBtnText}>Done</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* ── Error Modal ── */}
      <Modal visible={!!error} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.errorCard}>
            <View style={styles.errorIconWrap}>
              <Ionicons name="alert-circle-outline" size={42} color={Colors.red} />
            </View>
            <Text style={styles.errorTitle}>Verification Failed</Text>
            <Text style={styles.errorDesc}>{error}</Text>

            <TouchableOpacity style={styles.errorBtn} onPress={onClearScanResult}>
              <Text style={styles.errorBtnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.bg,
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 76, // Clearance above the fixed bottom tab bar
  },

  // ── Viewfinder Area ──
  viewfinderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    flex: 1,
  },
  viewfinderCard: {
    width: VIEWFINDER_SIZE,
    height: VIEWFINDER_SIZE * 1.08,
    borderRadius: Radius.card,
    overflow: 'hidden',
    backgroundColor: '#1E293B',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  viewfinderTint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },

  // ── Corner Brackets ──
  cornerBracket: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderColor: '#ffffff',
  },
  bracketTopLeft: {
    top: 22,
    left: 22,
    borderTopWidth: 3.5,
    borderLeftWidth: 3.5,
    borderTopLeftRadius: Radius.lg,
  },
  bracketTopRight: {
    top: 22,
    right: 22,
    borderTopWidth: 3.5,
    borderRightWidth: 3.5,
    borderTopRightRadius: Radius.lg,
  },
  bracketBottomLeft: {
    bottom: 22,
    left: 22,
    borderBottomWidth: 3.5,
    borderLeftWidth: 3.5,
    borderBottomLeftRadius: Radius.lg,
  },
  bracketBottomRight: {
    bottom: 22,
    right: 22,
    borderBottomWidth: 3.5,
    borderRightWidth: 3.5,
    borderBottomRightRadius: Radius.lg,
  },

  // ── Center Helper Badge ──
  centerTargetContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  centerCameraBadge: {
    width: 64,
    height: 64,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  centerHelperText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // ── Busy State ──
  busyOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(13, 27, 62, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  busySpinner: {
    width: 48,
    height: 48,
    borderRadius: Radius.pill,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderTopColor: Colors.primary,
    marginBottom: 12,
  },
  busyText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // ── Bottom Action Controls ──
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 30,
    marginTop: 8,
    marginBottom: 12,
  },
  controlItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  circleActionButton: {
    width: 54,
    height: 54,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceUp,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  controlLabel: {
    fontSize: 13,
    color: Colors.textSub,
    fontWeight: '600',
    textAlign: 'center',
    includeFontPadding: false,
  },
  shutterWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterOuterRing: {
    width: 82,
    height: 82,
    borderRadius: Radius.pill,
    borderWidth: 3,
    borderColor: Colors.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  shutterInnerButton: {
    width: 66,
    height: 66,
    borderRadius: Radius.pill,
    backgroundColor: Colors.primary,
  },
  shutterDisabled: {
    opacity: 0.6,
  },

  // ── Guideline Notice Hint (Snug right above camera rectangle) ──
  guidelineHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  guidelineText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
    includeFontPadding: false,
    letterSpacing: -0.1,
  },

  // ── Modal Styles ──
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(13, 27, 62, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.modal,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalIconWrap: {
    width: 72,
    height: 72,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  resultDept: {
    fontSize: 14,
    color: Colors.textSub,
    marginTop: 4,
    textAlign: 'center',
  },
  statusBadge: {
    marginTop: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  opHistoryBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: Colors.surfaceUp,
    borderRadius: Radius.button,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '100%',
  },
  opHistoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  opHistoryText: {
    fontSize: 13,
    color: Colors.textSub,
  },
  continueBtn: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: Radius.button,
    width: '100%',
    alignItems: 'center',
  },
  continueBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },

  // ── Error Modal ──
  errorCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.modal,
    padding: 24,
    alignItems: 'center',
  },
  errorIconWrap: {
    width: 64,
    height: 64,
    borderRadius: Radius.pill,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.red,
  },
  errorDesc: {
    fontSize: 14,
    color: Colors.textSub,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  errorBtn: {
    marginTop: 20,
    backgroundColor: Colors.red,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: Radius.button,
    width: '100%',
    alignItems: 'center',
  },
  errorBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },

  // ── Permission ──
  permCenter: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  permTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  permText: {
    fontSize: 14,
    color: Colors.textSub,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  permBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: Radius.button,
  },
  permBtnText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 15,
  },
});
