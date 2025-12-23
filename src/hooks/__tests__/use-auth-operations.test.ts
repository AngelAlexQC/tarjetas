/**
 * Tests para useRegister y usePasswordRecovery Hooks
 *
 * Tests de seguridad crítica para operaciones de autenticación
 * 
 * Cobertura:
 * 1. useRegister - Registro de usuario
 * 2. useRegister - Verificación de email
 * 3. useRegister - Reenvío de código
 * 4. usePasswordRecovery - Envío de código de recuperación
 * 5. usePasswordRecovery - Verificación de código
 * 6. usePasswordRecovery - Reset de contraseña
 * 7. Sanitización de errores
 * 8. Estados de carga
 * 9. Limpieza de errores
 */

import * as errorSanitizer from '@/utils/error-sanitizer';
import { loggers } from '@/core/logging';
import { act, renderHook } from '@testing-library/react-native';
import { usePasswordRecovery, useRegister } from '../use-auth-operations';

// Mock del repositorio
const mockAuthRepo = {
  register: jest.fn(),
  verifyEmail: jest.fn(),
  resendVerificationCode: jest.fn(),
  forgotPassword: jest.fn(),
  verifyRecoveryCode: jest.fn(),
  resetPassword: jest.fn(),
};

jest.mock('@/repositories', () => ({
  authRepository$: jest.fn(() => mockAuthRepo),
}));

// Mock de error sanitizer
jest.mock('@/utils/error-sanitizer', () => ({
  sanitizeRegisterError: jest.fn((_error) => 'Error de registro sanitizado'),
  sanitizeVerificationError: jest.fn((_error) => 'Error de verificación sanitizado'),
  sanitizeRecoveryError: jest.fn((_error) => 'Error de recuperación sanitizado'),
}));

// Mock del logger
jest.mock('@/core/logging', () => ({
  loggers: {
    auth: {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
    },
  },
}));

