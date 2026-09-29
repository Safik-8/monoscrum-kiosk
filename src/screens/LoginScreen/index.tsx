import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Easing,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { Logo } from '../../components/Logo';
import { styles } from './styles';

interface Props {
  email: string;
  password: string;
  busy: boolean;
  error: string;
  onChangeEmail: (v: string) => void;
  onChangePassword: (v: string) => void;
  onLogin: () => void;
}

export function LoginScreen({
  email,
  password,
  busy,
  error,
  onChangeEmail,
  onChangePassword,
  onLogin,
}: Props) {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideIn = useRef(new Animated.Value(40)).current;
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideIn, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', default: undefined })}
    >
      <StatusBar style="dark" />

      <Animated.View
        style={[styles.card, { opacity: fadeIn, transform: [{ translateY: slideIn }] }]}
      >
        {/* Brand row with real logo */}
        <View style={styles.brandRow}>
          <Logo size={52} />
          <View>
            <Text style={styles.brandName}>MonoScrum</Text>
            <Text style={styles.brandTag}>KIOSK · ATTENDANCE</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* <Text style={styles.title}>Operator Sign In</Text>
        <Text style={styles.subtitle}>
          Authorized personnel only. Sign in to activate face scanning.
        </Text> */}

        {/* Email */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={onChangeEmail}
            placeholder="operator@company.com"
            placeholderTextColor="#8FA3C0"
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!busy}
          />
        </View>

        {/* Password */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={[styles.input, { paddingRight: 40 }]}
              value={password}
              onChangeText={onChangePassword}
              placeholder="••••••••"
              placeholderTextColor="#8FA3C0"
              secureTextEntry={!showPassword}
              editable={!busy}
              onSubmitEditing={onLogin}
            />
            <Pressable
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#8FA3C0"
              />
            </Pressable>
          </View>
        </View>

        {/* Error */}
        {!!error && (
          <View style={styles.errorBox}>
            <Ionicons name="warning-outline" size={18} color={Colors.red} style={{ marginRight: 6 }} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Submit */}
        <Pressable
          style={({ pressed }) => [
            styles.loginBtn,
            busy && styles.loginBtnDisabled,
            pressed && styles.loginBtnPressed,
          ]}
          onPress={onLogin}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={styles.loginBtnText}>Start Kiosk</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </View>
          )}
        </Pressable>

        <Text style={styles.footer}>Powered by Stackdot · MonoScrum v2</Text>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
