/**
 * Auth Context Tests
 */

import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { AuthProvider, useAuth } from '../auth-context';
import { authRepository$ } from '@/repositories';
import { authStorage } from '@/utils/auth-storage';

// Mock del repositorio de auth
jest.mock('@/repositories', () => ({
  authRepository$: jest.fn(),
}));

// Mock de authStorage
jest.mock('@/utils/auth-storage', () => ({
  authStorage: {
    checkBiometricAvailability: jest.fn(),
    loadSession: jest.fn(),
    saveToken: jest.fn(),
    saveUser: jest.fn(),
    clearSession: jest.fn(),
    enableBiometric: jest.fn(),
    disableBiometric: jest.fn(),
    authenticate: jest.fn(),
    rememberUsername: jest.fn(),
    getRememberedUsername: jest.fn(),
    clearRememberedUsername: jest.fn(),
  },
}));

// Mock del logger
jest.mock('@/utils/logger', () => ({
  loggers: {
    auth: {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
    },
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  const mockUser = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    name: 'Test User',
  };

  const mockAuthRepository = {
    login: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (authRepository$ as jest.Mock).mockReturnValue(mockAuthRepository);
    (authStorage.checkBiometricAvailability as jest.Mock).mockResolvedValue(true);
    (authStorage.loadSession as jest.Mock).mockResolvedValue({
      user: null,
      isBiometricEnabled: false,
    });
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside provider', () => {
      // Supress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
      
      consoleSpy.mockRestore();
    });
  });

  describe('initialization', () => {
    it('should initialize with loading state', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isLoading).toBe(true);
    });

    it('should load saved session on mount', async () => {
      (authStorage.loadSession as jest.Mock).mockResolvedValue({
        user: mockUser,
        isBiometricEnabled: true,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isBiometricEnabled).toBe(true);
    });

    it('should check biometric availability on mount', async () => {
      (authStorage.checkBiometricAvailability as jest.Mock).mockResolvedValue(true);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isBiometricAvailable).toBe(true);
    });

    it('should handle biometric not available', async () => {
      (authStorage.checkBiometricAvailability as jest.Mock).mockResolvedValue(false);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.isBiometricAvailable).toBe(false);
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      // Wait for initialization
      (authStorage.loadSession as jest.Mock).mockResolvedValue({
        user: null,
        isBiometricEnabled: false,
      });
    });

    it('should login successfully', async () => {
      mockAuthRepository.login.mockResolvedValue({
        token: 'test-token',
        user: mockUser,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('testuser', 'password');
      });

      expect(loginResult).toEqual({ success: true });
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(authStorage.saveToken).toHaveBeenCalledWith('test-token');
      expect(authStorage.saveUser).toHaveBeenCalledWith(mockUser);
    });

    it('should handle login error', async () => {
      mockAuthRepository.login.mockRejectedValue(new Error('Invalid credentials'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('testuser', 'wrongpassword');
      });

      expect(loginResult).toEqual({
        success: false,
        error: 'Usuario o contraseña incorrectos',
      });
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should handle non-Error exception', async () => {
      mockAuthRepository.login.mockRejectedValue('Unknown error');

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('testuser', 'password');
      });

      expect(loginResult).toEqual({
        success: false,
        error: 'Error al iniciar sesión. Intenta de nuevo.',
      });
    });

    it('should handle network error', async () => {
      mockAuthRepository.login.mockRejectedValue(new Error('Network connection failed'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('testuser', 'password');
      });

      expect(loginResult).toEqual({
        success: false,
        error: 'Error de conexión. Verifica tu internet e intenta de nuevo.',
      });
    });

    it('should handle server error', async () => {
      mockAuthRepository.login.mockRejectedValue(new Error('Server error 500'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('testuser', 'password');
      });

      expect(loginResult).toEqual({
        success: false,
        error: 'El servicio no está disponible. Intenta más tarde.',
      });
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      (authStorage.loadSession as jest.Mock).mockResolvedValue({
        user: mockUser,
        isBiometricEnabled: true,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isBiometricEnabled).toBe(false);
      expect(mockAuthRepository.logout).toHaveBeenCalled();
      expect(authStorage.clearSession).toHaveBeenCalled();
    });

    it('should handle logout error gracefully', async () => {
      mockAuthRepository.logout.mockRejectedValue(new Error('Logout failed'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should not throw
      await act(async () => {
        await result.current.logout();
      });

      // Should still clear local state
      expect(result.current.user).toBeNull();
    });
  });

  describe('biometric', () => {
    beforeEach(async () => {
      (authStorage.checkBiometricAvailability as jest.Mock).mockResolvedValue(true);
      (authStorage.loadSession as jest.Mock).mockResolvedValue({
        user: mockUser,
        isBiometricEnabled: false,
      });
    });

    it('should enable biometric', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.enableBiometric();
      });

      expect(result.current.isBiometricEnabled).toBe(true);
      expect(authStorage.enableBiometric).toHaveBeenCalled();
    });

    it('should not enable biometric when not available', async () => {
      (authStorage.checkBiometricAvailability as jest.Mock).mockResolvedValue(false);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.enableBiometric();
      });

      expect(result.current.isBiometricEnabled).toBe(false);
      expect(authStorage.enableBiometric).not.toHaveBeenCalled();
    });

    it('should disable biometric', async () => {
      (authStorage.loadSession as jest.Mock).mockResolvedValue({
        user: mockUser,
        isBiometricEnabled: true,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.disableBiometric();
      });

      expect(result.current.isBiometricEnabled).toBe(false);
      expect(authStorage.disableBiometric).toHaveBeenCalled();
    });

    it('should authenticate with biometric successfully', async () => {
      (authStorage.loadSession as jest.Mock).mockResolvedValue({
        user: mockUser,
        isBiometricEnabled: true,
      });
      (authStorage.authenticate as jest.Mock).mockResolvedValue({ success: true });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Simulate user logged out but session saved
      await act(async () => {
        await result.current.logout();
      });

      // Re-initialize session mock for biometric auth
      (authStorage.loadSession as jest.Mock).mockResolvedValue({
        user: mockUser,
        isBiometricEnabled: true,
      });

      let authResult;
      await act(async () => {
        authResult = await result.current.authenticateWithBiometric();
      });

      expect(authResult).toEqual({ success: true });
      expect(result.current.user).toEqual(mockUser);
    });

    it('should handle biometric auth when not available', async () => {
      (authStorage.checkBiometricAvailability as jest.Mock).mockResolvedValue(false);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let authResult;
      await act(async () => {
        authResult = await result.current.authenticateWithBiometric();
      });

      expect(authResult).toEqual({
        success: false,
        error: 'Autenticación biométrica no disponible',
      });
    });

    it('should handle biometric auth with no saved session', async () => {
      (authStorage.loadSession as jest.Mock).mockResolvedValue({
        user: null,
        isBiometricEnabled: false,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let authResult;
      await act(async () => {
        authResult = await result.current.authenticateWithBiometric();
      });

      expect(authResult).toEqual({
        success: false,
        error: 'No hay sesión guardada',
      });
    });

    it('should handle biometric auth failure', async () => {
      (authStorage.loadSession as jest.Mock).mockResolvedValue({
        user: mockUser,
        isBiometricEnabled: true,
      });
      (authStorage.authenticate as jest.Mock).mockResolvedValue({
        success: false,
        error: 'auth_failed',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let authResult;
      await act(async () => {
        authResult = await result.current.authenticateWithBiometric();
      });

      expect(authResult).toEqual({
        success: false,
        error: 'Autenticación fallida',
      });
    });

    it('should handle user cancel', async () => {
      (authStorage.loadSession as jest.Mock).mockResolvedValue({
        user: mockUser,
        isBiometricEnabled: true,
      });
      (authStorage.authenticate as jest.Mock).mockResolvedValue({
        success: false,
        error: 'user_cancel',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let authResult;
      await act(async () => {
        authResult = await result.current.authenticateWithBiometric();
      });

      expect(authResult).toEqual({
        success: false,
        error: 'Cancelado por el usuario',
      });
    });
  });

  describe('username remembering', () => {
    it('should expose rememberUsername function', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.rememberUsername).toBe(authStorage.rememberUsername);
    });

    it('should expose getRememberedUsername function', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.getRememberedUsername).toBe(authStorage.getRememberedUsername);
    });

    it('should expose clearRememberedUsername function', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.clearRememberedUsername).toBe(authStorage.clearRememberedUsername);
    });
  });
});
