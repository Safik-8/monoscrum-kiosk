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
      {/* Profile Row (Android Account style) */}
      <View style={styles.profileRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.profileDetails}>
          <Text style={styles.operatorName}>{session?.operatorName || 'Kiosk Operator'}</Text>
          <View style={styles.statusRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.statusText}>Session Active</Text>
          </View>
        </View>
      </View>

      {/* Device Info Category */}
      <Text style={styles.sectionHeader}>Device & Session</Text>
      {deviceInfo.map((row, i) => (
        <View key={i} style={styles.infoRow}>
          <Text style={styles.infoLabel}>{row.label}</Text>
          <Text style={styles.infoValue}>{row.value}</Text>
        </View>
      ))}

      {/* Biometric Punch Policies Category */}
      <Text style={[styles.sectionHeader, { marginTop: 20 }]}>Biometric Punch Policies</Text>
      
      <View style={styles.infoRow}>
        <View style={styles.infoLabelGroup}>
          <Text style={styles.infoLabel}>Session Freeze Time</Text>
          <Text style={styles.infoSub}>Min time before Check-Out allowed</Text>
        </View>
        <View style={styles.valBadge}>
          <Text style={styles.valBadgeText}>60s</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoLabelGroup}>
          <Text style={styles.infoLabel}>Anti-Double Punch</Text>
          <Text style={styles.infoSub}>Prevents duplicate queue bursts</Text>
        </View>
        <View style={styles.valBadge}>
          <Text style={styles.valBadgeText}>15s</Text>
        </View>
      </View>

      {/* Preferences Category */}
      <Text style={[styles.sectionHeader, { marginTop: 20 }]}>Preferences</Text>
      {PREFERENCES.map((pref, i) => (
        <View key={i} style={styles.infoRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name={pref.icon as any} size={20} color="#64748B" style={{ marginRight: 12 }} />
            <Text style={styles.infoLabel}>{pref.label}</Text>
          </View>
          <View style={styles.valBadge}>
            <Text style={styles.valBadgeText}>{pref.val}</Text>
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
          <ActivityIndicator color={Colors.red} />
        ) : (
          <>
            <Ionicons name="log-out-outline" size={18} color={Colors.red} />
            <Text style={styles.signOutText}>Sign Out of Kiosk</Text>
          </>
        )}
      </Pressable>

      <Text style={styles.footer}>MonoScrum Kiosk v2.0 · Powered by Stackdot</Text>
    </ScrollView>
  );
}
