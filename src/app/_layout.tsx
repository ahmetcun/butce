import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { useTheme } from '@/hooks/use-theme';
import { useBudget, useHydrated } from '@/store/budget';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const hydrated = useHydrated();
  const onboarded = useBudget((s) => s.onboarded);
  const t = useTheme();

  useEffect(() => {
    if (hydrated) SplashScreen.hideAsync();
  }, [hydrated]);

  if (!hydrated) return null;

  const base = t.scheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider
      value={{
        ...base,
        colors: { ...base.colors, primary: t.primary, background: t.background, card: t.surface, text: t.text, border: t.border },
      }}>
      <StatusBar style="light" />
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
  );
}
