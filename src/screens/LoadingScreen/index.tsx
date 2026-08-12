import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../../constants/theme';
import { Logo } from '../../components/Logo';
import { styles } from './styles';

export function LoadingScreen() {
  const pulse = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.7, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Pulsing logo ring */}
      <Animated.View style={[styles.ring, { opacity: pulse }]}>
        <Logo size={72} />
      </Animated.View>

      <Text style={styles.title}>MonoScrum</Text>
      <Text style={styles.subtitle}>Kiosk · Attendance</Text>
      <ActivityIndicator color={Colors.accent} size="small" style={styles.spinner} />
    </View>
  );
}
