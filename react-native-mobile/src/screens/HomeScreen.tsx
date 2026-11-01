import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Alert, Animated, Easing, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/context/AuthContext';
import { colors, fonts, gradients } from '@/theme';

type Section = {
  key: string;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  gradient: readonly [string, string];
};

const SECTIONS: Section[] = [
  {
    key: 'churches',
    title: 'Churches',
    subtitle: 'Browse every church and company in the mission.',
    icon: 'church',
    gradient: [colors.royal, colors.plum],
  },
  {
    key: 'members',
    title: 'Members',
    subtitle: 'Find member profiles and contact details.',
    icon: 'account-group',
    gradient: [colors.dawn, colors.coral],
  },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] ?? '?').slice(0, 2);
  return letters.toUpperCase();
}

/** Landing screen after login. The Churches and Members pages plug in here next. */
export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();

  const enter = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(enter, {
      toValue: 1,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [enter]);

  const name = user?.name ?? 'Friend';
  const firstName = name.trim().split(/\s+/)[0] || 'Friend';

  const confirmSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          void signOut();
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={gradients.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 18 }]}
      >
        <View style={styles.headerTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(name)}</Text>
          </View>

          <Pressable
            onPress={confirmSignOut}
            style={({ pressed }) => [styles.signOut, pressed && styles.signOutPressed]}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
          >
            <Ionicons name="log-out-outline" size={20} color={colors.white} />
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        </View>

        <Text style={styles.greeting}>{getGreeting()},</Text>
        <Text style={styles.name}>{firstName}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>What would you like to manage?</Text>

        {SECTIONS.map((section, index) => (
          <Animated.View
            key={section.key}
            style={{
              opacity: enter,
              transform: [
                {
                  translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [30 + index * 20, 0] }),
                },
              ],
            }}
          >
            <View style={styles.card}>
              <LinearGradient
                colors={section.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardIcon}
              >
                <MaterialCommunityIcons name={section.icon} size={30} color={colors.white} />
              </LinearGradient>

              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{section.title}</Text>
                <Text style={styles.cardSubtitle}>{section.subtitle}</Text>
              </View>

              <View style={styles.pill}>
                <Text style={styles.pillText}>Coming next</Text>
              </View>
            </View>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.mist,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 34,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 211, 105, 0.18)',
    borderWidth: 1.5,
    borderColor: colors.gold,
  },
  avatarText: {
    fontFamily: fonts.bodySemi,
    fontSize: 17,
    color: colors.gold,
  },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  signOutPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
  },
  signOutText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.white,
  },
  greeting: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.78)',
  },
  name: {
    fontFamily: fonts.heading,
    fontSize: 36,
    lineHeight: 44,
    color: colors.white,
  },
  email: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.gold,
    marginTop: 2,
  },
  content: {
    padding: 24,
    gap: 16,
  },
  sectionTitle: {
    fontFamily: fonts.headingSemi,
    fontSize: 20,
    color: colors.ink,
    marginBottom: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.white,
    borderRadius: 22,
    padding: 16,
    shadowColor: colors.indigo,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  cardIcon: {
    width: 62,
    height: 62,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: fonts.headingSemi,
    fontSize: 19,
    color: colors.ink,
  },
  cardSubtitle: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.slate,
    marginTop: 2,
  },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.mist,
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  pillText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.royal,
  },
});
