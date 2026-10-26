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
  Easing,
} from 'react-native';
import { CameraView } from 'expo-camera';
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
  const spinAnim = useRef(new Animated.Value(0)).current;

  // Expo Camera Setup
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
    outputRange: ['0deg', '360deg']
  });



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



  // ── Auto-Dismiss Success Screen ───────────────────────────────────────────
  useEffect(() => {
    if (scanResult && onClearScanResult) {
      const timer = setTimeout(() => {
        onClearScanResult();
      }, 2500); // 2.5s allows employee to see result before next person scans
      return () => clearTimeout(timer);
    }
  }, [scanResult, onClearScanResult]);



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
              <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                facing="front"
              />
            )}
          </View>
          <View style={styles.scannerRing} />
          {busy && (
            <Animated.View style={[styles.premiumLoader, { transform: [{ rotate: spin }] }]} />
          )}
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
          {busy ? 'AUTHENTICATING FOR TRANSACTION...' : 'POSITION FACE IN RING AND PRESS CAPTURE'}
        </Text>

      </View>

      {!busy && !scanResult && !error && !capturedImage && (
        <View style={styles.captureButtonWrapper}>
          <TouchableOpacity 
            style={styles.captureButton}
            onPress={() => onScan(cameraRef.current)}
          >
            <Ionicons name="camera" size={32} color="#050a11" />
          </TouchableOpacity>
        </View>
      )}

      {/* Success / Status Modal with Previous Operation Transparency */}
      <Modal visible={!!scanResult} transparent animationType="fade">
        <View style={styles.modalBg}>
          <Animated.View style={[
            styles.modalContent, 
            { 
              borderColor: scanResult?.action === 'CHECKED_OUT' ? '#ffaa00' : '#00ff88', 
              opacity: successAnim, 
              transform: [{ scale: successAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] 
            }
          ]}>
            <Ionicons 
              name={
                scanResult?.action === 'CHECKED_OUT' 
                  ? "exit-outline" 
                  : scanResult?.action === 'REVERIFIED' 
                  ? "checkmark-done-circle-outline" 
                  : "checkmark-circle"
              } 
              size={56} 
              color={scanResult?.action === 'CHECKED_OUT' ? '#ffaa00' : '#00ff88'} 
              style={{ marginBottom: 8 }} 
            />
            
            <Text style={styles.resultName}>{scanResult?.user?.fullName || 'Verified Employee'}</Text>
            
            {scanResult?.user?.department && (
              <Text style={styles.resultDept}>
                {scanResult.user.designation?.title || 'Staff'} • {scanResult.user.department?.name || 'MonoScrum'}
              </Text>
            )}

            <View style={[
              styles.statusPill, 
              { 
                backgroundColor: scanResult?.action === 'CHECKED_OUT' ? 'rgba(255,170,0,0.15)' : 'rgba(0,255,136,0.15)',
                borderColor: scanResult?.action === 'CHECKED_OUT' ? '#ffaa00' : '#00ff88',
                marginTop: 10,
                paddingVertical: 6,
                paddingHorizontal: 16
              }
            ]}>
              <Text style={[
                styles.resultStatus, 
                { color: scanResult?.action === 'CHECKED_OUT' ? '#ffaa00' : '#00ff88', marginTop: 0 }
              ]}>
                {scanResult?.action === 'REVERIFIED' || scanResult?.attendance?.status === 'REVERIFIED'
                  ? '🔄 REVERIFIED (ALREADY IN)'
                  : scanResult?.action === 'CHECKED_OUT'
                  ? '👋 CHECKED OUT'
                  : '✅ CHECKED IN'}
              </Text>
            </View>

            {/* Previous Operation & Workday Insight */}
            {scanResult?.previousOperation && (
              <View style={styles.operationHistoryBox}>
                <View style={styles.historyRow}>
                  <Ionicons name="time-outline" size={16} color="#8b9bb4" />
                  <Text style={styles.historyText}>
                    {scanResult.previousOperation.summary}
                  </Text>
                </View>
                {scanResult?.totalHoursToday && (
                  <View style={[styles.historyRow, { marginTop: 4 }]}>
                    <Ionicons name="briefcase-outline" size={16} color="#00ffff" />
                    <Text style={[styles.historyText, { color: '#00ffff', fontWeight: 'bold' }]}>
                      Total Today: {scanResult.totalHoursToday}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <Text style={{ color: '#8b9bb4', marginTop: 12, fontSize: 13, textAlign: 'center' }}>
              Auto-ready in 2s for next employee
            </Text>

            <TouchableOpacity onPress={onClearScanResult} style={styles.dismissBtn}>
              <Text style={styles.dismissBtnText}>Next Employee</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal visible={!!error} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Ionicons name="alert-circle-outline" size={56} color="#ff3333" />
            <Text style={styles.modalTitle}>Scan Unsuccessful</Text>
            <Text style={styles.modalDesc}>{error}</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => {
              if (onClearScanResult) onClearScanResult();
            }}>
              <Text style={styles.modalBtnText}>Ready for Next Scan</Text>
            </TouchableOpacity>
            <Text style={styles.modalSubText}>
              Not registered yet? An admin can enroll you under the 'Enroll' tab in seconds.
            </Text>
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
  premiumLoader: {
    width: '100%', height: '100%',
    borderRadius: SCANNER_SIZE / 2,
    position: 'absolute',
    borderWidth: 8,
    borderColor: 'transparent',
    borderTopColor: '#ffaa00',
    borderRightColor: '#ffaa00',
    shadowColor: '#ffaa00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 25,
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
  captureButtonWrapper: {
    position: 'absolute',
    bottom: 120, /* Pushed up higher to clear the tab bar */
    alignItems: 'center',
    width: '100%',
    zIndex: 100, /* Ensure it sits on top */
  },
  operationHistoryBox: {
    marginTop: 14,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    width: '100%',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  historyText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '500',
  },
  captureButton: {
    backgroundColor: '#00ffff',
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(0, 255, 255, 0.3)',
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
});
