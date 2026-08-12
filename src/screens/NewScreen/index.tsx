import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { styles } from './styles';

const QUICK_ACTIONS = [
  { icon: 'person-outline', title: 'Manual Check-In', desc: "Record attendance manually by ID", badge: 'Soon' },
  { icon: 'document-text-outline', title: 'Attendance Report', desc: "View and export today's log", badge: 'Soon' },
  { icon: 'notifications-outline', title: 'Notify Team', desc: 'Send attendance alerts', badge: 'Soon' },
] as const;

export function NewScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero */}
      <View style={styles.hero}>
        <Ionicons name="sparkles" size={28} color={Colors.accent} style={{ marginBottom: 16 }} />
        <Text style={styles.heroTitle}>New Entry</Text>
        <Text style={styles.heroSubtitle}>Manual attendance entry coming soon</Text>
      </View>

      {/* Quick actions */}
      <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
      {QUICK_ACTIONS.map((item, i) => (
        <View key={i} style={styles.actionCard}>
          <View style={styles.actionIconBox}>
            <Ionicons name={item.icon as any} size={22} color={Colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionTitle}>{item.title}</Text>
            <Text style={styles.actionDesc}>{item.desc}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
