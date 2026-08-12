import React, { useRef } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTab } from '../../types';
import { Colors } from '../../constants/theme';
import { styles } from './styles';

interface Props {
  activeTab: BottomTab;
  onTabPress: (tab: BottomTab) => void;
}

export function BottomTabBar({ activeTab, onTabPress }: Props) {
  const scanScale = useRef(new Animated.Value(1)).current;

  function handleScanPress() {
    Animated.sequence([
      Animated.timing(scanScale, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.timing(scanScale, { toValue: 1, duration: 160, useNativeDriver: true }),
    ]).start();
    onTabPress('scan');
  }

  return (
    <View style={styles.bar}>
      {/* New */}
      <Pressable style={styles.tab} onPress={() => onTabPress('new')}>
        <View style={[styles.iconWrap, activeTab === 'new' && styles.iconWrapActive]}>
          <Ionicons 
            name="add-outline" 
            size={22} 
            color={activeTab === 'new' ? Colors.tabActive : Colors.tabInactive} 
          />
        </View>
        <Text style={[styles.label, activeTab === 'new' && styles.labelActive]}>New</Text>
      </Pressable>

      {/* Scan — center raised CTA */}
      <View style={styles.scanWrap}>
        <Animated.View style={{ transform: [{ scale: scanScale }] }}>
          <Pressable
            style={[styles.scanBtn, activeTab === 'scan' && styles.scanBtnActive]}
            onPress={handleScanPress}
          >
            <Ionicons name="scan-outline" size={24} color={Colors.white} />
          </Pressable>
        </Animated.View>
        <Text style={[styles.label, activeTab === 'scan' && styles.labelActive, styles.scanLabel]}>
          Scan
        </Text>
      </View>

      {/* Settings */}
      <Pressable style={styles.tab} onPress={() => onTabPress('settings')}>
        <View style={[styles.iconWrap, activeTab === 'settings' && styles.iconWrapActive]}>
          <Ionicons 
            name="settings-outline" 
            size={22} 
            color={activeTab === 'settings' ? Colors.tabActive : Colors.tabInactive} 
          />
        </View>
        <Text style={[styles.label, activeTab === 'settings' && styles.labelActive]}>Settings</Text>
      </Pressable>
    </View>
  );
}
