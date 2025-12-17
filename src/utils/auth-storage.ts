import { STORAGE_KEYS } from '@/constants/app';
import type { User } from '@/repositories';
import { loggers } from '@/utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const log = loggers.auth;

/**
 * Hook para manejar el almacenamiento relacionado con autenticación
 */
export const authStorage = {
  /**
   * Verifica si la autenticación biométrica está disponible
   */
  async checkBiometricAvailability(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      return hasHardware && isEnrolled;
    } catch (error) {
      log.error('Error checking biometric availability:', error);
      return false;
    }
  },

  /**
   * Carga la sesión del usuario desde el almacenamiento
   */
  async loadSession(): Promise<{ user: User | null; isBiometricEnabled: boolean }> {
    try {
      const [userDataStr, biometricEnabledStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
        AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED),
      ]);

      return {
        user: userDataStr ? JSON.parse(userDataStr) : null,
        isBiometricEnabled: biometricEnabledStr === 'true',
      };
    } catch (error) {
      log.error('Error loading session:', error);
      return { user: null, isBiometricEnabled: false };
    }
  },

  /**
   * Obtiene el token de autenticación
   */
  async getToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      }
      return await SecureStore.getItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      log.error('Error getting token:', error);
      return null;
    }
  },

  /**
   * Guarda el token de autenticación
   */
  async saveToken(token: string): Promise<void> {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } else {
      await SecureStore.setItemAsync(STORAGE_KEYS.AUTH_TOKEN, token);
    }
  },

  /**
   * Elimina el token de autenticación
   */
  async removeToken(): Promise<void> {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } else {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.AUTH_TOKEN);
    }
  },

  /**
   * Guarda los datos del usuario
   */
  async saveUser(user: User): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  },

  /**
   * Limpia todos los datos de sesión excepto tenant y onboarding
   */
  async clearSession(): Promise<void> {
    await authStorage.removeToken();
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.BIOMETRIC_ENABLED,
    ]);
  },

  /**
   * Verifica si el onboarding ha sido completado
   */
  async getOnboardingStatus(): Promise<boolean> {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    return value === 'true';
  },

  /**
   * Marca el onboarding como completado
   */
  async setOnboardingCompleted(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
  },

  /**
   * Habilita la autenticación biométrica
   */
  async enableBiometric(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, 'true');
  },

  /**
   * Deshabilita la autenticación biométrica
   */
  async disableBiometric(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, 'false');
  },

  /**
   * Realiza la autenticación biométrica
   */
  async authenticate(): Promise<LocalAuthentication.LocalAuthenticationResult> {
    return LocalAuthentication.authenticateAsync({
      promptMessage: 'Accede con tu biometría',
      cancelLabel: 'Cancelar',
      disableDeviceFallback: false,
      fallbackLabel: 'Usar contraseña',
    });
  },

  /**
   * Guarda el nombre de usuario recordado
   */
  async rememberUsername(username: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USERNAME_REMEMBERED, username);
    } catch (error) {
      log.error('Error saving username:', error);
    }
  },

  /**
   * Obtiene el nombre de usuario recordado
   */
  async getRememberedUsername(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.USERNAME_REMEMBERED);
    } catch (error) {
      log.error('Error loading username:', error);
      return null;
    }
  },

  /**
   * Limpia el nombre de usuario recordado
   */
  async clearRememberedUsername(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USERNAME_REMEMBERED);
    } catch (error) {
      log.error('Error clearing username:', error);
    }
  },
};
