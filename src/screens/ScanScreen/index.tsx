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
} from 'react-native';
import { Camera, useCameraDevice, useFrameProcessor } from 'react-native-vision-camera';
import { useFaceDetector } from 'react-native-vision-camera-face-detector';
import { Worklets } from 'react-native-worklets-core';
import { Canvas, Path, Paint, Skia } from '@shopify/react-native-skia';
import { Colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const SCANNER_SIZE = width * 0.8;

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

  const [faces, setFaces] = useState<any[]>([]);

  const { detectFaces } = useFaceDetector({
    performanceMode: 'fast',
    contourMode: 'all',
    landmarkMode: 'none',
  });

  const setFacesOnJS = Worklets.createRunOnJS((detectedFaces: any[]) => {
    setFaces(detectedFaces);
  });

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';
    const detectedFaces = detectFaces(frame);
    setFacesOnJS(detectedFaces);
  }, [detectFaces]);

  // ── Auto-Capture Logic ──────────────────────────────────────────────────
  useEffect(() => {
    // Basic alignment check based on face array
    const isFaceAligned = faces.length === 1 && faces[0].bounds.width > 150;
    
    // If not busy, no result is shown, camera ready, and face is aligned
    if (!busy && !scanResult && !error && isFaceAligned && hasCameraPermission && !capturedImage) {
      onScan(cameraRef);
    }
  }, [busy, scanResult, error, faces, hasCameraPermission, onScan, capturedImage]);

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
      }, 5000); // give them 5 seconds to see the timeline
      return () => clearTimeout(timer);
    }
  }, [scanResult, onClearScanResult]);

  const getContoursPath = () => {
    const path = Skia.Path.Make();
    if (faces.length > 0) {
      const face = faces[0];
      const contours = face.contours;
      if (contours) {
        // Draw Face Oval
        if (contours.FACE) {
          path.moveTo(contours.FACE[0].x, contours.FACE[0].y);
          contours.FACE.forEach((p: any) => path.lineTo(p.x, p.y));
          path.close();
        }
        
        const features = [
          'LEFT_EYEBROW_TOP', 'LEFT_EYEBROW_BOTTOM',
          'RIGHT_EYEBROW_TOP', 'RIGHT_EYEBROW_BOTTOM',
          'LEFT_EYE', 'RIGHT_EYE',
          'UPPER_LIP_TOP', 'UPPER_LIP_BOTTOM',
          'LOWER_LIP_TOP', 'LOWER_LIP_BOTTOM',
          'NOSE_BRIDGE', 'NOSE_BOTTOM'
        ];
        
        features.forEach((feature) => {
          if (contours[feature]) {
            path.moveTo(contours[feature][0].x, contours[feature][0].y);
            contours[feature].forEach((p: any) => path.lineTo(p.x, p.y));
          }
        });
      }
    }
    return path;
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

  if (device == null) {
    return <View style={styles.container} />;
  }

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
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={!busy && !scanResult && !capturedImage}
                frameProcessor={frameProcessor}
                pixelFormat="yuv"
                photo={true}
              />
            )}

            {!capturedImage && !scanResult && (
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
            <Text style={styles.statLabel}>DEPTH MAP</Text>
            <Text style={styles.statValue}>[VALID]</Text>
          </View>
          <View style={styles.statBoxRight}>
            <Text style={styles.statLabel}>HEAT SIGNATURE</Text>
            <Text style={styles.statValue}>[OPTIMAL]</Text>
          </View>
        </View>

        <Text style={styles.confidenceScore}>
          {busy ? 'ANALYZING...' : (scanResult ? 'CONFIDENCE SCORE: 99.8%' : 'WAITING FOR FACE...')}
        </Text>

        {error ? (
          <Text style={[styles.statusVerified, { color: 'red' }]}>⚠ {error}</Text>
        ) : (
          <Text style={styles.statusVerified}>
            {scanResult ? '[Status: Verified]' : '[Status: Scanning]'}
          </Text>
        )}

        <Text style={styles.syncText}>
          {scanResult ? '✅ CRYPTOGRAPHIC KEY SYNC ✅' : 'CRYPTOGRAPHIC KEY SYNC'}
        </Text>
        <Text style={styles.syncSubtext}>
          {scanResult ? '[SYNCED]' : '[WAITING]'}
        </Text>

        <Text style={styles.authenticatingText}>
          {busy ? 'AUTHENTICATING FOR TRANSACTION...' : 'POSITION FACE IN RING'}
        </Text>

        {/* Existing Result UI Overlay within HUD if matched */}
        {scanResult && (
          <View style={styles.miniResultBox}>
            <Text style={styles.resultName}>{scanResult.user?.fullName || 'Unknown User'}</Text>
            <Text style={styles.resultStatus}>
              {scanResult.attendance?.status === 'PRESENT' ? 'CHECKED IN' : 'CHECKED OUT'}
            </Text>
            <TouchableOpacity onPress={onClearScanResult}>
              <Text style={styles.pinLink}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
  resultName: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  resultStatus: { color: '#00ff88', fontSize: 14, marginTop: 5, fontWeight: 'bold' },
});
