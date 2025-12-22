/**
 * Auth Flow Hook
 * 
 * Maneja el flujo completo de autenticación:
 * - Onboarding
 * - Login tradicional
 * - Autenticación biométrica
 * - Navegación post-autenticación
 * - Bloqueo de app al volver del background
 */

import { TIMING } from '@/constants/app';
import { useAuth } from '@/contexts/auth-context';
import { useTenantTheme } from '@/contexts/tenant-theme-context';
import { useTour } from '@/contexts/tour-context';
import { authStorage } from '@/utils/auth-storage';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export type AuthFlowScreen = 'loading' | 'onboarding' | 'name-input' | 'login' | 'recover-user' | 'biometric-access' | 'main';

interface UseAuthFlowState {
  /** Pantalla actual que se debe mostrar */
  currentScreen: AuthFlowScreen;
  /** Si se debe mostrar el modal de habilitar biométrica */
  showBiometricModal: boolean;
}

interface UseAuthFlowReturn extends UseAuthFlowState {
  /** Llamar cuando el onboarding termina */
  handleOnboardingFinish: () => Promise<void>;
  /** Llamar cuando el usuario ingresa su nombre */
  handleNameSubmit: (name: string) => Promise<void>;
  /** Llamar cuando el usuario quiere recuperar su usuario */
  handleRecoverUser: () => void;
  /** Llamar cuando el usuario cancela la recuperación */
  handleRecoverUserCancel: () => void;
  /** Llamar cuando el login es exitoso */
  handleLoginSuccess: () => void;
  /** Llamar cuando la autenticación biométrica es exitosa */
  handleBiometricSuccess: () => void;
  /** Llamar cuando el usuario elige usar contraseña en lugar de biométrica */
  handleBiometricUsePassword: () => void;
  /** Llamar cuando el usuario habilita biométrica desde el modal */
  handleEnableBiometric: () => Promise<void>;
  /** Llamar cuando el usuario omite habilitar biométrica */
  handleSkipBiometric: () => void;
}

export function useAuthFlow(): UseAuthFlowReturn {
  const router = useRouter();
  const { currentTheme, isLoading: isTenantLoading } = useTenantTheme();
  const { 
    isAuthenticated, 
    isLoading: isAuthLoading, 
    isBiometricEnabled, 
    isBiometricAvailable,
    enableBiometric 
  } = useAuth();
  const { setAppReady, resumeTour } = useTour();

  const initialCheckDone = useRef(false);
  const _appState = useRef<AppStateStatus>(AppState.currentState);
  const lastBiometricSuccess = useRef<number>(0);

  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [showNameInput, setShowNameInput] = useState<boolean | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRecoverUser, setShowRecoverUser] = useState(false);
  const [showBiometricAccess, setShowBiometricAccess] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);

  // Cargar estado inicial
  useEffect(() => {
    const loadState = async () => {
      try {
        const [onboardingCompleted, installationName] = await Promise.all([
          authStorage.getOnboardingStatus(),
          authStorage.getInstallationName(),
        ]);
        
        setShowOnboarding(!onboardingCompleted);
        setShowNameInput(!installationName);
      } catch {
        setShowOnboarding(true);
        setShowNameInput(true);
      }
    };
    loadState();
  }, []);

  // Navegación después de la autenticación
  useEffect(() => {
    if (!isTenantLoading && !initialCheckDone.current && isAuthenticated) {
      initialCheckDone.current = true;
      const hasTenant = currentTheme && currentTheme.slug !== 'default';
      
      if (hasTenant) {
        router.replace('/(tabs)/cards');
        setTimeout(setAppReady, TIMING.APP_READY_DELAY_WITH_TENANT);
      } else {
        router.replace('/(tabs)');
        setTimeout(setAppReady, TIMING.APP_READY_DELAY_WITHOUT_TENANT);
      }
    }
  }, [isTenantLoading, isAuthenticated, currentTheme, router, setAppReady]);

  // Helper para navegar según el estado del tenant
  const navigateToMain = useCallback(() => {
    const hasTenant = currentTheme && currentTheme.slug !== 'default';
    router.replace(hasTenant ? '/(tabs)/cards' : '/(tabs)');
  }, [currentTheme, router]);

  // Handlers
  const handleOnboardingFinish = useCallback(async () => {
    await authStorage.setOnboardingCompleted();
    setShowOnboarding(false);
    // showNameInput se mantiene true si no hay nombre guardado
  }, []);

  const handleNameSubmit = useCallback(async (name: string) => {
    await authStorage.saveInstallationName(name);
    setShowNameInput(false);
    setShowLogin(true);
  }, []);

  const handleRecoverUser = useCallback(() => {
    setShowLogin(false);
    setShowRecoverUser(true);
  }, []);

  const handleRecoverUserCancel = useCallback(() => {
    setShowRecoverUser(false);
    setShowLogin(true);
  }, []);

  const handleLoginSuccess = useCallback(() => {
    setShowLogin(false);
    if (isBiometricAvailable && !isBiometricEnabled) {
      setShowBiometricModal(true);
    } else {
      navigateToMain();
    }
  }, [isBiometricAvailable, isBiometricEnabled, navigateToMain]);

  const handleBiometricSuccess = useCallback(() => {
    lastBiometricSuccess.current = Date.now();
    setShowBiometricAccess(false);
    resumeTour();
  }, [resumeTour]);

  const handleBiometricUsePassword = useCallback(() => {
    setShowBiometricAccess(false);
    setShowLogin(true);
  }, []);

  const handleEnableBiometric = useCallback(async () => {
    await enableBiometric();
    setShowBiometricModal(false);
    navigateToMain();
  }, [enableBiometric, navigateToMain]);

  const handleSkipBiometric = useCallback(() => {
    setShowBiometricModal(false);
    navigateToMain();
  }, [navigateToMain]);

  // Calcular pantalla actual
  const isLoading = showOnboarding === null || showNameInput === null || isAuthLoading || isTenantLoading;
  
  let currentScreen: AuthFlowScreen;
  if (isLoading) {
    currentScreen = 'loading';
  } else if (showOnboarding) {
    currentScreen = 'onboarding';
  } else if (showNameInput) {
    currentScreen = 'name-input';
  } else if (showRecoverUser) {
    currentScreen = 'recover-user';
  } else if (showBiometricAccess) {
    currentScreen = 'biometric-access';
  } else if (showLogin) {
    currentScreen = 'login';
  } else {
    currentScreen = 'main';
  }

  return {
    currentScreen,
    showBiometricModal,
    handleOnboardingFinish,
    handleNameSubmit,
    handleRecoverUser,
    handleRecoverUserCancel,
    handleLoginSuccess,
    handleBiometricSuccess,
    handleBiometricUsePassword,
    handleEnableBiometric,
    handleSkipBiometric,
  };
}
