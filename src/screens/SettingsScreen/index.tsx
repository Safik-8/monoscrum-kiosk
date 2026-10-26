import React from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Session } from '../../types';
import { Colors } from '../../constants/theme';
import { API_URL } from '../../constants/config';
import { styles } from './styles';

interface Props {
  session: Session | null;
  busy: boolean;
  onLogout: () => void;
}

const PREFERENCES = [
  { icon: 'notifications-outline', label: 'Notifications', val: 'On' },
  { icon: 'moon-outline', label: 'Dark Mode', val: 'Always' },
  { icon: 'timer-outline', label: 'Auto Scan', val: 'Off' },
] as const;

export function SettingsScreen({ session, busy, onLogout }: Props) {
  const initial = session?.operatorName
    ? session.operatorName.charAt(0).toUpperCase()
    : 'K';

  const deviceInfo = [
    { label: 'Operator', value: session?.operatorName || 'Unknown' },
    { label: 'Device ID', value: session?.deviceId ? `${session.deviceId.slice(0, 22)}…` : 'N/A' },
    { label: 'Platform', value: Platform.OS },
    { label: 'API Endpoint', value: API_URL },
    { label: 'App Version', value: '2.0.0' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.operatorName}>{session?.operatorName || 'Kiosk Operator'}</Text>
        <View style={styles.statusRow}>
          <View style={styles.onlineDot} />
          <Text style={styles.statusText}>Session Active</Text>
        </View>
      </View>

      {/* Device info */}
      <Text style={styles.sectionLabel}>DEVICE & SESSION INFO</Text>
      <View style={styles.infoCard}>
        {deviceInfo.map((row, i) => (
          <View
            key={i}
            style={[styles.infoRow, i < deviceInfo.length - 1 && styles.infoRowBorder]}
          >
            <Text style={styles.infoLabel}>{row.label}</Text>
            <Text style={styles.infoValue} numberOfLines={1}>{row.value}</Text>
          </View>
        ))}
      </View>

      {/* Kiosk Biometric Policy & Session Freeze */}
      <Text style={styles.sectionLabel}>BIOMETRIC PUNCH POLICIES</Text>
      <View style={styles.infoCard}>
        <View style={[styles.infoRow, styles.infoRowBorder]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>Session Freeze Time</Text>
            <Text style={{ fontSize: 11, color: Colors.textMuted, marginTop: 2 }}>
              Min time before Check-Out allowed
            </Text>
          </View>
          <View style={styles.prefValPill}>
            <Text style={styles.prefVal}>60 Seconds</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>Anti-Double Punch Throttle</Text>
            <Text style={{ fontSize: 11, color: Colors.textMuted, marginTop: 2 }}>
              Prevents duplicate queue bursts
            </Text>
          </View>
          <View style={styles.prefValPill}>
            <Text style={styles.prefVal}>15 Seconds</Text>
          </View>
        </View>
      </View>

      {/* Preferences */}
      <Text style={styles.sectionLabel}>PREFERENCES</Text>
      {PREFERENCES.map((pref, i) => (
        <View key={i} style={styles.prefRow}>
          <Ionicons name={pref.icon as any} size={20} color={Colors.textSub} style={{ marginRight: 12 }} />
          <Text style={styles.prefLabel}>{pref.label}</Text>
          <View style={styles.prefValPill}>
            <Text style={styles.prefVal}>{pref.val}</Text>
          </View>
        </View>
      ))}

      {/* Sign out */}
      <Pressable
        style={[styles.signOutBtn, busy && styles.signOutBtnDisabled]}
        onPress={onLogout}
        disabled={busy}
      >
        {busy ? (
          <ActivityIndicator color="#FF4D4D" />
        ) : (
          <>
            <Ionicons name="log-out-outline" size={20} color={Colors.red} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </>
        )}
      </Pressable>

      <Text style={styles.footer}>MonoScrum Kiosk v2.0 · Powered by Stackdot</Text>
    </ScrollView>
  );
}
