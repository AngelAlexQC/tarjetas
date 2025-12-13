import { initializeSSLPinning } from '@/api/ssl-pinning';
import { AnimatedSplashScreen } from '@/components/animated-splash-screen';
import { AuthScreensContainer } from '@/components/auth-screens-container';
import { BiometricAccessScreen } from '@/components/biometric-access-screen';
import { BiometricEnableModal } from '@/components/biometric-enable-modal';
import { ErrorFallback } from '@/components/error-fallback';
import { OnboardingScreen } from '@/components/onboarding-screen';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { SplashProvider } from '@/contexts/splash-context';
import { TenantThemeProvider } from '@/contexts/tenant-theme-context';
import { TourProvider, useTour } from '@/contexts/tour-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useAuthFlow } from '@/hooks/use-auth-flow';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import React, { useEffect } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Color de fondo inicial para evitar flash blanco (mismo que el splash screen)
const INITIAL_BACKGROUND_COLOR = '#0D1117';

// Configurar el color de fondo del sistema inmediatamente
SystemUI.setBackgroundColorAsync(INITIAL_BACKGROUND_COLOR);

// Inicializar SSL Pinning al startup
initializeSSLPinning().catch(err => {
  console.error('Failed to initialize SSL Pinning:', err);
  // En producción, esto sería crítico
  if (!__DEV__) {
    // Aquí podrías mostrar un error crítico al usuario
    throw err;
  }
});

/**
 * ErrorBoundary global para la app.
 * Expo Router envuelve automáticamente las rutas con este componente.
 */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return <ErrorFallback error={error} retry={retry} />;
}

function ThemedLayoutContainer({ children }: { children: React.ReactNode }) {
  const theme = useAppTheme();
  const { contentMaxWidth } = useResponsiveLayout();
  
  // Actualizar el color de fondo del sistema cuando el tema cambie
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.colors.background);
  }, [theme.colors.background]);
  
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
  const { user } = useAuth();
  const { isTourActive, stopTour } = useTour();
  
  const {
    currentScreen,
    showBiometricModal,
    handleOnboardingFinish,
    handleLoginSuccess,
    handleBiometricSuccess,
    handleBiometricUsePassword,
    handleEnableBiometric,
    handleSkipBiometric,
  } = useAuthFlow();

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
        {/* Main Navigation Stack */}
        {currentScreen === 'main' && (() => {
          const isIOS = Platform.OS === 'ios';
          const headerBlurEffect = isIOS ? (theme.isDark ? 'dark' : 'light') : undefined;
          
          return (
          <>
            <Stack screenOptions={{
              contentStyle: { backgroundColor: theme.colors.background },
              animation: 'fade',
              headerLargeTitle: isIOS,
              headerTransparent: isIOS,
              headerBlurEffect,
              headerLargeTitleShadowVisible: false,
              headerStyle: {
                backgroundColor: isIOS ? 'transparent' : theme.colors.background,
              },
              headerTintColor: theme.colors.text,
            }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="cards/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="profile" options={{ headerShown: false }} />
              <Stack.Screen name="faq" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style="auto" />
            {isTourActive && (
              <Pressable 
                style={[StyleSheet.absoluteFill, { zIndex: 9999 }]} 
                onPress={stopTour} 
              />
            )}
          </>
          );
        })()}

        {/* Loading Screen */}
        {currentScreen === 'loading' && (
          <View style={[StyleSheet.absoluteFillObject, styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
            <ActivityIndicator size="large" color={theme.tenant.mainColor} />
          </View>
        )}

        {/* Onboarding Screen */}
        {currentScreen === 'onboarding' && (
          <OnboardingScreen onFinish={handleOnboardingFinish} />
        )}

        {/* Biometric Access Screen */}
        {currentScreen === 'biometric-access' && (
          <View style={[StyleSheet.absoluteFill, { zIndex: 10000, backgroundColor: theme.colors.background }]}>
            <BiometricAccessScreen
              onSuccess={handleBiometricSuccess}
              onUsePassword={handleBiometricUsePassword}
              userName={user?.name || user?.username}
            />
          </View>
        )}

        {/* Login Screen - Ahora con navegación completa de autenticación */}
        {currentScreen === 'login' && (
          <>
            <AuthScreensContainer onLoginSuccess={handleLoginSuccess} />
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

const styles = StyleSheet.create({
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  rootContainer: {
    flex: 1,
    backgroundColor: INITIAL_BACKGROUND_COLOR,
  },
});

export default function RootLayout() {
  return (
    <View style={styles.rootContainer}>
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
    </View>
  );
}
