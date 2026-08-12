import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTab } from '../../types';
import { Logo } from '../Logo';
import { Colors } from '../../constants/theme';
import { styles } from './styles';

const TAB_TITLES: Record<BottomTab, string> = {
  scan: 'Face Scanner',
  new: 'New Entry',
  settings: 'Settings',
};

interface Props {
  activeTab: BottomTab;
  operatorName?: string;
  onMenuPress: () => void;
}

export function FixedHeader({ activeTab, operatorName, onMenuPress }: Props) {
  const initial = operatorName ? operatorName.charAt(0).toUpperCase() : 'K';

  return (
    <View style={styles.header}>
      {/* Status bar safe-area spacer */}
      <View style={styles.safeAreaSpacer} />

      {/*
        ┌─────────────┬──────────────────────────┬─────────────┐
        │  44px left  │      flex:1 center        │ 44px right  │
        │  hamburger  │   logo  +  page title     │   avatar    │
        └─────────────┴──────────────────────────┴─────────────┘
        Equal fixed widths on both sides guarantee the center is
        always mathematically centered to the full header width.
      */}
      <View style={styles.contentRow}>

        {/* Left slot — fixed 44px */}
        <View style={styles.sideSlot}>
          <Pressable onPress={onMenuPress} style={styles.menuBtn} hitSlop={8}>
            <Ionicons name="menu-outline" size={28} color={Colors.text} />
          </Pressable>
        </View>

        {/* Center — fills remaining space, content centered */}
        <View style={styles.centerSlot}>
          <Logo size={26} />
          <View>
            <Text style={styles.pageTitle} numberOfLines={1}>
              {TAB_TITLES[activeTab]}
            </Text>
            <Text style={styles.brand}>MonoScrum Kiosk</Text>
          </View>
        </View>

        {/* Right slot — same fixed 44px as left */}
        <View style={[styles.sideSlot, styles.sideSlotRight]}>
          <Pressable style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </Pressable>
        </View>

      </View>
    </View>
  );
}
