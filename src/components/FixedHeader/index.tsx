import React from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTab } from '../../types';
import { Logo } from '../Logo';
import { Colors } from '../../constants/theme';
import { styles } from './styles';

const TAB_TITLES: Record<BottomTab, string> = {
  scan: 'Kiosk Capture',
  new: 'Face Enrollment',
  history: 'Attendance History',
  settings: 'Settings',
};

interface Props {
  activeTab: BottomTab;
  operatorName?: string;
  regionName?: string;
  onMenuPress: () => void;
  // Detail page custom overrides
  customTitle?: string;
  customBackPress?: () => void;
  customAvatarImage?: string;
  customInitials?: string;
}

export function FixedHeader({ 
  activeTab, 
  operatorName, 
  regionName, 
  onMenuPress,
  customTitle,
  customBackPress,
  customAvatarImage,
  customInitials,
}: Props) {
  const isDetailMode = !!customBackPress;

  return (
    <View style={styles.header}>
      {/* Status bar safe-area spacer */}
      <View style={styles.safeAreaSpacer} />

      <View style={styles.contentRow}>

        {/* Left Cluster — Either Logo+Title OR BackButton+Title */}
        <View style={styles.brandCluster}>
          {isDetailMode ? (
            <Pressable 
              onPress={customBackPress} 
              style={({ pressed }) => [
                styles.backBtn,
                pressed && { opacity: 0.6 }
              ]}
              hitSlop={8}
              accessibilityLabel="Go Back"
            >
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </Pressable>
          ) : (
            <Logo size={42} />
          )}

          <Text style={styles.pageTitle} numberOfLines={1}>
            {customTitle || TAB_TITLES[activeTab]}
          </Text>
        </View>

        {/* Right slot — Selected User Avatar (in detail mode) OR Menu Avatar */}
        {isDetailMode ? (
          <View style={styles.avatarCircle}>
            {customAvatarImage ? (
              <Image source={{ uri: customAvatarImage }} style={styles.userAvatarImg} />
            ) : customInitials ? (
              <Text style={styles.userAvatarInitials}>{customInitials}</Text>
            ) : (
              <Ionicons name="person" size={17} color={Colors.primary} />
            )}
          </View>
        ) : (
          <Pressable 
            style={({ pressed }) => [
              styles.avatarBtn,
              pressed && styles.avatarBtnPressed,
            ]} 
            onPress={onMenuPress}
            hitSlop={8}
            accessibilityLabel="Open Menu"
          >
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={17} color={Colors.primary} />
            </View>
            <View style={styles.avatarOnlineDot} />
          </Pressable>
        )}

      </View>
    </View>
  );
}

