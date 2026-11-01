import { PlayfairDisplay_600SemiBold, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { colors } from '@/theme';

// Keep the native splash screen up until the fonts and the saved session are ready.
SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigator() {
  const { user, isRestoring } = useAuth();

  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const ready = (fontsLoaded || fontError != null) && !isRestoring;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  const isSignedIn = user !== null;

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: colors.night } }}>
        {/* Only reachable when signed in. Add the Churches and Members screens here next. */}
        <Stack.Protected guard={isSignedIn}>
          <Stack.Screen name="index" />
        </Stack.Protected>

        {/* Only reachable when signed out. */}
        <Stack.Protected guard={!isSignedIn}>
          <Stack.Screen name="login" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
