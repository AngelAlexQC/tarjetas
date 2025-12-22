/**
 * Auth Storage Tests
 */

import { STORAGE_KEYS } from '@/constants/app';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { authStorage } from '@/core/storage/auth-storage';

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

jest.mock('@/core/logging/logger', () => ({
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
    it('should load session with user and biometric enabled', async () => {
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(mockUser))
        .mockResolvedValueOnce('true');

      const result = await authStorage.loadSession();

      expect(result).toEqual({
        user: mockUser,
        isBiometricEnabled: true,
      });
    });

    it('should load session with no user', async () => {
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce('false');

      const result = await authStorage.loadSession();

      expect(result).toEqual({
        user: null,
        isBiometricEnabled: false,
      });
    });

    it('should handle error and return default values', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

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
    it('should save user', async () => {
      await authStorage.saveUser(mockUser);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(mockUser)
      );
    });
  });

  describe('session management', () => {
    beforeEach(() => {
      (Platform as any).OS = 'ios';
    });

    it('should clear session', async () => {
      await authStorage.clearSession();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_TOKEN);
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.BIOMETRIC_ENABLED,
        STORAGE_KEYS.USERNAME_REMEMBERED,
        STORAGE_KEYS.TENANT_THEME,
        'installation_name',
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
    it('should enable biometric', async () => {
      await authStorage.enableBiometric();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.BIOMETRIC_ENABLED,
        'true'
      );
    });

    it('should disable biometric', async () => {
      await authStorage.disableBiometric();

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
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
    it('should remember username', async () => {
      await authStorage.rememberUsername('testuser');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.USERNAME_REMEMBERED,
        'testuser'
      );
    });

    it('should handle remember username error', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Error'));

      // Should not throw
      await authStorage.rememberUsername('testuser');
    });

    it('should get remembered username', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('saveduser');

      const username = await authStorage.getRememberedUsername();

      expect(username).toBe('saveduser');
    });

    it('should handle get remembered username error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Error'));

      const username = await authStorage.getRememberedUsername();

      expect(username).toBeNull();
    });

    it('should clear remembered username', async () => {
      await authStorage.clearRememberedUsername();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.USERNAME_REMEMBERED);
    });

    it('should handle clear remembered username error', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(new Error('Error'));

      // Should not throw
      await authStorage.clearRememberedUsername();
    });
  });
});
