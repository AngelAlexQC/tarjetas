import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

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
      console.error('Error checking biometric availability:', error);
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
      console.error('Error loading session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // TODO: Reemplazar con llamada real a tu API
      // Por ahora, validación simple para desarrollo
      if (!username || !password) {
        return { success: false, error: 'Por favor completa todos los campos' };
      }

      if (password.length < 4) {
        return { success: false, error: 'La contraseña debe tener al menos 4 caracteres' };
      }

      // Simulación de autenticación
      // En producción, aquí harías la llamada a tu backend
      await new Promise(resolve => setTimeout(resolve, 800)); // Simular latencia de red

      // Usuario de ejemplo (reemplazar con respuesta del servidor)
      const userData: User = {
        id: '1',
        username: username.toLowerCase(),
        email: `${username.toLowerCase()}@example.com`,
        name: username,
      };

      // Guardar credenciales de manera segura
      if (Platform.OS === 'web') {
        // En web, SecureStore no está disponible, usar AsyncStorage
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, `token_${username}_${Date.now()}`);
      } else {
        // En nativo, usar SecureStore para mayor seguridad
        await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, `token_${username}_${Date.now()}`);
      }

      // Guardar datos del usuario
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Error al iniciar sesión. Intenta de nuevo.' };
    }
  };

  const logout = async () => {
    try {
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
      console.error('Logout error:', error);
    }
  };

  const enableBiometric = async () => {
    try {
      if (!isBiometricAvailable) {
        console.warn('Biometric authentication not available');
        return;
      }

      await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, 'true');
      setIsBiometricEnabled(true);
    } catch (error) {
      console.error('Error enabling biometric:', error);
    }
  };

  const disableBiometric = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, 'false');
      setIsBiometricEnabled(false);
    } catch (error) {
      console.error('Error disabling biometric:', error);
    }
  };

  const authenticateWithBiometric = async (): Promise<{ success: boolean; error?: string }> => {
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
      console.error('Biometric authentication error:', error);
      return { success: false, error: 'Error en la autenticación biométrica' };
    }
  };

  const rememberUsername = async (username: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USERNAME_REMEMBERED, username);
    } catch (error) {
      console.error('Error saving username:', error);
    }
  };

  const getRememberedUsername = async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.USERNAME_REMEMBERED);
    } catch (error) {
      console.error('Error loading username:', error);
      return null;
    }
  };

  const clearRememberedUsername = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USERNAME_REMEMBERED);
    } catch (error) {
      console.error('Error clearing username:', error);
    }
  };

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
