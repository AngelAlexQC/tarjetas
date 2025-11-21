import { AnimatedSplashScreen } from '@/components/animated-splash-screen';
import { OnboardingScreen } from '@/components/onboarding-screen';
import { TenantThemeProvider, useTenantTheme } from '@/contexts/tenant-theme-context';
import { TourProvider, useTour } from '@/contexts/tour-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
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
  const { setAppReady, isTourActive, stopTour } = useTour();
  const router = useRouter();
  const initialCheckDone = useRef(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('@onboarding_completed').then(value => {
      setShowOnboarding(value !== 'true');
    });
  }, []);

  useEffect(() => {
    if (!isLoading && !initialCheckDone.current && showOnboarding === false) {
      initialCheckDone.current = true;
      if (currentTheme && currentTheme.slug !== 'default') {
        router.replace('/(tabs)/cards');
        // Esperar a que la navegación termine y el splash desaparezca (3s splash + navegación)
        setTimeout(() => {
          setAppReady();
        }, 4500);
      } else {
        // Esperar a que el splash desaparezca completamente (3s splash + buffer)
        setTimeout(() => {
          setAppReady();
        }, 4000);
      }
    }
  }, [isLoading, currentTheme, router, setAppReady, showOnboarding]);

  const handleOnboardingFinish = async () => {
    await AsyncStorage.setItem('@onboarding_completed', 'true');
    setShowOnboarding(false);
  };

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
        {showOnboarding === null ? (
          <View style={{ flex: 1, backgroundColor: theme.colors.background }} />
        ) : showOnboarding ? (
          <OnboardingScreen onFinish={handleOnboardingFinish} />
        ) : (
          <>
            <Stack screenOptions={{
              contentStyle: { backgroundColor: theme.colors.background },
              animation: 'fade',
            }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="cards/[id]" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="auto" />
            {isTourActive && (
              <Pressable 
                style={[StyleSheet.absoluteFill, { zIndex: 9999 }]} 
                onPress={stopTour} 
              />
            )}
          </>
        )}
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
