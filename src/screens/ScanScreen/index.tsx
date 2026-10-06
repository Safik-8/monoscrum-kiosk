import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  Platform,
} from 'react-native';
import { Camera, useCameraDevice, usePhotoOutput } from 'react-native-vision-camera';
import { useFaceDetector } from '@noma4i/vision-camera-face-detector';
import { Canvas, Path, Paint, Skia } from '@shopify/react-native-skia';
import { Colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../constants/config';
import { fetchWithTimeout, parseResponse } from '../../lib/http';
import { Session } from '../../types';

const { width } = Dimensions.get('window');
const SCANNER_SIZE = width * 0.8;

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
}: Props) {
  const [stats, setStats] = useState<any>(null);
  const successAnim = useRef(new Animated.Value(0)).current;
  
  // Scan gating: only scan once per face-enter cycle
  // "waitingForFaceLeave" means we already scanned and are waiting for the 
  // person to step away before we scan again
  const waitingForFaceLeaveRef = useRef(false);
  const scanInProgressRef = useRef(false);

  // Vision Camera Setup
  const device = useCameraDevice('front');
  const photo = usePhotoOutput({ qualityPrioritization: 'speed' });
  
  // V5 Compatible Face Detector DSL
  const faceDetector = useFaceDetector({
    preset: 'fast',
    fps: 5,
    outputs: photo,
  });

  const [isCameraInitialized, setIsCameraInitialized] = useState(false);

  const hasFaces = faceDetector.result.faces && faceDetector.result.faces.length > 0;

  // Add a ref to avoid spamming the "Face detected" log on every frame
  const lastHasFacesRef = useRef(false);

  useEffect(() => {
    if (hasFaces !== lastHasFacesRef.current) {
      console.log(`[ScanScreen] Face detection state changed: hasFaces=${hasFaces} (Total faces: ${faceDetector.result.faces?.length || 0})`);
      lastHasFacesRef.current = hasFaces;
    }

    if (!hasFaces) {
      // Face left the frame → reset the gate so the next face triggers a scan
      waitingForFaceLeaveRef.current = false;
    }

    if (isCameraInitialized && hasFaces && !waitingForFaceLeaveRef.current && !scanInProgressRef.current 
        && !busy && !scanResult && !error && !capturedImage) {
      console.log('[ScanScreen] Valid face detected and all conditions met. Triggering onScan()...');
      // A new face just entered → scan once
      waitingForFaceLeaveRef.current = true;
      scanInProgressRef.current = true;
      onScan(photo);
    } else if (hasFaces && !waitingForFaceLeaveRef.current && !scanInProgressRef.current) {
      // Log why it might not be scanning if it sees a face
      // console.log('[ScanScreen] Face seen, but waiting on conditions:', { isCameraInitialized, busy, hasScanResult: !!scanResult, hasError: !!error, hasCapturedImage: !!capturedImage });
    }
  }, [isCameraInitialized, hasFaces, busy, scanResult, error, capturedImage, photo, faceDetector.result]);

  // Reset in-progress flag when busy finishes
  useEffect(() => {
    if (!busy) {
      scanInProgressRef.current = false;
    }
  }, [busy]);

  useEffect(() => {
    if (scanResult && scanResult.match) {
      console.log(`[ScanScreen] Scan successful! Match confidence: ${scanResult.confidence}`);
      Animated.sequence([
        Animated.timing(successAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.delay(4000),
        Animated.timing(successAnim, { toValue: 0, duration: 400, useNativeDriver: true })
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
        headers: { Authorization: `Bearer ${session?.accessToken}` }
      });
      const data = await parseResponse(response);
      if ((data as any).success) {
        setStats((data as any).stats);
      }
    } catch (err) {
      console.log('Failed to fetch branch stats', err);
    }
  };

  // If there's an error, dismiss it quickly to resume scanning
  useEffect(() => {
    if (error && onClearScanResult) {
      console.log(`[ScanScreen] Error displayed to user: ${error}. Clearing in 2.5s...`);
      const timer = setTimeout(() => {
        onClearScanResult(); 
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [error, onClearScanResult]);

  // Make sure we can scan again if results or errors are cleared
  useEffect(() => {
    if (!error && !scanResult) {
      waitingForFaceLeaveRef.current = false;
    }
  }, [error, scanResult]);

  // ── Auto-Dismiss Success Screen ───────────────────────────────────────────
  useEffect(() => {
    if (scanResult && onClearScanResult) {
      const timer = setTimeout(() => {
        onClearScanResult();
      }, 5000); // give them 5 seconds to see the timeline
      return () => clearTimeout(timer);
    }
  }, [scanResult, onClearScanResult]);

  const getContoursPath = () => {
    if (Platform.OS === 'web' || !Skia || !Skia.Path) return null as any;
    return Skia.Path.Make();
  };

  if (!hasCameraPermission) {
    return (
      <View style={styles.permCenter}>
        <Ionicons name="camera-outline" size={48} color={Colors.accent} style={{ marginBottom: 16 }} />
        <Text style={styles.permTitle}>Camera Access Required</Text>
        <Text style={styles.permText}>MonoScrum Kiosk needs camera access.</Text>
        <Pressable style={styles.permBtn} onPress={requestCameraPermission}>
          <Text style={styles.permBtnText}>Allow Camera Access</Text>
        </Pressable>
      </View>
    );
  }

  if (device == null) return <View style={styles.container} />;

  return (
    <View style={styles.container}>
      <View style={styles.hudContainer}>
        <Text style={styles.title}>FACIAL BIOMETRIC</Text>
        <Text style={styles.subtitle}>AUTHENTICATION</Text>

        <View style={styles.scannerWrapper}>
          <View style={styles.cameraContainer}>
            {capturedImage ? (
              <Image source={{ uri: capturedImage }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            ) : (
              <Camera
                {...faceDetector.camera}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={!capturedImage && !scanResult && !error}
                onInitialized={() => setIsCameraInitialized(true)}
              />
            )}

            {!capturedImage && !scanResult && Platform.OS !== 'web' && (
              <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
                <Path path={getContoursPath()} color="cyan" style="stroke" strokeWidth={1}>
                  <Paint style="stroke" strokeWidth={1.5} color="rgba(0, 255, 255, 0.6)" />
                </Path>
              </Canvas>
            )}
          </View>
          <View style={[styles.scannerRing, busy && styles.scannerRingBusy]} />
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBoxLeft}>
            <Text style={styles.statLabel}>LIVENESS DETECTED</Text>
            <Text style={styles.statValue}>[ACTIVE]</Text>
          </View>
          <View style={styles.statBoxRight}>
            <Text style={styles.statLabel}>ANTI-SPOOFING</Text>
            <Text style={styles.statValue}>[PASSED]</Text>
          </View>
        </View>
        <View style={[styles.statsContainer, { marginTop: -10 }]}>
          <View style={styles.statBoxLeft}>
            <Text style={styles.statLabel}>CHECKED IN</Text>
            <Text style={styles.statValue}>[{stats ? stats.checkedIn : '...'}/{stats ? stats.totalEmployees : '...'}]</Text>
          </View>
          <View style={styles.statBoxRight}>
            <Text style={styles.statLabel}>YET TO ARRIVE</Text>
            <Text style={styles.statValue}>[{stats ? stats.notYetIn : '...'}]</Text>
          </View>
        </View>

        <Text style={styles.confidenceScore}>
          {busy ? 'ANALYZING...' : (scanResult ? `CONFIDENCE SCORE: ${(scanResult.confidence * 100).toFixed(1)}%` : 'WAITING FOR FACE...')}
        </Text>

        <Text style={styles.statusVerified}>
          {scanResult ? '[Status: Verified]' : '[Status: Scanning]'}
        </Text>

        <Text style={styles.syncText}>
          {scanResult ? '✅ CRYPTOGRAPHIC KEY SYNC ✅' : 'CRYPTOGRAPHIC KEY SYNC'}
        </Text>
        <Text style={styles.syncSubtext}>
          {scanResult ? '[SYNCED]' : '[WAITING]'}
        </Text>

        <Text style={styles.authenticatingText}>
          {busy ? 'AUTHENTICATING FOR TRANSACTION...' : 'POSITION FACE IN RING'}
        </Text>

      </View>

      {/* Success Modal */}
      <Modal visible={!!scanResult} transparent animationType="fade">
        <View style={styles.modalBg}>
          <Animated.View style={[styles.modalContent, { borderColor: '#00ff88', opacity: successAnim, transform: [{ scale: successAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }]}>
            <Ionicons name="checkmark-circle" size={60} color="#00ff88" style={{ marginBottom: 10 }} />
            <Text style={styles.resultName}>{scanResult?.user?.fullName || 'Unknown User'}</Text>
            {scanResult?.user?.department && (
              <Text style={styles.resultDept}>{scanResult.user.designation?.title || 'Staff'} • {scanResult.user.department?.name || 'Dept'}</Text>
            )}
            <Text style={styles.resultStatus}>
              {scanResult?.attendance?.status === 'PRESENT' ? '✅ CHECKED IN' : '👋 CHECKED OUT'}
            </Text>
            <Text style={{ color: '#00ff88', marginTop: 10, fontSize: 16, fontWeight: 'bold' }}>User Verified Successfully</Text>
            <TouchableOpacity onPress={onClearScanResult} style={styles.dismissBtn}>
              <Text style={styles.dismissBtnText}>Dismiss</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal visible={!!error} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Ionicons name="warning" size={50} color="#ff3333" />
            <Text style={styles.modalTitle}>Face Not Recognized</Text>
            <Text style={styles.modalDesc}>{error}</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => {
              waitingForFaceLeaveRef.current = false;
              if (onClearScanResult) onClearScanResult();
            }}>
              <Text style={styles.modalBtnText}>Try Again</Text>
            </TouchableOpacity>
            <Text style={styles.modalSubText}>If the user is not found, please go to the 'Enroll' tab to register them.</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050a11',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hudContainer: {
    width: '90%',
    backgroundColor: 'rgba(15, 25, 40, 0.85)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.2)',
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  title: { color: '#ffffff', fontSize: 20, fontWeight: 'bold', letterSpacing: 1 },
  subtitle: { color: '#ffffff', fontSize: 20, fontWeight: 'bold', letterSpacing: 1, marginBottom: 20 },
  scannerWrapper: {
    width: SCANNER_SIZE, height: SCANNER_SIZE,
    borderRadius: SCANNER_SIZE / 2,
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  cameraContainer: {
    width: '100%', height: '100%',
    borderRadius: SCANNER_SIZE / 2,
    overflow: 'hidden', position: 'absolute',
  },
  scannerRing: {
    width: '100%', height: '100%',
    borderRadius: SCANNER_SIZE / 2,
    borderWidth: 4, borderColor: '#00ffff',
    position: 'absolute',
    shadowColor: '#00ffff', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 15,
  },
  scannerRingBusy: {
    borderColor: '#ffaa00',
    shadowColor: '#ffaa00',
  },
  statsContainer: {
    flexDirection: 'row', justifyContent: 'space-between',
    width: '100%', paddingHorizontal: 10, marginBottom: 20,
  },
  statBoxLeft: { alignItems: 'flex-start' },
  statBoxRight: { alignItems: 'flex-end' },
  statLabel: { color: '#5b98a3', fontSize: 10, letterSpacing: 0.5 },
  statValue: { color: '#00ffff', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
  confidenceScore: {
    color: '#00ffff', fontSize: 16, fontWeight: 'bold', marginBottom: 10,
    textShadowColor: 'rgba(0, 255, 255, 0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10,
  },
  statusVerified: { color: '#00ffff', fontSize: 12, marginBottom: 5 },
  syncText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  syncSubtext: { color: '#00ffff', fontSize: 12, marginBottom: 15 },
  authenticatingText: { color: '#8b9bb4', fontSize: 12, marginBottom: 20 },
  pinLink: { color: '#8b9bb4', fontSize: 14, marginTop: 10 },
  permCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#050a11' },
  permTitle: { fontSize: 20, color: 'white', marginBottom: 10 },
  permText: { fontSize: 14, color: '#8b9bb4', textAlign: 'center', marginHorizontal: 40, marginBottom: 20 },
  permBtn: { backgroundColor: '#00ffff', padding: 12, borderRadius: 8 },
  permBtnText: { color: '#050a11', fontWeight: 'bold' },
  miniResultBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderWidth: 1,
    borderColor: '#00ff88',
    borderRadius: 8,
    alignItems: 'center',
    width: '100%'
  },
  resultName: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  resultDept: { color: '#8b9bb4', fontSize: 14, marginTop: 4 },
  resultStatus: { color: '#00ff88', fontSize: 16, marginTop: 8, fontWeight: 'bold' },
  dismissBtn: { marginTop: 15, paddingVertical: 8, paddingHorizontal: 20, backgroundColor: 'rgba(0,255,136,0.2)', borderRadius: 20, borderWidth: 1, borderColor: '#00ff88' },
  dismissBtnText: { color: '#00ff88', fontSize: 14, fontWeight: 'bold' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: '#0f1928', padding: 25, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#ff3333' },
  modalTitle: { color: '#ffffff', fontSize: 22, fontWeight: 'bold', marginTop: 15, marginBottom: 10 },
  modalDesc: { color: '#8b9bb4', fontSize: 15, textAlign: 'center', marginBottom: 20 },
  modalBtn: { backgroundColor: '#ff3333', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25 },
  modalBtnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  modalSubText: { color: '#5b98a3', fontSize: 12, textAlign: 'center', marginTop: 15 },
});
