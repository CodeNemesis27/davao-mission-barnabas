import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  type TextInputInstance,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getErrorMessage } from '@/api/client';
import AppInput from '@/components/AppInput';
import ChurchHero from '@/components/ChurchHero';
import FloatingOrbs from '@/components/FloatingOrbs';
import GradientButton from '@/components/GradientButton';
import Stars from '@/components/Stars';
import { useAuth } from '@/context/AuthContext';
import { colors, fonts, gradients } from '@/theme';

type FieldErrors = { email?: string; password?: string };

export default function LoginScreen() {
  const { signIn } = useAuth();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const passwordRef = useRef<TextInputInstance>(null);

  // Entrance animation (hero fades in, card slides up) and the "wrong password" shake.
  const enter = useRef(new Animated.Value(0)).current;
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [enter]);

  const runShake = () => {
    shake.setValue(0);
    Animated.sequence(
      [12, -12, 9, -9, 5, 0].map((toValue) =>
        Animated.timing(shake, { toValue, duration: 55, useNativeDriver: true }),
      ),
    ).start();
  };

  const validate = (): boolean => {
    const next: FieldErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      next.email = 'Please enter your email address.';
    } else if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      next.email = "That email address doesn't look right.";
    }
    if (!password) {
      next.password = 'Please enter your password.';
    }

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleLogin = async () => {
    if (loading) return;
    Keyboard.dismiss();
    setError(null);

    if (!validate()) {
      runShake();
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      // On success the root layout swaps this screen for the Home screen.
    } catch (err) {
      setError(getErrorMessage(err));
      runShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
        >
          {/* Dawn sky with the church */}
          <LinearGradient
            colors={gradients.sky}
            locations={[0, 0.4, 0.75, 1]}
            style={[styles.hero, { paddingTop: insets.top + 16 }]}
          >
            <Stars />
            <FloatingOrbs />

            <Animated.View
              style={[
                styles.brand,
                {
                  opacity: enter,
                  transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [-24, 0] }) }],
                },
              ]}
            >
              <View style={styles.badge}>
                <MaterialCommunityIcons name="church" size={26} color={colors.gold} />
              </View>
              <Text style={styles.overline}>DAVAO MISSION</Text>
              <Text style={styles.title}>Barnabas</Text>
              <Text style={styles.tagline}>Church & Member Management</Text>
            </Animated.View>

            <Animated.View style={{ opacity: enter }}>
              <ChurchHero />
            </Animated.View>
          </LinearGradient>

          {/* Sign-in card */}
          <Animated.View
            style={[
              styles.card,
              {
                paddingBottom: insets.bottom + 24,
                opacity: enter,
                transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [70, 0] }) }],
              },
            ]}
          >
            <Text style={styles.welcome}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to manage your churches and members.</Text>

            <Animated.View style={{ transform: [{ translateX: shake }] }}>
              {error ? (
                <View style={styles.banner} accessibilityRole="alert">
                  <Ionicons name="alert-circle" size={20} color={colors.danger} />
                  <Text style={styles.bannerText}>{error}</Text>
                </View>
              ) : null}

              <AppInput
                label="Email address"
                icon="mail-outline"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                error={fieldErrors.email}
                editable={!loading}
              />

              <AppInput
                inputRef={passwordRef}
                label="Password"
                icon="lock-closed-outline"
                isPassword
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="Enter your password"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={handleLogin}
                error={fieldErrors.password}
                editable={!loading}
              />

              <View style={styles.buttonWrap}>
                <GradientButton title="Sign In" onPress={handleLogin} loading={loading} />
              </View>
            </Animated.View>

            <View style={styles.secureRow}>
              <Ionicons name="shield-checkmark-outline" size={16} color={colors.success} />
              <Text style={styles.secureText}>Your session is stored securely on this device.</Text>
            </View>

            <Text style={styles.footer}>
              Need an account? <Text style={styles.footerStrong}>Contact your administrator.</Text>
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.night,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
  hero: {
    overflow: 'hidden',
  },
  brand: {
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 18,
  },
  badge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 211, 105, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 211, 105, 0.4)',
    marginBottom: 12,
  },
  overline: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    letterSpacing: 5,
    color: colors.gold,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: 44,
    lineHeight: 52,
    color: colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: 13,
    letterSpacing: 0.6,
    color: 'rgba(255, 255, 255, 0.78)',
    marginTop: 2,
  },
  card: {
    flexGrow: 1,
    marginTop: -28,
    backgroundColor: colors.white,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  welcome: {
    fontFamily: fonts.heading,
    fontSize: 30,
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.slate,
    marginTop: 4,
    marginBottom: 24,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.dangerBg,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  bannerText: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    lineHeight: 19,
    color: colors.danger,
  },
  buttonWrap: {
    marginTop: 8,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 22,
  },
  secureText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.slate,
  },
  footer: {
    fontFamily: fonts.body,
    fontSize: 13,
    textAlign: 'center',
    color: colors.slate,
    marginTop: 14,
  },
  footerStrong: {
    fontFamily: fonts.bodySemi,
    color: colors.royal,
  },
});
