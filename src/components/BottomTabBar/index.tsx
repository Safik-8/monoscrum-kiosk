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
        <Text style={[styles.label, activeTab === 'new' && styles.labelActive]}>Enroll</Text>
      </Pressable>

      {/* History */}
      <Pressable style={styles.tab} onPress={() => onTabPress('history')}>
        <View style={[styles.iconWrap, activeTab === 'history' && styles.iconWrapActive]}>
          <Ionicons 
            name="time-outline" 
            size={22} 
            color={activeTab === 'history' ? Colors.tabActive : Colors.tabInactive} 
          />
        </View>
        <Text style={[styles.label, activeTab === 'history' && styles.labelActive]}>History</Text>
      </Pressable>

      {/* Scan */}
      <Pressable style={styles.tab} onPress={() => onTabPress('scan')}>
        <View style={[styles.iconWrap, activeTab === 'scan' && styles.iconWrapActive]}>
          <Ionicons 
            name="scan-outline" 
            size={22} 
            color={activeTab === 'scan' ? Colors.tabActive : Colors.tabInactive} 
          />
        </View>
        <Text style={[styles.label, activeTab === 'scan' && styles.labelActive]}>Scan</Text>
      </Pressable>

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
