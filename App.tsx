import { useCameraPermissions } from 'expo-camera';
import * as KeepAwake from 'expo-keep-awake';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Platform, BackHandler, Text, TextInput } from 'react-native';

// Cap system font scaling multiplier so device accessibility/large text settings
// do not inflate font metrics and truncate words with '...' or slice letters
if ((Text as any).defaultProps == null) {
  (Text as any).defaultProps = {};
}
(Text as any).defaultProps.maxFontSizeMultiplier = 1.05;
(Text as any).defaultProps.allowFontScaling = false;

if ((TextInput as any).defaultProps == null) {
  (TextInput as any).defaultProps = {};
}
(TextInput as any).defaultProps.maxFontSizeMultiplier = 1.05;
(TextInput as any).defaultProps.allowFontScaling = false;

// Hooks
import { useAuth } from './src/hooks/useAuth';
import { useDrawer } from './src/hooks/useDrawer';

// Components
import { FixedHeader } from './src/components/FixedHeader';
import { BottomTabBar } from './src/components/BottomTabBar';
import { DrawerMenu } from './src/components/DrawerMenu';
import { LocationModal } from './src/components/LocationModal';
import { LogoutModal } from './src/components/LogoutModal';

// Screens
import { LoadingScreen } from './src/screens/LoadingScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { ScanScreen } from './src/screens/ScanScreen';
import { NewScreen } from './src/screens/NewScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

// Theme
import { Colors } from './src/constants/theme';

// Types
import { BottomTab } from './src/types';

export default function App() {
  const auth = useAuth();
  const drawer = useDrawer();
  const [activeTab, setActiveTab] = useState<BottomTab>('new');
  const [historySelectedUser, setHistorySelectedUser] = useState<any | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [permission, requestCameraPermission] = useCameraPermissions();
  const hasCameraPermission = permission?.granted ?? false;

  // Keep screen awake while kiosk is active
  useEffect(() => {
    if (Platform.OS === 'web') return;

    if (auth.appScreen === 'main') {
      KeepAwake.activateKeepAwakeAsync('attendance-kiosk').catch(() => {});
    }
    return () => { 
      try {
        KeepAwake.deactivateKeepAwake('attendance-kiosk'); 
      } catch (e) {
        // Ignore error
      }
    };
  }, [auth.appScreen]);

  // Restore persisted session on mount
  useEffect(() => {
    void auth.restoreSession();
  }, []);

  // Handle hardware back button to simulate tab navigation history
  useEffect(() => {
    const onBackPress = () => {
      // If we are logged in and not on the default 'new' tab, navigate back to 'new'
      if (auth.appScreen === 'main' && activeTab !== 'new') {
        setActiveTab('new');
        return true; // prevent default behavior (app exit)
      }
      return false; // allow default behavior (app exit)
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => {
      subscription.remove();
    };
  }, [auth.appScreen, activeTab]);

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


  // Clear selected user if navigating away from history tab
  const handleTabPress = (tab: BottomTab) => {
    if (tab !== 'history') {
      setHistorySelectedUser(null);
    }
    setActiveTab(tab);
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.substring(0, 2).toUpperCase();
  };

  // ── Main App ───────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <LocationModal
        visible={auth.appScreen === 'main' && auth.kioskLocation === null}
        onLocationGranted={(loc) => auth.setKioskLocation(loc)}
        onClose={() => auth.setKioskLocation({ latitude: 0, longitude: 0 })} // fallback if dismissed
      />

      <LogoutModal
        visible={showLogoutModal}
        busy={auth.busy}
        onConfirm={async () => {
          await auth.logout();
          setShowLogoutModal(false);
        }}
        onCancel={() => setShowLogoutModal(false)}
      />

      <StatusBar style="dark" />

      {/* Fixed top header reused across all 4 pages */}
      <FixedHeader
        activeTab={activeTab}
        operatorName={auth.session?.operatorName}
        regionName={auth.session?.regionName}
        onMenuPress={drawer.openDrawer}
        customTitle={
          activeTab === 'history' && historySelectedUser
            ? (historySelectedUser.fullName || historySelectedUser.name || historySelectedUser.username)
            : undefined
        }
        customBackPress={
          activeTab === 'history' && historySelectedUser
            ? () => setHistorySelectedUser(null)
            : undefined
        }
        customAvatarImage={
          activeTab === 'history' && historySelectedUser?.profileImage
            ? historySelectedUser.profileImage
            : undefined
        }
        customInitials={
          activeTab === 'history' && historySelectedUser
            ? getInitials(historySelectedUser.fullName || historySelectedUser.name || historySelectedUser.username)
            : undefined
        }
      />

      {/* Tab content area */}
      <View style={styles.content}>
        {activeTab === 'scan' && (
          <ScanScreen
            session={auth.session}
            hasCameraPermission={hasCameraPermission}
            requestCameraPermission={requestCameraPermission}
            busy={auth.busy}
            error={auth.error}
            capturedImage={auth.capturedImage}
            scanResult={auth.scanResult}
            onClearScanResult={auth.clearScanResult}
            onScan={auth.scanFace}
            onNavigateHistory={() => setActiveTab('history')}
            onBack={() => setActiveTab('new')}
            onOpenDrawer={drawer.openDrawer}
          />
        )}
        {activeTab === 'new' && <NewScreen session={auth.session} />}
        {activeTab === 'history' && (
          <HistoryScreen 
            session={auth.session} 
            selectedUserOverride={historySelectedUser}
            onSelectedUserChange={setHistorySelectedUser}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsScreen
            session={auth.session}
            busy={auth.busy}
            onLogout={() => setShowLogoutModal(true)}
          />
        )}
      </View>

      {/* Bottom rudder */}
      <BottomTabBar activeTab={activeTab} onTabPress={handleTabPress} />

      {/* Left slide drawer */}
      <DrawerMenu
        isOpen={drawer.isDrawerOpen}
        slideAnim={drawer.slideAnim}
        session={auth.session}
        activeTab={activeTab}
        busy={auth.busy}
        onClose={drawer.closeDrawer}
        onTabSelect={setActiveTab}
        onLogout={() => setShowLogoutModal(true)}
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
