import React from 'react';
import { View, Text, Pressable, Animated, Image } from 'react-native';
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

          {/* Clean Enterprise Profile & Brand Header */}
          <View style={styles.header}>
            <View style={styles.headerTopRow}>
              <View style={styles.brandRow}>
                <Logo size={42} />
                <View>
                  <Text style={styles.brandName}>monoscrum</Text>
                  <Text style={styles.brandTag}>Enterprise Kiosk</Text>
                </View>
              </View>
              <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
                <Ionicons name="close" size={20} color="#64748B" />
              </Pressable>
            </View>

            {/* Operator Quick Profile */}
            <View style={styles.profileBox}>
              <View style={styles.operatorAvatar}>
                {session?.profileImage ? (
                  <Image source={{ uri: session.profileImage }} style={styles.operatorAvatarImage} />
                ) : (
                  <Text style={styles.operatorAvatarText}>{initial}</Text>
                )}
              </View>
              <View style={styles.profileTextWrap}>
                <Text style={styles.operatorName} numberOfLines={1}>
                  {session?.operatorName || 'Kiosk Operator'}
                </Text>
                <View style={styles.statusRow}>
                  <View style={styles.onlineDot} />
                  <Text style={styles.statusText}>Active Session</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Nav Items */}
          <View style={styles.navSection}>
            <Text style={styles.navSectionLabel}>MENU</Text>
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.tab;
              return (
                <Pressable
                  key={item.tab}
                  style={({ pressed }) => [
                    styles.navItem,
                    isActive && styles.navItemActive,
                    pressed && styles.navItemPressed,
                  ]}
                  onPress={() => { onTabSelect(item.tab); onClose(); }}
                >
                  <Ionicons 
                    name={item.icon as any} 
                    size={22} 
                    color={isActive ? Colors.primary : '#64748B'} 
                    style={styles.navIcon}
                  />
                  <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                    {item.label}
                  </Text>
                  {isActive && <Ionicons name="chevron-forward" size={16} color={Colors.primary} style={styles.chevronActive} />}
                </Pressable>
              );
            })}
          </View>

          <View style={{ flex: 1 }} />

          {/* Footer: Simple Clean Logout */}
          <View style={styles.footer}>
            <Pressable
              style={({ pressed }) => [
                styles.logoutBtn,
                pressed && styles.logoutBtnPressed,
                busy && styles.logoutBtnDisabled,
              ]}
              onPress={() => { onClose(); onLogout(); }}
              disabled={busy}
            >
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
              <Text style={styles.logoutText}>Sign Out</Text>
            </Pressable>
            <Text style={styles.versionText}>MonoScrum Kiosk v2.0</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
