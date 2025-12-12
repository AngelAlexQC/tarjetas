/**
 * Real Auth Repository Tests
 */

import { API_ENDPOINTS } from '@/api/config';
import { httpClient } from '@/api/http-client';
import { RealAuthRepository } from '../auth.repository.real';

// Mock dependencies
jest.mock('@/api/http-client', () => ({
  httpClient: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
  },
}));

jest.mock('@/utils/api-validation', () => ({
  parseApiData: jest.fn((schema, data) => data),
  validateOptionalApiData: jest.fn((schema, data) => ({
    isOk: () => true,
    value: data,
  })),
}));

describe('RealAuthRepository', () => {
  let repository: RealAuthRepository;

  beforeEach(() => {
    repository = new RealAuthRepository();
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          user: { id: '1', username: 'testuser', email: 'test@example.com' },
          token: 'jwt-token',
          refreshToken: 'refresh-token',
        },
      };
      (httpClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await repository.login({
        username: 'testuser',
        password: 'password123',
      });

      expect(httpClient.post).toHaveBeenCalledWith(
        API_ENDPOINTS.AUTH.LOGIN,
        { username: 'testuser', password: 'password123' },
        { skipAuth: true }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw error on login failure', async () => {
      (httpClient.post as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Credenciales inválidas',
      });

      await expect(repository.login({
        username: 'testuser',
        password: 'wrongpassword',
      })).rejects.toThrow('Credenciales inválidas');
    });

    it('should throw default error message when no error provided', async () => {
      (httpClient.post as jest.Mock).mockResolvedValue({
        success: false,
      });

      await expect(repository.login({
        username: 'testuser',
        password: 'wrongpassword',
      })).rejects.toThrow('Error al iniciar sesión');
    });
  });

  describe('logout', () => {
    it('should call logout endpoint', async () => {
      (httpClient.post as jest.Mock).mockResolvedValue({ success: true });

      await repository.logout();

      expect(httpClient.post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.LOGOUT);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      (httpClient.post as jest.Mock).mockResolvedValue({
        success: true,
        data: { token: 'new-jwt-token' },
      });

      const token = await repository.refreshToken();

      expect(httpClient.post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.REFRESH_TOKEN);
      expect(token).toBe('new-jwt-token');
    });

    it('should throw error on refresh failure', async () => {
      (httpClient.post as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Refresh token expirado',
      });

      await expect(repository.refreshToken()).rejects.toThrow('Refresh token expirado');
    });

    it('should throw default error on failure without message', async () => {
      (httpClient.post as jest.Mock).mockResolvedValue({
        success: false,
      });

      await expect(repository.refreshToken()).rejects.toThrow('Error al refrescar token');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', async () => {
      const mockUser = { id: '1', username: 'testuser', email: 'test@example.com' };
      (httpClient.get as jest.Mock).mockResolvedValue({
        success: true,
        data: mockUser,
      });

      const user = await repository.getCurrentUser();

      expect(httpClient.get).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.ME);
      expect(user).toEqual(mockUser);
    });

    it('should return null when no user data', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue({
        success: true,
        data: null,
      });

      const user = await repository.getCurrentUser();

      expect(user).toBeNull();
    });

    it('should return null on failure', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue({
        success: false,
      });

      const user = await repository.getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const updatedUser = { id: '1', username: 'testuser', name: 'New Name' };
      (httpClient.put as jest.Mock).mockResolvedValue({
        success: true,
        data: updatedUser,
      });

      const result = await repository.updateProfile({ name: 'New Name' });

      expect(httpClient.put).toHaveBeenCalledWith(
        API_ENDPOINTS.USER.PROFILE,
        { name: 'New Name' }
      );
      expect(result).toEqual(updatedUser);
    });

    it('should throw error on update failure', async () => {
      (httpClient.put as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Error de validación',
      });

      await expect(repository.updateProfile({ name: '' }))
        .rejects.toThrow('Error de validación');
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      const mockResponse = {
        success: true,
        userId: 'new-user-id',
        requiresVerification: true,
        message: 'Código enviado',
      };
      (httpClient.post as jest.Mock).mockResolvedValue({
        success: true,
        data: mockResponse,
      });

      const result = await repository.register({
        email: 'new@example.com',
        username: 'newuser',
        password: 'password123',
        fullName: 'New User',
        phone: '1234567890',
      });

      expect(httpClient.post).toHaveBeenCalledWith(
        API_ENDPOINTS.AUTH.REGISTER,
        expect.any(Object),
        { skipAuth: true }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when registration fails', async () => {
      (httpClient.post as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Email ya registrado',
      });

      await expect(repository.register({
        email: 'existing@example.com',
        username: 'existinguser',
        password: 'password123',
        fullName: 'Test',
        phone: '000',
      })).rejects.toThrow('Email ya registrado');
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Email verificado',
        token: 'auth-token',
        user: { id: '1', email: 'test@example.com' },
      };
      (httpClient.post as jest.Mock).mockResolvedValue({
        success: true,
        data: mockResponse,
      });

      const result = await repository.verifyEmail({
        email: 'test@example.com',
        code: '123456',
      });

      expect(httpClient.post).toHaveBeenCalledWith(
        API_ENDPOINTS.AUTH.VERIFY_EMAIL,
        { email: 'test@example.com', code: '123456' },
        { skipAuth: true }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on invalid code', async () => {
      (httpClient.post as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Código incorrecto',
      });

      await expect(repository.verifyEmail({
        email: 'test@example.com',
        code: '000000',
      })).rejects.toThrow('Código incorrecto');
    });
  });

  describe('resendVerificationCode', () => {
    it('should resend code successfully', async () => {
      (httpClient.post as jest.Mock).mockResolvedValue({
        success: true,
      });

      const result = await repository.resendVerificationCode('test@example.com');

      expect(httpClient.post).toHaveBeenCalledWith(
        API_ENDPOINTS.AUTH.RESEND_VERIFICATION,
        { email: 'test@example.com' },
        { skipAuth: true }
      );
      expect(result).toEqual({ success: true });
    });

    it('should throw error on failure', async () => {
      (httpClient.post as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Límite de intentos excedido',
      });

      await expect(repository.resendVerificationCode('test@example.com'))
        .rejects.toThrow('Límite de intentos excedido');
    });
  });

  describe('forgotPassword', () => {
    it('should send forgot password request successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Código enviado',
      };
      (httpClient.post as jest.Mock).mockResolvedValue({
        success: true,
        data: mockResponse,
      });

      const result = await repository.forgotPassword({
        email: 'test@example.com',
      });

      expect(httpClient.post).toHaveBeenCalledWith(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        { email: 'test@example.com' },
        { skipAuth: true }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on failure', async () => {
      (httpClient.post as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Email no encontrado',
      });

      await expect(repository.forgotPassword({ email: 'unknown@example.com' }))
        .rejects.toThrow('Email no encontrado');
    });
  });

  describe('verifyRecoveryCode', () => {
    it('should verify recovery code successfully', async () => {
      const mockResponse = {
        success: true,
        resetToken: 'reset-token',
        message: 'Código verificado',
      };
      (httpClient.post as jest.Mock).mockResolvedValue({
        success: true,
        data: mockResponse,
      });

      const result = await repository.verifyRecoveryCode({
        email: 'test@example.com',
        code: '123456',
      });

      expect(result).toEqual(mockResponse);
    });

    it('should throw error on invalid code', async () => {
      (httpClient.post as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Código expirado',
      });

      await expect(repository.verifyRecoveryCode({
        email: 'test@example.com',
        code: 'expired',
      })).rejects.toThrow('Código expirado');
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const mockResponse = {
        success: true,
        message: 'Contraseña actualizada',
      };
      (httpClient.post as jest.Mock).mockResolvedValue({
        success: true,
        data: mockResponse,
      });

      const result = await repository.resetPassword({
        email: 'test@example.com',
        code: '123456',
        newPassword: 'newpassword123',
      });

      expect(httpClient.post).toHaveBeenCalledWith(
        API_ENDPOINTS.AUTH.RESET_PASSWORD,
        { email: 'test@example.com', code: '123456', newPassword: 'newpassword123' },
        { skipAuth: true }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on failure', async () => {
      (httpClient.post as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Token inválido',
      });

      await expect(repository.resetPassword({
        email: 'test@example.com',
        code: 'invalid',
        newPassword: 'newpassword',
      })).rejects.toThrow('Token inválido');
    });
  });
});
