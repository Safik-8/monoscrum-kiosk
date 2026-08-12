import { CameraView, useCameraPermissions } from 'expo-camera';
import * as KeepAwake from 'expo-keep-awake';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';

// Hooks
import { useAuth } from './src/hooks/useAuth';
import { useDrawer } from './src/hooks/useDrawer';

// Components
import { FixedHeader } from './src/components/FixedHeader';
import { BottomTabBar } from './src/components/BottomTabBar';
import { DrawerMenu } from './src/components/DrawerMenu';
import { LocationModal } from './src/components/LocationModal';

// Screens
import { LoadingScreen } from './src/screens/LoadingScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { ScanScreen } from './src/screens/ScanScreen';
import { NewScreen } from './src/screens/NewScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

// Theme
import { Colors } from './src/constants/theme';

// Active tab state (lifted to root since it controls both header and content)
import { useState } from 'react';
import { BottomTab } from './src/types';

export default function App() {
  const auth = useAuth();
  const drawer = useDrawer();
  const [activeTab, setActiveTab] = useState<BottomTab>('scan');

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);

  // Keep screen awake while kiosk is active
  useEffect(() => {
    if (auth.appScreen === 'main') {
      KeepAwake.activateKeepAwakeAsync('attendance-kiosk');
    }
    return () => { void KeepAwake.deactivateKeepAwake('attendance-kiosk'); };
  }, [auth.appScreen]);

  // Restore persisted session on mount
  useEffect(() => {
    void auth.restoreSession();
  }, []);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (auth.appScreen === 'loading') {
    return <LoadingScreen />;
  }

  // ── Login ──────────────────────────────────────────────────────────────────
  if (auth.appScreen === 'login') {
    return (
      <LoginScreen
        email={auth.email}
        password={auth.password}
        busy={auth.busy}
        error={auth.error}
        onChangeEmail={auth.setEmail}
        onChangePassword={auth.setPassword}
        onLogin={auth.login}
      />
    );
  }

  // ── Main App ───────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <LocationModal
        visible={auth.appScreen === 'main' && auth.kioskLocation === null}
        onLocationGranted={(loc) => auth.setKioskLocation(loc)}
        onClose={() => auth.setKioskLocation({ latitude: 0, longitude: 0 })} // fallback if dismissed
      />

      <StatusBar style="dark" />

      {/* Fixed top header */}
      <FixedHeader
        activeTab={activeTab}
        operatorName={auth.session?.operatorName}
        onMenuPress={drawer.openDrawer}
      />

      {/* Tab content area */}
      <View style={styles.content}>
        {activeTab === 'scan' && (
          <ScanScreen
            cameraPermission={cameraPermission}
            requestCameraPermission={requestCameraPermission}
            cameraRef={cameraRef}
            busy={auth.busy}
            error={auth.error}
            capturedImage={auth.capturedImage}
            scanResult={auth.scanResult}
            onClearScanResult={auth.clearScanResult}
            onScan={() => auth.scanFace(cameraRef)}
          />
        )}
        {activeTab === 'new' && <NewScreen session={auth.session} />}
        {activeTab === 'history' && <HistoryScreen session={auth.session} />}
        {activeTab === 'settings' && (
          <SettingsScreen
            session={auth.session}
            busy={auth.busy}
            onLogout={auth.logout}
          />
        )}
      </View>

      {/* Bottom rudder */}
      <BottomTabBar activeTab={activeTab} onTabPress={setActiveTab} />

      {/* Left slide drawer */}
      <DrawerMenu
        isOpen={drawer.isDrawerOpen}
        slideAnim={drawer.slideAnim}
        session={auth.session}
        activeTab={activeTab}
        busy={auth.busy}
        onClose={drawer.closeDrawer}
        onTabSelect={setActiveTab}
        onLogout={auth.logout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    flex: 1,
  },
});
