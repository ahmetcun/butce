import { Lexend_400Regular, Lexend_500Medium, Lexend_600SemiBold, Lexend_700Bold, useFonts } from '@expo-google-fonts/lexend';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useBillReminders } from '@/hooks/use-bill-reminders';
import { useTheme } from '@/hooks/use-theme';
import { useBudget, useHydrated } from '@/store/budget';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const storeReady = useHydrated();
  const [fontsLoaded, fontError] = useFonts({ Lexend_400Regular, Lexend_500Medium, Lexend_600SemiBold, Lexend_700Bold });
  // Font yüklenemezse sistem fontuyla devam et
  const hydrated = storeReady && (fontsLoaded || !!fontError);
  const onboarded = useBudget((s) => s.onboarded);
  const t = useTheme();
  useBillReminders();

  useEffect(() => {
    if (hydrated) SplashScreen.hideAsync();
  }, [hydrated]);

  if (!hydrated) return null;

  const base = t.scheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider
        value={{
          ...base,
          colors: { ...base.colors, primary: t.primary, background: t.background, card: t.surface, text: t.text, border: t.border },
        }}>
        <StatusBar style={t.scheme === 'dark' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={onboarded}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="ekle" options={{ presentation: 'modal' }} />
          </Stack.Protected>
          <Stack.Protected guard={!onboarded}>
            <Stack.Screen name="hosgeldin" />
          </Stack.Protected>
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
