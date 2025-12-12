/**
 * Auth Storage Tests
 */

import { STORAGE_KEYS } from '@/constants/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { authStorage } from '../auth-storage';

// Mock modules
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  authenticateAsync: jest.fn(),
}));

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

jest.mock('@/utils/logger', () => ({
  loggers: {
    auth: {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
    },
  },
}));

describe('authStorage', () => {
  const mockUser = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    name: 'Test User',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkBiometricAvailability', () => {
    it('should return true when hardware and enrollment are available', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);

      const result = await authStorage.checkBiometricAvailability();

      expect(result).toBe(true);
    });

    it('should return false when no hardware', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(false);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);

      const result = await authStorage.checkBiometricAvailability();

      expect(result).toBe(false);
    });

    it('should return false when not enrolled', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(false);

      const result = await authStorage.checkBiometricAvailability();

      expect(result).toBe(false);
    });

    it('should handle error and return false', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockRejectedValue(new Error('Error'));

      const result = await authStorage.checkBiometricAvailability();

      expect(result).toBe(false);
    });
  });

  describe('loadSession', () => {
    beforeEach(() => {
      (Platform as any).OS = 'ios';
    });

    it('should load session with user and biometric enabled', async () => {
      // En iOS/Android, loadSession usa secureGet (SecureStore)
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(mockUser))
        .mockResolvedValueOnce('true');

      const result = await authStorage.loadSession();

      expect(result).toEqual({
        user: mockUser,
        isBiometricEnabled: true,
      });
    });

    it('should load session with no user', async () => {
      (SecureStore.getItemAsync as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce('false');

      const result = await authStorage.loadSession();

      expect(result).toEqual({
        user: null,
        isBiometricEnabled: false,
      });
    });

    it('should handle error and return default values', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await authStorage.loadSession();

      expect(result).toEqual({
        user: null,
        isBiometricEnabled: false,
      });
    });
  });

  describe('token management', () => {
    describe('on iOS/Android', () => {
      beforeEach(() => {
        (Platform as any).OS = 'ios';
      });

      it('should get token from SecureStore', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('secure-token');

        const token = await authStorage.getToken();

        expect(token).toBe('secure-token');
        expect(SecureStore.getItemAsync).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_TOKEN);
      });

      it('should save token to SecureStore', async () => {
        await authStorage.saveToken('new-token');

        expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
          STORAGE_KEYS.AUTH_TOKEN,
          'new-token'
        );
      });

      it('should remove token from SecureStore', async () => {
        await authStorage.removeToken();

        expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_TOKEN);
      });

      it('should handle getToken error', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(new Error('Error'));

        const token = await authStorage.getToken();

        expect(token).toBeNull();
      });
    });

    describe('on web', () => {
      beforeEach(() => {
        (Platform as any).OS = 'web';
      });

      afterEach(() => {
        (Platform as any).OS = 'ios';
      });

      it('should get token from AsyncStorage on web', async () => {
        // Limpiar mocks previos
        jest.clearAllMocks();
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue('async-token');

        const token = await authStorage.getToken();

        expect(token).toBe('async-token');
        expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_TOKEN);
      });

      it('should save token to AsyncStorage on web', async () => {
        await authStorage.saveToken('web-token');

        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
          STORAGE_KEYS.AUTH_TOKEN,
          'web-token'
        );
      });

      it('should remove token from AsyncStorage on web', async () => {
        await authStorage.removeToken();

        expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_TOKEN);
      });
    });
  });

  describe('user management', () => {
    beforeEach(() => {
      (Platform as any).OS = 'ios';
    });

    it('should save user to SecureStore on iOS/Android', async () => {
      await authStorage.saveUser(mockUser);

      // En iOS/Android, los datos pequeños van a SecureStore
      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(mockUser)
      );
    });
  });

  describe('session management', () => {
    beforeEach(() => {
      (Platform as any).OS = 'ios';
      jest.clearAllMocks();
    });

    it('should clear session', async () => {
      // Mockear que deleteItemAsync no falle
      (SecureStore.deleteItemAsync as jest.Mock).mockResolvedValue(undefined);
      (AsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);

      await authStorage.clearSession();

      // Debe eliminar token de SecureStore
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_TOKEN);
      // Debe intentar limpiar SecureStore para otros datos
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(STORAGE_KEYS.USER_DATA);
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(STORAGE_KEYS.BIOMETRIC_ENABLED);
      // También debe limpiar AsyncStorage como fallback
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.BIOMETRIC_ENABLED,
        STORAGE_KEYS.USERNAME_REMEMBERED,
      ]);
    });
  });

  describe('onboarding', () => {
    it('should get onboarding status - completed', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true');

      const result = await authStorage.getOnboardingStatus();

      expect(result).toBe(true);
    });

    it('should get onboarding status - not completed', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await authStorage.getOnboardingStatus();

      expect(result).toBe(false);
    });

    it('should set onboarding completed', async () => {
      await authStorage.setOnboardingCompleted();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.ONBOARDING_COMPLETED,
        'true'
      );
    });
  });

  describe('biometric settings', () => {
    beforeEach(() => {
      (Platform as any).OS = 'ios';
      jest.clearAllMocks();
    });

    it('should enable biometric using SecureStore', async () => {
      await authStorage.enableBiometric();

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        STORAGE_KEYS.BIOMETRIC_ENABLED,
        'true'
      );
    });

    it('should disable biometric using SecureStore', async () => {
      await authStorage.disableBiometric();

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        STORAGE_KEYS.BIOMETRIC_ENABLED,
        'false'
      );
    });
  });

  describe('authenticate', () => {
    it('should call LocalAuthentication.authenticateAsync with correct options', async () => {
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
        success: true,
      });

      const result = await authStorage.authenticate();

      expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledWith({
        promptMessage: 'Accede con tu biometría',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
        fallbackLabel: 'Usar contraseña',
      });
      expect(result).toEqual({ success: true });
    });
  });

  describe('username remembering', () => {
    beforeEach(() => {
      (Platform as any).OS = 'ios';
      jest.clearAllMocks();
    });

    it('should remember username using SecureStore', async () => {
      await authStorage.rememberUsername('testuser');

      expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
        STORAGE_KEYS.USERNAME_REMEMBERED,
        'testuser'
      );
    });

    it('should handle remember username error', async () => {
      (SecureStore.setItemAsync as jest.Mock).mockRejectedValue(new Error('Error'));

      // Should not throw
      await authStorage.rememberUsername('testuser');
    });

    it('should get remembered username from SecureStore', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('saveduser');

      const username = await authStorage.getRememberedUsername();

      expect(username).toBe('saveduser');
    });

    it('should handle get remembered username error', async () => {
      (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(new Error('Error'));

      const username = await authStorage.getRememberedUsername();

      expect(username).toBeNull();
    });

    it('should clear remembered username from SecureStore', async () => {
      await authStorage.clearRememberedUsername();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(STORAGE_KEYS.USERNAME_REMEMBERED);
    });

    it('should handle clear remembered username error', async () => {
      (SecureStore.deleteItemAsync as jest.Mock).mockRejectedValue(new Error('Error'));

      // Should not throw
      await authStorage.clearRememberedUsername();
    });
  });

  describe('additional edge cases', () => {
    describe('saveToken error handling', () => {
      beforeEach(() => {
        (Platform as any).OS = 'ios';
        jest.clearAllMocks();
      });

      it('should throw error when saveToken fails', async () => {
        (SecureStore.setItemAsync as jest.Mock).mockRejectedValue(new Error('Storage full'));

        await expect(authStorage.saveToken('token')).rejects.toThrow('Storage full');
      });
    });

    describe('saveUser fallback to AsyncStorage', () => {
      beforeEach(() => {
        (Platform as any).OS = 'ios';
        jest.clearAllMocks();
      });

      it('should use AsyncStorage for large user data', async () => {
        // Create a user with data larger than 2048 bytes
        const largeUser = {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          name: 'Test User',
          fullName: 'Test User Full Name Very Long',
          phone: '1234567890',
          avatar: 'a'.repeat(3000), // Large avatar URL
        };

        await authStorage.saveUser(largeUser);

        // Should use AsyncStorage for large data
        expect(AsyncStorage.setItem).toHaveBeenCalled();
      });

      it('should throw error when saveUser fails', async () => {
        (SecureStore.setItemAsync as jest.Mock).mockRejectedValue(new Error('Save failed'));

        await expect(authStorage.saveUser(mockUser)).rejects.toThrow('Save failed');
      });
    });

    describe('clearSession on web', () => {
      beforeEach(() => {
        (Platform as any).OS = 'web';
        jest.clearAllMocks();
      });

      afterEach(() => {
        (Platform as any).OS = 'ios';
      });

      it('should clear session on web platform', async () => {
        (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);
        (AsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);

        await authStorage.clearSession();

        expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_TOKEN);
        expect(AsyncStorage.multiRemove).toHaveBeenCalled();
        // Should not call SecureStore on web
        expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
      });
    });

    describe('enableBiometric error handling', () => {
      beforeEach(() => {
        (Platform as any).OS = 'ios';
        jest.clearAllMocks();
      });

      it('should throw error when enableBiometric fails', async () => {
        (SecureStore.setItemAsync as jest.Mock).mockRejectedValue(new Error('Biometric error'));

        await expect(authStorage.enableBiometric()).rejects.toThrow('Biometric error');
      });
    });

    describe('onboarding error handling', () => {
      it('should handle getOnboardingStatus error', async () => {
        (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Error'));

        const result = await authStorage.getOnboardingStatus();

        expect(result).toBe(false);
      });

      it('should handle setOnboardingCompleted error silently', async () => {
        (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Error'));

        // Should not throw
        await authStorage.setOnboardingCompleted();
      });
    });

    describe('authenticate error handling', () => {
      it('should return error result on authentication failure', async () => {
        (LocalAuthentication.authenticateAsync as jest.Mock).mockRejectedValue(new Error('Auth error'));

        const result = await authStorage.authenticate();

        expect(result).toEqual({ success: false, error: 'system_cancel' });
      });
    });
  });
});
