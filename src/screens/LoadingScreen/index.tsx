import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Animated, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Logo } from '../../components/Logo';
import { styles } from './styles';

const LOADER_ILLUSTRATION = require('../../../assets/kiosk-loader-illustration.jpg');

interface LoadingScreenProps {
  statusText?: string;
}

export function LoadingScreen({ statusText = 'Connecting to MonoScrum...' }: LoadingScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initial entrance fade
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Gentle subtle floating animation on illustration
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -6,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim, floatAnim]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Flexible top spacing for balanced vertical distribution */}
      <View style={styles.topSpace} />

      {/* Center Branding & Illustration Section */}
      <Animated.View
        style={[
          styles.centerContent,
          {
            opacity: fadeAnim,
            transform: [{ translateY: floatAnim }],
          },
        ]}
      >
        <View style={styles.illustrationContainer}>
          <Image
            source={LOADER_ILLUSTRATION}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        {/* Brand presentation inspired by the reference layout */}
        <View style={styles.brandRow}>
          <Logo size={42} />
          <View>
            <View style={styles.brandTextWrapper}>
              <Text style={styles.brandFirst}>MONO</Text>
              <Text style={styles.brandSecond}>SCRUM</Text>
            </View>
            <Text style={styles.tagline}>Kiosk · Attendance</Text>
          </View>
        </View>
      </Animated.View>

      {/* Bottom Loading Indicator & Progress Message */}
      <Animated.View style={[styles.bottomSection, { opacity: fadeAnim }]}>
        <ActivityIndicator color="#0284C7" size="small" style={styles.spinner} />
        <Text style={styles.statusText}>{statusText}</Text>
        <Text style={styles.versionText}>v1.0 · Smart Kiosk Platform</Text>
      </Animated.View>
    </View>
  );
}
export default LoadingScreen;
