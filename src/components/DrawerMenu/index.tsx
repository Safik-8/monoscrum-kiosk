import React from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTab, Session } from '../../types';
import { Colors } from '../../constants/theme';
import { Logo } from '../Logo';
import { styles } from './styles';

interface NavItem {
  tab: BottomTab;
  icon: string;
  label: string;
  desc: string;
}

const NAV_ITEMS: NavItem[] = [
  { tab: 'scan', icon: 'scan-outline', label: 'Face Scanner', desc: 'Scan & record attendance' },
  { tab: 'new', icon: 'add-outline', label: 'New Entry', desc: 'Manual attendance entry' },
  { tab: 'settings', icon: 'settings-outline', label: 'Settings', desc: 'Device & kiosk config' },
];

interface Props {
  isOpen: boolean;
  slideAnim: Animated.Value;
  session: Session | null;
  activeTab: BottomTab;
  busy: boolean;
  onClose: () => void;
  onTabSelect: (tab: BottomTab) => void;
  onLogout: () => void;
}

export function DrawerMenu({
  isOpen,
  slideAnim,
  session,
  activeTab,
  busy,
  onClose,
  onTabSelect,
  onLogout,
}: Props) {
  if (!isOpen) return null;

  const initial = session?.operatorName
    ? session.operatorName.charAt(0).toUpperCase()
    : 'K';

  return (
    <View style={styles.root}>
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      {/* Sliding panel */}
      <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
        <View style={styles.inner}>

          {/* Header — Logo + brand + close */}
          <View style={styles.header}>
            <Logo size={44} />
            <View style={{ flex: 1 }}>
              <Text style={styles.brandName}>MonoScrum</Text>
              <Text style={styles.brandTag}>Kiosk · Attendance</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={Colors.textMuted} />
            </Pressable>
          </View>


          {/* Nav items */}
          <Text style={styles.navSectionLabel}>NAVIGATION</Text>
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <Pressable
                key={item.tab}
                style={[styles.navItem, isActive && styles.navItemActive]}
                onPress={() => { onTabSelect(item.tab); onClose(); }}
              >
                <View style={[styles.navIcon, isActive && styles.navIconActive]}>
                  <Ionicons 
                    name={item.icon as any} 
                    size={20} 
                    color={isActive ? Colors.tabActive : Colors.tabInactive} 
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                    {item.label}
                  </Text>
                  <Text style={styles.navDesc}>{item.desc}</Text>
                </View>
                {isActive && <View style={styles.activeIndicator} />}
              </Pressable>
            );
          })}

          <View style={{ flex: 1 }} />

          {/* Footer: operator card + logout + version */}
          <View style={styles.footer}>
            {/* Operator card — sits just above Sign Out */}
            <View style={[styles.operatorCard, styles.operatorCardFooter]}>
              <View style={styles.operatorAvatar}>
                <Text style={styles.operatorAvatarText}>{initial}</Text>
              </View>
              <View>
                <Text style={styles.operatorName}>{session?.operatorName || 'Kiosk Operator'}</Text>
                <View style={styles.statusRow}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.statusText}>Active Session</Text>
                </View>
              </View>
            </View>

            <Pressable
              style={[styles.logoutBtn, busy && styles.logoutBtnDisabled]}
              onPress={() => { onClose(); onLogout(); }}
              disabled={busy}
            >
              <Ionicons name="log-out-outline" size={20} color={Colors.red} />
              <Text style={styles.logoutText}>Sign Out</Text>
            </Pressable>
            <Text style={styles.versionText}>MonoScrum Kiosk v2.0</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