describe('useRegister', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Estado inicial', () => {
    it('debe inicializar con estado por defecto', () => {
      const { result } = renderHook(() => useRegister());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.register).toBe('function');
      expect(typeof result.current.verifyEmail).toBe('function');
      expect(typeof result.current.resendCode).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
    });
  });

  describe('Registro de usuario', () => {
    it('debe registrar usuario exitosamente', async () => {
      const mockResponse = { userId: '123', email: 'test@test.com' };
      mockAuthRepo.register.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRegister());

      expect(result.current.isLoading).toBe(false);

      let registerResult: { success: boolean; data?: unknown };
      await act(async () => {
        registerResult = await result.current.register({
          email: 'test@test.com',
          password: 'Password123!',
          fullName: 'Test User',
          phone: '1234567890',
          username: 'testuser',
        });
      });

      expect(mockAuthRepo.register).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'Password123!',
        fullName: 'Test User',
        phone: '1234567890',
        username: 'testuser',
      });
      expect(registerResult!.success).toBe(true);
      expect(registerResult!.data).toEqual(mockResponse);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('debe manejar error en registro', async () => {
      const mockError = new Error('Registration failed');
      mockAuthRepo.register.mockRejectedValue(mockError);

      const { result } = renderHook(() => useRegister());

      let registerResult: { success: boolean; error?: string };
      await act(async () => {
        registerResult = await result.current.register({
          email: 'test@test.com',
          password: 'Password123!',
          fullName: 'Test User',
          phone: '1234567890',
          username: 'testuser',
        });
      });

      expect(registerResult!.success).toBe(false);
      expect(registerResult!.error).toBe('Error de registro sanitizado');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Error de registro sanitizado');
      expect(errorSanitizer.sanitizeRegisterError).toHaveBeenCalledWith(mockError);
      expect(loggers.auth.error).toHaveBeenCalledWith('Register error:', mockError);
    });

    it('debe actualizar estado de loading durante registro', async () => {
      let resolveRegister: (value: unknown) => void;
      const registerPromise = new Promise(resolve => {
        resolveRegister = resolve;
      });
      mockAuthRepo.register.mockReturnValue(registerPromise);

      const { result } = renderHook(() => useRegister());

      expect(result.current.isLoading).toBe(false);

      // Iniciar registro (sin await)
      let registerPromiseResult: Promise<any>;
      act(() => {
        registerPromiseResult = result.current.register({
          email: 'test@test.com',
          password: 'Password123!',
          fullName: 'Test User',
          phone: '1234567890',
          username: 'testuser',
        });
      });

      // Debe estar loading mientras espera
      expect(result.current.isLoading).toBe(true);

      // Resolver el registro
      await act(async () => {
        resolveRegister!({ userId: '123' });
        await registerPromiseResult!;
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Verificación de email', () => {
    it('debe verificar email exitosamente', async () => {
      const mockResponse = { verified: true, token: 'abc123' };
      mockAuthRepo.verifyEmail.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useRegister());

      let verifyResult: any;
      await act(async () => {
        verifyResult = await result.current.verifyEmail({
          email: 'test@test.com',
          code: '123456',
        });
      });

      expect(mockAuthRepo.verifyEmail).toHaveBeenCalledWith({
        email: 'test@test.com',
        code: '123456',
      });
      expect(verifyResult.success).toBe(true);
      expect(verifyResult.data).toEqual(mockResponse);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('debe manejar error en verificación de email', async () => {
      const mockError = new Error('Invalid code');
      mockAuthRepo.verifyEmail.mockRejectedValue(mockError);

      const { result } = renderHook(() => useRegister());

      let verifyResult: any;
      await act(async () => {
        verifyResult = await result.current.verifyEmail({
          email: 'test@test.com',
          code: '123456',
        });
      });

      expect(verifyResult.success).toBe(false);
      expect(verifyResult.error).toBe('Error de verificación sanitizado');
      expect(result.current.error).toBe('Error de verificación sanitizado');
      expect(errorSanitizer.sanitizeVerificationError).toHaveBeenCalledWith(mockError);
      expect(loggers.auth.error).toHaveBeenCalledWith('Verify email error:', mockError);
    });

    it('debe limpiar error anterior al verificar email', async () => {
      const mockError = new Error('First error');
      mockAuthRepo.verifyEmail.mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useRegister());

      // Primer intento con error
      await act(async () => {
        await result.current.verifyEmail({
          email: 'test@test.com',
          code: '123456',
        });
      });

      expect(result.current.error).toBe('Error de verificación sanitizado');

      // Segundo intento exitoso
      mockAuthRepo.verifyEmail.mockResolvedValue({ verified: true });

      await act(async () => {
        await result.current.verifyEmail({
          email: 'test@test.com',
          code: '654321',
        });
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Reenvío de código', () => {
    it('debe reenviar código exitosamente', async () => {
      mockAuthRepo.resendVerificationCode.mockResolvedValue(undefined);

      const { result } = renderHook(() => useRegister());

      let resendResult: { success: boolean };
      await act(async () => {
        resendResult = await result.current.resendCode('test@test.com');
      });

      expect(mockAuthRepo.resendVerificationCode).toHaveBeenCalledWith('test@test.com');
      expect(resendResult!.success).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('debe manejar error al reenviar código', async () => {
      const mockError = new Error('Too many attempts');
      mockAuthRepo.resendVerificationCode.mockRejectedValue(mockError);

      const { result } = renderHook(() => useRegister());

      let resendResult: any;
      await act(async () => {
        resendResult = await result.current.resendCode('test@test.com');
      });

      expect(resendResult.success).toBe(false);
      expect(resendResult.error).toBe('Error de verificación sanitizado');
      expect(result.current.error).toBe('Error de verificación sanitizado');
      expect(errorSanitizer.sanitizeVerificationError).toHaveBeenCalledWith(mockError);
      expect(loggers.auth.error).toHaveBeenCalledWith('Resend code error:', mockError);
    });
  });

  describe('Limpieza de errores', () => {
    it('debe limpiar error manualmente', async () => {
      const mockError = new Error('Test error');
      mockAuthRepo.register.mockRejectedValue(mockError);

      const { result } = renderHook(() => useRegister());

      // Generar un error
      await act(async () => {
        await result.current.register({
          email: 'test@test.com',
          password: 'Password123!',
          fullName: 'Test User',
          phone: '1234567890',
          username: 'testuser',
        });
      });

      expect(result.current.error).toBe('Error de registro sanitizado');

      // Limpiar error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('no debe afectar loading al limpiar error', async () => {
      const mockError = new Error('Test error');
      mockAuthRepo.register.mockRejectedValue(mockError);

      const { result } = renderHook(() => useRegister());

      await act(async () => {
        await result.current.register({
          email: 'test@test.com',
          password: 'Password123!',
          fullName: 'Test User',
          phone: '1234567890',
          username: 'testuser',
        });
      });

      const loadingBefore = result.current.isLoading;

      act(() => {
        result.current.clearError();
      });

      expect(result.current.isLoading).toBe(loadingBefore);
    });
  });
});

describe('usePasswordRecovery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('Estado inicial', () => {
    it('debe inicializar con estado por defecto', () => {
      const { result } = renderHook(() => usePasswordRecovery());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(typeof result.current.sendRecoveryCode).toBe('function');
      expect(typeof result.current.verifyCode).toBe('function');
      expect(typeof result.current.resetPassword).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
    });
  });

  describe('Envío de código de recuperación', () => {
    it('debe enviar código de recuperación exitosamente', async () => {
      const mockResponse = { messageSent: true };
      mockAuthRepo.forgotPassword.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => usePasswordRecovery());

      let sendResult: any;
      await act(async () => {
        sendResult = await result.current.sendRecoveryCode({
          email: 'test@test.com',
        });
      });

      expect(mockAuthRepo.forgotPassword).toHaveBeenCalledWith({
        email: 'test@test.com',
      });
      expect(sendResult.success).toBe(true);
      expect(sendResult.data).toEqual(mockResponse);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('debe manejar error al enviar código (sin revelar si email existe)', async () => {
      const mockError = new Error('Email not found');
      mockAuthRepo.forgotPassword.mockRejectedValue(mockError);

      const { result } = renderHook(() => usePasswordRecovery());

      let sendResult: any;
      await act(async () => {
        sendResult = await result.current.sendRecoveryCode({
          email: 'test@test.com',
        });
      });

      expect(sendResult.success).toBe(false);
      expect(sendResult.error).toBe('Error de recuperación sanitizado');
      expect(result.current.error).toBe('Error de recuperación sanitizado');
      expect(errorSanitizer.sanitizeRecoveryError).toHaveBeenCalledWith(mockError);
      expect(loggers.auth.error).toHaveBeenCalledWith('Forgot password error:', mockError);
    });

    it('debe actualizar estado de loading al enviar código', async () => {
      let resolveSend: (value: unknown) => void;
      const sendPromise = new Promise<unknown>(resolve => {
        resolveSend = resolve;
      });
      mockAuthRepo.forgotPassword.mockReturnValue(sendPromise);

      const { result } = renderHook(() => usePasswordRecovery());

      // Iniciar envío (sin await)
      let sendPromiseResult: Promise<any>;
      act(() => {
        sendPromiseResult = result.current.sendRecoveryCode({
          email: 'test@test.com',
        });
      });

      // Debe estar loading mientras espera
      expect(result.current.isLoading).toBe(true);

      // Resolver el envío
      await act(async () => {
        resolveSend!({ messageSent: true });
        await sendPromiseResult!;
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Verificación de código de recuperación', () => {
    it('debe verificar código exitosamente', async () => {
      const mockResponse = { valid: true, token: 'reset-token' };
      mockAuthRepo.verifyRecoveryCode.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => usePasswordRecovery());

      let verifyResult: { success: boolean; data?: unknown };
      await act(async () => {
        verifyResult = await result.current.verifyCode({
          email: 'test@test.com',
          code: '123456',
        });
      });

      expect(mockAuthRepo.verifyRecoveryCode).toHaveBeenCalledWith({
        email: 'test@test.com',
        code: '123456',
      });
      expect(verifyResult!.success).toBe(true);
      expect(verifyResult!.data).toEqual(mockResponse);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('debe manejar error en verificación de código', async () => {
      const mockError = new Error('Invalid or expired code');
      mockAuthRepo.verifyRecoveryCode.mockRejectedValue(mockError);

      const { result } = renderHook(() => usePasswordRecovery());

      let verifyResult: any;
      await act(async () => {
        verifyResult = await result.current.verifyCode({
          email: 'test@test.com',
          code: '123456',
        });
      });

      expect(verifyResult.success).toBe(false);
      expect(verifyResult.error).toBe('Error de verificación sanitizado');
      expect(result.current.error).toBe('Error de verificación sanitizado');
      expect(errorSanitizer.sanitizeVerificationError).toHaveBeenCalledWith(mockError);
      expect(loggers.auth.error).toHaveBeenCalledWith('Verify recovery code error:', mockError);
    });
  });

  describe('Reset de contraseña', () => {
    it('debe resetear contraseña exitosamente', async () => {
      const mockResponse = { passwordReset: true };
      mockAuthRepo.resetPassword.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => usePasswordRecovery());

      let resetResult: any;
      await act(async () => {
        resetResult = await result.current.resetPassword({
          email: 'test@test.com',
          code: '123456',
          newPassword: 'NewPassword123!',
        });
      });

      expect(mockAuthRepo.resetPassword).toHaveBeenCalledWith({
        email: 'test@test.com',
        code: '123456',
        newPassword: 'NewPassword123!',
      });
      expect(resetResult.success).toBe(true);
      expect(resetResult.data).toEqual(mockResponse);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('debe manejar error al resetear contraseña', async () => {
      const mockError = new Error('Invalid token');
      mockAuthRepo.resetPassword.mockRejectedValue(mockError);

      const { result } = renderHook(() => usePasswordRecovery());

      let resetResult: any;
      await act(async () => {
        resetResult = await result.current.resetPassword({
          email: 'test@test.com',
          code: '123456',
          newPassword: 'NewPassword123!',
        });
      });

      expect(resetResult.success).toBe(false);
      expect(resetResult.error).toBe('Error de recuperación sanitizado');
      expect(result.current.error).toBe('Error de recuperación sanitizado');
      expect(errorSanitizer.sanitizeRecoveryError).toHaveBeenCalledWith(mockError);
      expect(loggers.auth.error).toHaveBeenCalledWith('Reset password error:', mockError);
    });

    it('debe actualizar estado de loading al resetear', async () => {
      let resolveReset: (value: any) => void;
      const resetPromise = new Promise(resolve => {
        resolveReset = resolve;
      });
      mockAuthRepo.resetPassword.mockReturnValue(resetPromise);

      const { result } = renderHook(() => usePasswordRecovery());

      // Iniciar reset (sin await)
      let resetPromiseResult: Promise<any>;
      act(() => {
        resetPromiseResult = result.current.resetPassword({
          email: 'test@test.com',
          code: '123456',
          newPassword: 'NewPassword123!',
        });
      });

      // Debe estar loading mientras espera
      expect(result.current.isLoading).toBe(true);

      // Resolver el reset
      await act(async () => {
        resolveReset!({ passwordReset: true });
        await resetPromiseResult!;
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Limpieza de errores', () => {
    it('debe limpiar error manualmente', async () => {
      const mockError = new Error('Test error');
      mockAuthRepo.forgotPassword.mockRejectedValue(mockError);

      const { result } = renderHook(() => usePasswordRecovery());

      await act(async () => {
        await result.current.sendRecoveryCode({
          email: 'test@test.com',
        });
      });

      expect(result.current.error).toBe('Error de recuperación sanitizado');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('Flujo completo de recuperación', () => {
    it('debe ejecutar flujo completo exitosamente', async () => {
      mockAuthRepo.forgotPassword.mockResolvedValue({ messageSent: true });
      mockAuthRepo.verifyRecoveryCode.mockResolvedValue({ valid: true });
      mockAuthRepo.resetPassword.mockResolvedValue({ passwordReset: true });

      const { result } = renderHook(() => usePasswordRecovery());

      // Paso 1: Enviar código
      let sendResult: any;
      await act(async () => {
        sendResult = await result.current.sendRecoveryCode({
          email: 'test@test.com',
        });
      });

      expect(sendResult.success).toBe(true);
      expect(result.current.error).toBeNull();

      // Paso 2: Verificar código
      let verifyResult: any;
      await act(async () => {
        verifyResult = await result.current.verifyCode({
          email: 'test@test.com',
          code: '123456',
        });
      });

      expect(verifyResult.success).toBe(true);
      expect(result.current.error).toBeNull();

      // Paso 3: Reset contraseña
      let resetResult: any;
      await act(async () => {
        resetResult = await result.current.resetPassword({
          email: 'test@test.com',
          code: '123456',
          newPassword: 'NewPassword123!',
        });
      });

      expect(resetResult.success).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('debe manejar errores en diferentes pasos del flujo', async () => {
      const { result } = renderHook(() => usePasswordRecovery());

      // Error en paso 1
      mockAuthRepo.forgotPassword.mockRejectedValue(new Error('Error 1'));
      await act(async () => {
        await result.current.sendRecoveryCode({
          email: 'test@test.com',
        });
      });

      expect(result.current.error).toBe('Error de recuperación sanitizado');

      // Limpiar y continuar
      act(() => {
        result.current.clearError();
      });

      // Éxito en paso 1, error en paso 2
      mockAuthRepo.forgotPassword.mockResolvedValue({ messageSent: true });
      mockAuthRepo.verifyRecoveryCode.mockRejectedValue(new Error('Error 2'));

      await act(async () => {
        await result.current.sendRecoveryCode({
          email: 'test@test.com',
        });
      });

      expect(result.current.error).toBeNull();

      await act(async () => {
        await result.current.verifyCode({
          email: 'test@test.com',
          code: 'wrong',
        });
      });

      expect(result.current.error).toBe('Error de verificación sanitizado');
    });
  });
});
