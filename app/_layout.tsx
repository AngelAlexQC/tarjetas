import { AnimatedSplashScreen } from '@/components/animated-splash-screen';
import { BiometricAccessScreen } from '@/components/biometric-access-screen';
import { BiometricEnableModal } from '@/components/biometric-enable-modal';
import { LoginScreen } from '@/components/login-screen';
import { OnboardingScreen } from '@/components/onboarding-screen';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { TenantThemeProvider, useTenantTheme } from '@/contexts/tenant-theme-context';
import { TourProvider, useTour } from '@/contexts/tour-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function ThemedLayoutContainer({ children }: { children: React.ReactNode }) {
  const theme = useAppTheme();
  const { contentMaxWidth } = useResponsiveLayout();
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
  const { currentTheme, isLoading: isTenantLoading } = useTenantTheme();
  const { 
    user,
    isAuthenticated, 
    isLoading: isAuthLoading, 
    isBiometricEnabled, 
    isBiometricAvailable,
    enableBiometric 
  } = useAuth();
  const { setAppReady, isTourActive, stopTour } = useTour();
  const router = useRouter();
  const initialCheckDone = useRef(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showBiometricAccess, setShowBiometricAccess] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);

  // Cargar estado de onboarding
  useEffect(() => {
    AsyncStorage.getItem('@onboarding_completed').then(value => {
      setShowOnboarding(value !== 'true');
    });
  }, []);

  // Determinar qué pantalla mostrar después del onboarding
  useEffect(() => {
    if (showOnboarding === false && !isAuthenticated && !isAuthLoading) {
      if (isBiometricEnabled && isBiometricAvailable) {
        // Si tiene biométrica habilitada, mostrar pantalla de acceso biométrico
        setShowBiometricAccess(true);
      } else {
        // Si no, mostrar login tradicional
        setShowLogin(true);
      }
    }
  }, [showOnboarding, isAuthenticated, isAuthLoading, isBiometricEnabled, isBiometricAvailable]);

  // Navegación después de la autenticación
  useEffect(() => {
    if (!isTenantLoading && !initialCheckDone.current && isAuthenticated) {
      initialCheckDone.current = true;
      if (currentTheme && currentTheme.slug !== 'default') {
        router.replace('/(tabs)/cards');
        setTimeout(() => {
          setAppReady();
        }, 4500);
      } else {
        // Usuario autenticado pero sin tenant, mostrar selector
        router.replace('/(tabs)');
        setTimeout(() => {
          setAppReady();
        }, 4000);
      }
    }
  }, [isTenantLoading, isAuthenticated, currentTheme, router, setAppReady]);

  const handleBiometricSuccess = async () => {
    // La autenticación fue exitosa en el contexto
    setShowBiometricAccess(false);
    // Navegar según el estado del tenant
    if (!currentTheme || currentTheme.slug === 'default') {
      router.replace('/(tabs)');
    } else {
      router.replace('/(tabs)/cards');
    }
  };

  const handleBiometricUsePassword = () => {
    setShowBiometricAccess(false);
    setShowLogin(true);
  };

  const handleOnboardingFinish = async () => {
    await AsyncStorage.setItem('@onboarding_completed', 'true');
    setShowOnboarding(false);
    setShowLogin(true);
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
    // Mostrar modal de biométrica si está disponible y no está habilitada
    if (isBiometricAvailable && !isBiometricEnabled) {
      setShowBiometricModal(true);
    } else {
      // Si no hay biométrica disponible, ir directo a tenant selection
      if (!currentTheme || currentTheme.slug === 'default') {
        router.replace('/(tabs)');
      } else {
        router.replace('/(tabs)/cards');
      }
    }
  };

  const handleEnableBiometric = async () => {
    await enableBiometric();
    setShowBiometricModal(false);
    // Navegar después de habilitar biométrica
    if (!currentTheme || currentTheme.slug === 'default') {
      router.replace('/(tabs)');
    } else {
      router.replace('/(tabs)/cards');
    }
  };

  const handleSkipBiometric = () => {
    setShowBiometricModal(false);
    // Navegar después de omitir biométrica
    if (!currentTheme || currentTheme.slug === 'default') {
      router.replace('/(tabs)');
    } else {
      router.replace('/(tabs)/cards');
    }
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

  // Loading state mientras se cargan los datos iniciales
  const isLoading = showOnboarding === null || isAuthLoading || isTenantLoading;

  return (
    <AnimatedSplashScreen>
      <ThemeProvider value={navTheme}>
        {isLoading ? (
          <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.tenant.mainColor} />
          </View>
        ) : showOnboarding ? (
          <OnboardingScreen onFinish={handleOnboardingFinish} />
        ) : showBiometricAccess ? (
          <BiometricAccessScreen
            onSuccess={handleBiometricSuccess}
            onUsePassword={handleBiometricUsePassword}
            userName={user?.name || user?.username}
          />
        ) : showLogin ? (
          <>
            <LoginScreen onLoginSuccess={handleLoginSuccess} />
            <BiometricEnableModal
              isVisible={showBiometricModal}
              onEnable={handleEnableBiometric}
              onSkip={handleSkipBiometric}
            />
          </>
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
        <AuthProvider>
          <TourProvider>
            <ThemedLayoutContainer>
              <Navigation />
            </ThemedLayoutContainer>
          </TourProvider>
        </AuthProvider>
      </TenantThemeProvider>
    </SafeAreaProvider>
  );
}
