import { AnimatedSplashScreen } from '@/components/animated-splash-screen';
import { BiometricAccessScreen } from '@/components/biometric-access-screen';
import { BiometricEnableModal } from '@/components/biometric-enable-modal';
import { LoginScreen } from '@/components/login-screen';
import { OnboardingScreen } from '@/components/onboarding-screen';
import { STORAGE_KEYS, TIMING } from '@/constants/app';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { SplashProvider } from '@/contexts/splash-context';
import { TenantThemeProvider, useTenantTheme } from '@/contexts/tenant-theme-context';
import { TourProvider, useTour } from '@/contexts/tour-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Platform, Pressable, StyleSheet, View } from 'react-native';
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
  const { setAppReady, isTourActive, stopTour, pauseTour, resumeTour } = useTour();
  const router = useRouter();
  const initialCheckDone = useRef(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showBiometricAccess, setShowBiometricAccess] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const appState = useRef(AppState.currentState);
  const lastBiometricSuccess = useRef<number>(0);

  // Manejar AppState para bloqueo biométrico al regresar a la app
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        const timeSinceLastSuccess = Date.now() - lastBiometricSuccess.current;
        // Ignorar si la autenticación fue exitosa dentro del periodo de gracia
        // Esto evita el bucle causado por el cierre del diálogo biométrico del sistema
        if (isAuthenticated && isBiometricEnabled && timeSinceLastSuccess > TIMING.BIOMETRIC_GRACE_PERIOD) {
          pauseTour();
          setShowBiometricAccess(true);
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated, isBiometricEnabled, pauseTour]);

  // Verificar biométrica al inicio si hay sesión guardada
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && isBiometricEnabled && !initialCheckDone.current) {
      pauseTour();
      setShowBiometricAccess(true);
    }
  }, [isAuthLoading, isAuthenticated, isBiometricEnabled, pauseTour]);

  // Cargar estado de onboarding
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED).then(value => {
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
        }, TIMING.APP_READY_DELAY_WITH_TENANT);
      } else {
        // Usuario autenticado pero sin tenant, mostrar selector
        router.replace('/(tabs)');
        setTimeout(() => {
          setAppReady();
        }, TIMING.APP_READY_DELAY_WITHOUT_TENANT);
      }
    }
  }, [isTenantLoading, isAuthenticated, currentTheme, router, setAppReady]);

  const handleBiometricSuccess = useCallback(async () => {
    // La autenticación fue exitosa en el contexto
    lastBiometricSuccess.current = Date.now();
    setShowBiometricAccess(false);
    resumeTour();
    // No navegamos aquí para preservar el estado de navegación actual
    // Si es el inicio de la app, el useEffect de navegación inicial se encargará (o ya se encargó)
  }, [resumeTour]);

  const handleBiometricUsePassword = useCallback(() => {
    setShowBiometricAccess(false);
    setShowLogin(true);
  }, []);

  const handleOnboardingFinish = async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
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

  // Determinar si mostrar el contenido principal (Stack)
  // Lo mostramos siempre que no estemos en onboarding, login inicial o cargando
  // La pantalla biométrica se mostrará ENCIMA de esto
  const showMainContent = !isLoading && !showOnboarding && !showLogin;

  return (
    <AnimatedSplashScreen>
      <ThemeProvider value={navTheme}>
        {showMainContent && (
          <>
            <Stack screenOptions={{
              contentStyle: { backgroundColor: theme.colors.background },
              animation: 'fade',
              headerLargeTitle: Platform.OS === 'ios',
              headerTransparent: Platform.OS === 'ios',
              headerBlurEffect: Platform.OS === 'ios' ? (theme.isDark ? 'dark' : 'light') : undefined,
              headerLargeTitleShadowVisible: false,
              headerStyle: {
                backgroundColor: Platform.OS === 'ios' ? 'transparent' : theme.colors.background,
              },
              headerTintColor: theme.colors.text,
            }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="cards/[id]" options={{ headerShown: false }} />
              <Stack.Screen 
                name="profile" 
                options={{ 
                  headerShown: false,
                }} 
              />
              <Stack.Screen 
                name="faq" 
                options={{ 
                  headerShown: false,
                }} 
              />
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

        {isLoading && (
          <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <ActivityIndicator size="large" color={theme.tenant.mainColor} />
          </View>
        )}

        {showOnboarding && (
          <OnboardingScreen onFinish={handleOnboardingFinish} />
        )}

        {showBiometricAccess && (
          <View style={[StyleSheet.absoluteFill, { zIndex: 10000, backgroundColor: theme.colors.background }]}>
            <BiometricAccessScreen
              onSuccess={handleBiometricSuccess}
              onUsePassword={handleBiometricUsePassword}
              userName={user?.name || user?.username}
            />
          </View>
        )}

        {showLogin && (
          <>
            <LoginScreen onLoginSuccess={handleLoginSuccess} />
            <BiometricEnableModal
              isVisible={showBiometricModal}
              onEnable={handleEnableBiometric}
              onSkip={handleSkipBiometric}
            />
          </>
        )}
      </ThemeProvider>
    </AnimatedSplashScreen>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SplashProvider>
        <TenantThemeProvider>
          <AuthProvider>
            <TourProvider>
              <ThemedLayoutContainer>
                <Navigation />
              </ThemedLayoutContainer>
            </TourProvider>
          </AuthProvider>
        </TenantThemeProvider>
      </SplashProvider>
    </SafeAreaProvider>
  );
}
