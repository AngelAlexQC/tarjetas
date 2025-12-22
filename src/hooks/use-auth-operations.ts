/**
 * useAuthOperations Hook
 * 
 * Hook para manejar operaciones de autenticación como registro,
 * recuperación de contraseña y verificación de códigos.
 * 
 * Sigue el patrón de separación de responsabilidades del proyecto.
 */

import { authRepository$ } from '@/repositories';
import type {
    RegisterRequest,
    ResetPasswordRequest,
    ValidateClientRequest,
    VerifyEmailRequest,
    VerifyRecoveryCodeRequest,
} from '@/repositories/schemas/auth.schema';
import { loggers } from '@/utils/logger';
import { useCallback, useState } from 'react';

const log = loggers.auth;

interface OperationState {
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook para operaciones de registro de usuario
 */
export function useRegister() {
  const [state, setState] = useState<OperationState>({ isLoading: false, error: null });

  const register = useCallback(async (request: RegisterRequest) => {
    setState({ isLoading: true, error: null });
    try {
      const repo = authRepository$();
      const result = await repo.register(request);
      setState({ isLoading: false, error: null });
      return { success: true, data: result };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al registrar';
      log.error('Register error:', error);
      setState({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  }, []);

  const verifyEmail = useCallback(async (request: VerifyEmailRequest) => {
    setState({ isLoading: true, error: null });
    try {
      const repo = authRepository$();
      const result = await repo.verifyEmail(request);
      setState({ isLoading: false, error: null });
      return { success: true, data: result };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al verificar';
      log.error('Verify email error:', error);
      setState({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  }, []);

  const resendCode = useCallback(async (email: string) => {
    setState({ isLoading: true, error: null });
    try {
      const repo = authRepository$();
      await repo.resendVerificationCode(email);
      setState({ isLoading: false, error: null });
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al reenviar código';
      log.error('Resend code error:', error);
      setState({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  }, []);

  const validateClient = useCallback(async (request: ValidateClientRequest) => {
    setState({ isLoading: true, error: null });
    try {
      const repo = authRepository$();
      const result = await repo.validateClient(request);
      setState({ isLoading: false, error: null });
      return { success: true, data: result };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al validar cliente';
      log.error('Validate client error:', error);
      setState({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    register,
    verifyEmail,
    resendCode,
    validateClient,
    clearError,
  };
}

/**
 * Hook para operaciones de recuperación de contraseña
 */
export function usePasswordRecovery() {
  const [state, setState] = useState<OperationState>({ isLoading: false, error: null });

  const sendRecoveryCode = useCallback(async (request: ForgotPasswordRequest) => {
    setState({ isLoading: true, error: null });
    try {
      const repo = authRepository$();
      const result = await repo.forgotPassword(request);
      setState({ isLoading: false, error: null });
      return { success: true, data: result };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al enviar código';
      log.error('Forgot password error:', error);
      setState({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  }, []);

  const verifyCode = useCallback(async (request: VerifyRecoveryCodeRequest) => {
    setState({ isLoading: true, error: null });
    try {
      const repo = authRepository$();
      const result = await repo.verifyRecoveryCode(request);
      setState({ isLoading: false, error: null });
      return { success: true, data: result };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Código incorrecto';
      log.error('Verify recovery code error:', error);
      setState({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  }, []);

  const resetPassword = useCallback(async (request: ResetPasswordRequest) => {
    setState({ isLoading: true, error: null });
    try {
      const repo = authRepository$();
      const result = await repo.resetPassword(request);
      setState({ isLoading: false, error: null });
      return { success: true, data: result };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cambiar contraseña';
      log.error('Reset password error:', error);
      setState({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    sendRecoveryCode,
    verifyCode,
    resetPassword,
    clearError,
  };
}
