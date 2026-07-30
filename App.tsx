import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Device from 'expo-device';
import * as KeepAwake from 'expo-keep-awake';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000/api').replace(/\/$/, '');
const REFRESH_TOKEN_KEY = 'monoscrum.kiosk.refresh-token';
const DEVICE_ID_KEY = 'monoscrum.kiosk.device-id';

type Session = { accessToken: string; deviceId: string; operatorName?: string };
type Screen = 'loading' | 'login' | 'scanner';

type AuthResponse = {
  status: string;
  token?: string;
  refreshToken?: string;
  message?: string;
  data?: { user?: { name?: string } };
};

const tokenStore = {
  async get(key: string) {
    if (Platform.OS === 'web') return globalThis.localStorage?.getItem(key) ?? null;
    return SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string) {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async remove(key: string) {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

async function getDeviceId() {
  const saved = await tokenStore.get(DEVICE_ID_KEY);
  if (saved) return saved;

  const fingerprint = Device.osBuildId || Device.modelId || Device.modelName || 'unknown-device';
  const deviceId = `kiosk-${fingerprint}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  await tokenStore.set(DEVICE_ID_KEY, deviceId);
  return deviceId;
}

async function parseResponse(response: Response): Promise<AuthResponse> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || 'The request could not be completed.');
  return body;
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit, timeoutMs = 8_000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { width: screenWidth } = Dimensions.get('window');
  const slideAnim = useRef(new Animated.Value(-screenWidth)).current;
  const scanAnim = useRef(new Animated.Value(0)).current;

  const toggleDrawer = () => {
    if (isDrawerOpen) {
      Animated.timing(slideAnim, {
        toValue: -screenWidth,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setIsDrawerOpen(false));
    } else {
      setIsDrawerOpen(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  useEffect(() => {
    void restoreSession();
  }, []);

  useEffect(() => {
    if (screen === 'scanner') KeepAwake.activateKeepAwakeAsync('attendance-kiosk');
    return () => { void KeepAwake.deactivateKeepAwake('attendance-kiosk'); };
  }, [screen]);

  useEffect(() => {
    if (screen === 'scanner') {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 240,
            duration: 2500,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 2500,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [screen, scanAnim]);

  async function restoreSession() {
    try {
      const refreshToken = await tokenStore.get(REFRESH_TOKEN_KEY);
      if (!refreshToken) return setScreen('login');
      const deviceId = await getDeviceId();
      const response = await fetchWithTimeout(`${API_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${refreshToken}` },
        body: JSON.stringify({ platform: 'mobile', deviceId }),
      });
      const data = await parseResponse(response);
      if (!data.token || !data.refreshToken) throw new Error('Invalid refresh response.');
      await tokenStore.set(REFRESH_TOKEN_KEY, data.refreshToken);
      setSession({ accessToken: data.token, deviceId });
      setScreen('scanner');
    } catch {
      await tokenStore.remove(REFRESH_TOKEN_KEY);
      setScreen('login');
    }
  }

  async function login() {
    setBusy(true);
    setError('');
    try {
      const deviceId = await getDeviceId();
      const response = await fetchWithTimeout(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, platform: 'mobile', deviceId }),
      });
      const data = await parseResponse(response);
      if (!data.token || !data.refreshToken) throw new Error('The server did not return a mobile session.');
      await tokenStore.set(REFRESH_TOKEN_KEY, data.refreshToken);
      setSession({ accessToken: data.token, deviceId, operatorName: data.data?.user?.name });
      setPassword('');
      setScreen('scanner');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Login failed.');
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    setBusy(true);
    try {
      const refreshToken = await tokenStore.get(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        await fetchWithTimeout(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${refreshToken}` },
          body: JSON.stringify({ platform: 'mobile' }),
        });
      }
    } finally {
      await tokenStore.remove(REFRESH_TOKEN_KEY);
      setSession(null);
      setScreen('login');
      setBusy(false);
    }
  }

  async function scanFace() {
    if (!cameraRef.current || !session || busy) return;
    setBusy(true);
    setError('');
    try {
      const image = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.65 });
      if (!image?.base64) throw new Error('Unable to capture camera image.');
      const response = await fetchWithTimeout(`${API_URL}/kiosk/attendance/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.accessToken}` },
        body: JSON.stringify({ imageBase64: image.base64, deviceId: session.deviceId }),
      });
      const result = await parseResponse(response);
      Alert.alert('Attendance recorded', result.message || 'Scan completed successfully.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Face scan failed.');
    } finally {
      setBusy(false);
    }
  }

  if (screen === 'loading') return <View style={styles.center}><ActivityIndicator size="large" color="#2f6fed" /></View>;

  if (screen === 'login') {
    return (
      <KeyboardAvoidingView style={styles.loginPage} behavior={Platform.select({ ios: 'padding', default: undefined })}>
        <StatusBar style="dark" />
        <View style={styles.loginCard}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>Stackdot</Text>
          </View>
          <Text style={styles.kicker}>MONOSCRUM</Text>
          <Text style={styles.title}>Attendance kiosk</Text>
          <Text style={styles.subtitle}>An authorized operator must sign in to start face scanning.</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" keyboardType="email-address" editable={!busy} />
          <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry editable={!busy} onSubmitEditing={login} />
          {!!error && <Text style={styles.error}>{error}</Text>}
          <Pressable style={[styles.primaryButton, busy && styles.disabled]} onPress={login} disabled={busy}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Start kiosk</Text>}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    );
  }

  if (!cameraPermission) return <View style={styles.center}><ActivityIndicator /></View>;
  if (!cameraPermission.granted) {
    return <View style={styles.center}><Text style={styles.permissionText}>Camera permission is needed to scan attendance.</Text><Pressable style={styles.primaryButton} onPress={requestCameraPermission}><Text style={styles.primaryButtonText}>Allow camera</Text></Pressable></View>;
  }

  return (
    <View style={styles.scannerPage}>
      <StatusBar style="light" />
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="front" mirror onCameraReady={() => setError('')} />
      
      {/* WhatsApp QR style overlay */}
      <View style={styles.overlayContainer}>
        <View style={styles.overlayTop}>
           {/* Top Navbar in Scanner */}
           <View style={styles.navbar}>
             <Pressable onPress={toggleDrawer} style={styles.navMenuButton}>
               <Text style={styles.navMenuIcon}>☰</Text>
             </Pressable>
             <Text style={styles.navLogo}>Stackdot</Text>
             <View style={{ width: 44 }} />
           </View>
        </View>
        <View style={styles.overlayMiddleRow}>
          <View style={styles.overlaySide} />
          <View style={styles.cutout}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanAnim }] }]} />
          </View>
          <View style={styles.overlaySide} />
        </View>
        <View style={styles.overlayBottom}>
           {!!error && <Text style={styles.scannerError}>{error}</Text>}
           <Text style={styles.scannerHint}>Position your face inside the frame to scan</Text>
           <Pressable style={[styles.scanButton, busy && styles.disabled]} onPress={scanFace} disabled={busy}>
             {busy ? <ActivityIndicator color="#08111f" /> : <Text style={styles.scanButtonText}>Scan attendance</Text>}
           </Pressable>
        </View>
      </View>

      {/* Slideover Drawer */}
      {isDrawerOpen && (
        <View style={styles.drawerOverlayContainer}>
          <Pressable style={styles.drawerBackdrop} onPress={toggleDrawer} />
          <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
             <View style={styles.drawerHeader}>
               <Text style={styles.drawerLogoText}>Stackdot</Text>
               <Text style={styles.drawerTitle}>Kiosk Menu</Text>
             </View>
             <Pressable style={styles.drawerItem} onPress={toggleDrawer}>
               <Text style={styles.drawerItemText}>Dashboard</Text>
             </Pressable>
             <Pressable style={styles.drawerItem} onPress={toggleDrawer}>
               <Text style={styles.drawerItemText}>Settings</Text>
             </Pressable>
             <View style={{ flex: 1 }} />
             <Text style={styles.drawerFooterText}>{session?.operatorName ? `Operator: ${session.operatorName}` : ''}</Text>
             <Pressable style={styles.drawerItemOut} onPress={() => { toggleDrawer(); logout(); }} disabled={busy}>
               <Text style={[styles.drawerItemText, { color: '#b42318' }]}>Sign Out</Text>
             </Pressable>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f7fb', padding: 24 },
  loginPage: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f5f7fb' },
  loginCard: { backgroundColor: '#fff', padding: 28, borderRadius: 20, gap: 14, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  logoContainer: { alignItems: 'center', marginBottom: 16 },
  logoText: { fontSize: 32, fontWeight: '900', color: '#111827', letterSpacing: -1 },
  kicker: { color: '#2f6fed', letterSpacing: 2, fontWeight: '800', fontSize: 12, marginTop: 10 },
  title: { color: '#111827', fontSize: 28, fontWeight: '800' },
  subtitle: { color: '#667085', fontSize: 15, lineHeight: 22, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#d0d5dd', borderRadius: 10, padding: 14, fontSize: 16, color: '#101828' },
  primaryButton: { minHeight: 52, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2f6fed', paddingHorizontal: 20 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  disabled: { opacity: 0.65 },
  error: { color: '#b42318', fontSize: 14 },
  
  scannerPage: { flex: 1, backgroundColor: '#000' },
  overlayContainer: { ...StyleSheet.absoluteFillObject },
  overlayTop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 10 },
  overlayMiddleRow: { flexDirection: 'row', height: 250 },
  overlaySide: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  cutout: { width: 250, height: 250, backgroundColor: 'transparent', position: 'relative' },
  overlayBottom: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  
  corner: { position: 'absolute', width: 40, height: 40, borderColor: '#00E676', borderWidth: 4 },
  topLeft: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0 },
  topRight: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0 },
  scanLine: { width: '100%', height: 2, backgroundColor: '#00E676', position: 'absolute', top: 0, shadowColor: '#00E676', shadowOpacity: 0.8, shadowRadius: 5 },
  
  scannerHint: { color: '#fff', fontSize: 16, marginBottom: 30, textAlign: 'center' },
  scanButton: { width: '100%', backgroundColor: '#00E676', minHeight: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  scanButtonText: { color: '#08111f', fontSize: 17, fontWeight: '800' },
  scannerError: { color: '#fff', textAlign: 'center', backgroundColor: 'rgba(180, 35, 24, 0.88)', padding: 10, borderRadius: 8, marginVertical: 12 },
  permissionText: { fontSize: 18, color: '#101828', textAlign: 'center', marginBottom: 20 },

  navbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 16, zIndex: 20 },
  navMenuButton: { padding: 8 },
  navMenuIcon: { fontSize: 28, color: '#fff' },
  navLogo: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },

  drawerOverlayContainer: { ...StyleSheet.absoluteFillObject, zIndex: 100 },
  drawerBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  drawer: { position: 'absolute', top: 0, bottom: 0, left: 0, width: 280, backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 15, padding: 24, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  drawerHeader: { marginBottom: 30 },
  drawerLogoText: { fontSize: 28, fontWeight: '900', color: '#111827', letterSpacing: -1 },
  drawerTitle: { fontSize: 14, color: '#667085', marginTop: 4, fontWeight: '600' },
  drawerItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f2f4f7' },
  drawerItemOut: { paddingVertical: 16, marginTop: 10 },
  drawerItemText: { fontSize: 18, fontWeight: '600', color: '#101828' },
  drawerFooterText: { fontSize: 13, color: '#667085', textAlign: 'center' },
});
