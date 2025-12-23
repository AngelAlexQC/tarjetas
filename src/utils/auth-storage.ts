import { STORAGE_KEYS } from '@/constants/app';
import type { User } from '@/repositories';
import { loggers } from '@/utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const log = loggers.auth;

/**
 * Límite de tamaño para SecureStore en algunas plataformas (2048 bytes)
 */
const SECURE_STORE_SIZE_LIMIT = 2048;

/**
 * Verifica si podemos usar SecureStore para el dato
 */
function canUseSecureStore(data: string): boolean {
  return Platform.OS !== 'web' && data.length < SECURE_STORE_SIZE_LIMIT;
}

/**
 * Guarda datos de forma segura según la plataforma
 * SEGURIDAD: En iOS/Android usa el Keychain/Keystore del sistema
 */
async function secureSet(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    // En web, AsyncStorage es la única opción disponible
    // NOTA: En producción, considerar cookies HttpOnly para tokens
    await AsyncStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

/**
 * Lee datos de forma segura según la plataforma
 */
async function secureGet(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return await AsyncStorage.getItem(key);
  }
  return await SecureStore.getItemAsync(key);
}

/**
 * Elimina datos de forma segura según la plataforma
 */
async function secureDelete(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

/**
 * Módulo para manejar el almacenamiento relacionado con autenticación
 * 
 * SEGURIDAD:
 * - Tokens siempre en SecureStore (iOS/Android) o AsyncStorage (web)
 * - Datos de usuario en SecureStore cuando sea posible
 * - Flag biométrico en SecureStore para prevenir manipulación
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
   * Carga la sesión del usuario desde el almacenamiento seguro
   */
  async loadSession(): Promise<{ user: User | null; isBiometricEnabled: boolean }> {
    try {
      const [userDataStr, biometricEnabledStr] = await Promise.all([
        secureGet(STORAGE_KEYS.USER_DATA),
        secureGet(STORAGE_KEYS.BIOMETRIC_ENABLED),
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
   * Obtiene el token de autenticación desde almacenamiento seguro
   */
  async getToken(): Promise<string | null> {
    try {
      return await secureGet(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      log.error('Error getting token:', error);
      return null;
    }
  },

  /**
   * Guarda el token de autenticación de forma segura
   */
  async saveToken(token: string): Promise<void> {
    try {
      await secureSet(STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      log.error('Error saving token:', error);
      throw error; // Re-throw para que el llamador maneje el error crítico
    }
  },

  /**
   * Elimina el token de autenticación
   */
  async removeToken(): Promise<void> {
    try {
      await secureDelete(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      log.error('Error removing token:', error);
      // No re-throw: la eliminación fallida no es crítica
    }
  },

  /**
   * Guarda los datos del usuario de forma segura
   * 
   * SEGURIDAD: Usa SecureStore cuando sea posible para proteger
   * información personal del usuario (email, nombre, ID).
   */
  async saveUser(user: User): Promise<void> {
    try {
      const userData = JSON.stringify(user);
      
      if (canUseSecureStore(userData)) {
        await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, userData);
      } else {
        // Fallback para datos grandes - usar SecureStore dividido o AsyncStorage
        log.warn('User data exceeds SecureStore limit, using AsyncStorage');
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, userData);
      }
    } catch (error) {
      log.error('Error saving user data:', error);
      throw error; // Re-throw para que el llamador maneje el error crítico
    }
  },

  /**
   * Limpia todos los datos de sesión excepto tenant y onboarding
   */
  async clearSession(): Promise<void> {
    try {
      await authStorage.removeToken();
      
      // Limpiar datos de SecureStore (iOS/Android)
      if (Platform.OS !== 'web') {
        await Promise.all([
          SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA).catch(() => {}),
          SecureStore.deleteItemAsync(STORAGE_KEYS.BIOMETRIC_ENABLED).catch(() => {}),
          SecureStore.deleteItemAsync(STORAGE_KEYS.USERNAME_REMEMBERED).catch(() => {}),
        ]);
      }
      
      // Limpiar AsyncStorage como fallback/limpieza completa
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.BIOMETRIC_ENABLED,
        STORAGE_KEYS.USERNAME_REMEMBERED,
      ]);
    } catch (error) {
      log.error('Error clearing session:', error);
      // No re-throw: limpiar sesión no debe bloquear logout
    }
  },

  /**
   * Verifica si el onboarding ha sido completado
   */
  async getOnboardingStatus(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      return value === 'true';
    } catch (error) {
      log.error('Error getting onboarding status:', error);
      return false; // Asumir no completado en caso de error
    }
  },

  /**
   * Marca el onboarding como completado
   */
  async setOnboardingCompleted(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
    } catch (error) {
      log.error('Error setting onboarding completed:', error);
      // No re-throw: no es crítico para el flujo de la app
    }
  },

  /**
   * Habilita la autenticación biométrica
   * 
   * SEGURIDAD: Guardamos en SecureStore para prevenir manipulación
   * en dispositivos rooteados/jailbroken.
   */
  async enableBiometric(): Promise<void> {
    try {
      await secureSet(STORAGE_KEYS.BIOMETRIC_ENABLED, 'true');
    } catch (error) {
      log.error('Error enabling biometric:', error);
      throw error; // Re-throw para informar al usuario
    }
  },

  /**
   * Deshabilita la autenticación biométrica
   */
  async disableBiometric(): Promise<void> {
    try {
      await secureSet(STORAGE_KEYS.BIOMETRIC_ENABLED, 'false');
    } catch (error) {
      log.error('Error disabling biometric:', error);
      // No re-throw: no es crítico
    }
  },

  /**
   * Realiza la autenticación biométrica
   */
  async authenticate(): Promise<LocalAuthentication.LocalAuthenticationResult> {
    try {
      return await LocalAuthentication.authenticateAsync({
        promptMessage: 'Accede con tu biometría',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
        fallbackLabel: 'Usar contraseña',
      });
    } catch (error) {
      log.error('Error during biometric authentication:', error);
      return { success: false, error: 'system_cancel' };
    }
  },

  /**
   * Guarda el nombre de usuario recordado
   * 
   * SEGURIDAD: El username se guarda en SecureStore para evitar
   * revelar información sobre usuarios del sistema.
   */
  async rememberUsername(username: string): Promise<void> {
    try {
      await secureSet(STORAGE_KEYS.USERNAME_REMEMBERED, username);
    } catch (error) {
      log.error('Error saving username:', error);
    }
  },

  /**
   * Obtiene el nombre de usuario recordado
   */
  async getRememberedUsername(): Promise<string | null> {
    try {
      return await secureGet(STORAGE_KEYS.USERNAME_REMEMBERED);
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
      await secureDelete(STORAGE_KEYS.USERNAME_REMEMBERED);
    } catch (error) {
      log.error('Error clearing username:', error);
    }
  },
};
