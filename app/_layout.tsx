import { AnimatedSplashScreen } from '@/components/animated-splash-screen';
import { TenantThemeProvider, useTenantTheme } from '@/contexts/tenant-theme-context';
import { TourProvider } from '@/contexts/tour-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function ThemedLayoutContainer({ children }: { children: React.ReactNode }) {
  const theme = useAppTheme();
  const { contentMaxWidth, horizontalPadding } = useResponsiveLayout();
  return (
    <View style={{ flex: 1, width: '100%', height: '100%', backgroundColor: theme.colors.background }}>
      <View
        style={{
          flex: 1,
          width: '100%',
          maxWidth: contentMaxWidth,
          alignSelf: 'center',
        }}
      >
        {children}
      </View>
    </View>
  );
}

export const unstable_settings = {
  anchor: '(tabs)',
};

function Navigation() {
  const theme = useAppTheme();
  const { currentTheme, isLoading } = useTenantTheme();
  const router = useRouter();
  const initialCheckDone = useRef(false);

  useEffect(() => {
    if (!isLoading && !initialCheckDone.current) {
      initialCheckDone.current = true;
      if (currentTheme && currentTheme.slug !== 'default') {
        router.replace('/(tabs)/cards');
      }
    }
  }, [isLoading, currentTheme, router]);

  const navBase = theme.isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...navBase,
    colors: {
      ...navBase.colors,
      background: theme.colors.background,
      card: theme.colors.surface,
      border: theme.colors.borderSubtle,
      text: theme.colors.text,
      primary: theme.tenant.mainColor,
    },
  };
  return (
    <AnimatedSplashScreen>
      <ThemeProvider value={navTheme}>
        <Stack screenOptions={{
          contentStyle: { backgroundColor: theme.colors.background },
          animation: 'fade',
        }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="cards/[id]" options={{ headerShown: false }} />
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
        <TourProvider>
          <ThemedLayoutContainer>
            <Navigation />
          </ThemedLayoutContainer>
        </TourProvider>
      </TenantThemeProvider>
    </SafeAreaProvider>
  );
}
