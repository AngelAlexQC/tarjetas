import { authRepository$ } from '@/repositories';
import { loggers } from '@/utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

const log = loggers.auth;

// Storage Keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  USERNAME_REMEMBERED: 'username_remembered',
};

export interface User {
  id: string;
  username: string;
  email?: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBiometricEnabled: boolean;
  isBiometricAvailable: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  enableBiometric: () => Promise<void>;
  disableBiometric: () => Promise<void>;
  authenticateWithBiometric: () => Promise<{ success: boolean; error?: string }>;
  rememberUsername: (username: string) => Promise<void>;
  getRememberedUsername: () => Promise<string | null>;
  clearRememberedUsername: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  // Verificar disponibilidad de biométrica al iniciar
  useEffect(() => {
    checkBiometricAvailability();
    loadSession();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setIsBiometricAvailable(hasHardware && isEnrolled);
    } catch (error) {
      log.error('Error checking biometric availability:', error);
      setIsBiometricAvailable(false);
    }
  };

  const loadSession = async () => {
    try {
      const [userDataStr, biometricEnabledStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
        AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED),
      ]);

      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        setUser(userData);
      }

      setIsBiometricEnabled(biometricEnabledStr === 'true');
    } catch (error) {
      log.error('Error loading session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Usar el repositorio de autenticación
      const authRepo = authRepository$();
      const response = await authRepo.login({ username, password });

      // Guardar credenciales de manera segura
      if (Platform.OS === 'web') {
        // En web, SecureStore no está disponible, usar AsyncStorage
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);
      } else {
        // En nativo, usar SecureStore para mayor seguridad
        await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, response.token);
      }

      // Guardar datos del usuario
      const userData: User = {
        id: response.user.id,
        username: response.user.username,
        email: response.user.email,
        name: response.user.name,
      };
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      
      setUser(userData);
      return { success: true };
    } catch (error) {
      log.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión. Intenta de nuevo.';
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Llamar al repositorio para logout (si el backend lo necesita)
      const authRepo = authRepository$();
      await authRepo.logout();
      
      // Limpiar todos los datos excepto el tenant y onboarding
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      } else {
        await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
      }
      
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.BIOMETRIC_ENABLED,
      ]);

      setUser(null);
      setIsBiometricEnabled(false);
    } catch (error) {
      log.error('Logout error:', error);
    }
  }, []);

  const enableBiometric = useCallback(async () => {
    try {
      if (!isBiometricAvailable) {
        log.warn('Biometric authentication not available');
        return;
      }

      await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, 'true');
      setIsBiometricEnabled(true);
    } catch (error) {
      log.error('Error enabling biometric:', error);
    }
  }, [isBiometricAvailable]);

  const disableBiometric = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, 'false');
      setIsBiometricEnabled(false);
    } catch (error) {
      log.error('Error disabling biometric:', error);
    }
  }, []);

  const authenticateWithBiometric = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!isBiometricAvailable) {
        return { success: false, error: 'Autenticación biométrica no disponible' };
      }

      // Primero restauramos el usuario si existe
      const userDataStr = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (!userDataStr) {
        return { success: false, error: 'No hay sesión guardada' };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Accede con tu biometría',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
        fallbackLabel: 'Usar contraseña',
      });

      if (result.success) {
        // Restaurar usuario después de autenticación exitosa
        setUser(JSON.parse(userDataStr));
        return { success: true };
      } else {
        return { 
          success: false, 
          error: result.error === 'user_cancel' ? 'Cancelado por el usuario' : 'Autenticación fallida' 
        };
      }
    } catch (error) {
      log.error('Biometric authentication error:', error);
      return { success: false, error: 'Error en la autenticación biométrica' };
    }
  }, [isBiometricAvailable]);

  const rememberUsername = useCallback(async (username: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USERNAME_REMEMBERED, username);
    } catch (error) {
      log.error('Error saving username:', error);
    }
  }, []);

  const getRememberedUsername = useCallback(async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.USERNAME_REMEMBERED);
    } catch (error) {
      log.error('Error loading username:', error);
      return null;
    }
  }, []);

  const clearRememberedUsername = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USERNAME_REMEMBERED);
    } catch (error) {
      log.error('Error clearing username:', error);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isBiometricEnabled,
        isBiometricAvailable,
        login,
        logout,
        enableBiometric,
        disableBiometric,
        authenticateWithBiometric,
        rememberUsername,
        getRememberedUsername,
        clearRememberedUsername,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
