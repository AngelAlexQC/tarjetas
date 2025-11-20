import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';
import React from 'react';
function ThemedLayoutContainer({ children }: { children: React.ReactNode }) {
  const theme = useAppTheme();
  return (
    <View style={{ flex: 1, width: '100%', height: '100%', backgroundColor: theme.colors.background }}>
      <View style={{ flex: 1, width: '100%', paddingHorizontal: 16 }}>{children}</View>
    </View>
  );
}

import { AnimatedSplashScreen } from '@/components/animated-splash-screen';
import { TenantThemeProvider } from '@/contexts/tenant-theme-context';
import { useAppTheme } from '@/hooks/use-app-theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

function Navigation() {
  const theme = useAppTheme();

  return (
    <AnimatedSplashScreen>
      <ThemeProvider value={theme.isDark ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AnimatedSplashScreen>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <TenantThemeProvider>
        <ThemedLayoutContainer>
          <Navigation />
        </ThemedLayoutContainer>
      </TenantThemeProvider>
    </SafeAreaProvider>
  );
}
