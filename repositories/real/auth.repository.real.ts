/**
 * Real Auth Repository
 *
 * Implementación del repositorio de autenticación con llamadas HTTP reales.
 * Todas las respuestas son validadas con Zod para garantizar type-safety en runtime.
 */

import { API_ENDPOINTS } from '@/api/config';
import { httpClient } from '@/api/http-client';
import { parseApiData, validateOptionalApiData } from '@/utils/api-validation';
import { IAuthRepository } from '../interfaces/auth.repository.interface';
import type { 
  ForgotPasswordRequest, 
  ForgotPasswordResponse, 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse, 
  ResetPasswordRequest, 
  ResetPasswordResponse, 
  User,
  VerifyEmailRequest,
  VerifyEmailResponse,
  VerifyRecoveryCodeRequest,
  VerifyRecoveryCodeResponse,
} from '../schemas/auth.schema';
import {
  ForgotPasswordResponseSchema,
  LoginResponseSchema,
  RefreshTokenResponseSchema,
  RegisterResponseSchema,
  ResetPasswordResponseSchema,
  UserSchema,
  VerifyEmailResponseSchema,
  VerifyRecoveryCodeResponseSchema,
} from '../schemas/auth.schema';

export class RealAuthRepository implements IAuthRepository {

  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await httpClient.post<unknown>(
      API_ENDPOINTS.AUTH.LOGIN,
      request,
      { skipAuth: true }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error al iniciar sesión');
    }

    return parseApiData(LoginResponseSchema, response.data, 'respuesta de login');
  }

  async logout(): Promise<void> {
    await httpClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  }

  async refreshToken(): Promise<string> {
    const response = await httpClient.post<unknown>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error al refrescar token');
    }

    const validated = parseApiData(RefreshTokenResponseSchema, response.data, 'refresh token');
    return validated.token;
  }

  async getCurrentUser(): Promise<User | null> {
    const response = await httpClient.get<unknown>(API_ENDPOINTS.AUTH.ME);

    if (!response.success || !response.data) {
      return null;
    }

    const result = validateOptionalApiData(UserSchema, response.data, 'usuario actual');
    return result.isOk() ? (result.value ?? null) : null;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await httpClient.put<unknown>(
      API_ENDPOINTS.USER.PROFILE,
      data
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error al actualizar perfil');
    }
    
    return parseApiData(UserSchema, response.data, 'perfil de usuario');
  }

  // ============================================
  // REGISTRO
  // ============================================

  async register(request: RegisterRequest): Promise<RegisterResponse> {
    const response = await httpClient.post<unknown>(
      API_ENDPOINTS.AUTH.REGISTER,
      request,
      { skipAuth: true }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error al registrar usuario');
    }

    return parseApiData(RegisterResponseSchema, response.data, 'respuesta de registro');
  }

  async verifyEmail(request: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    const response = await httpClient.post<unknown>(
      API_ENDPOINTS.AUTH.VERIFY_EMAIL,
      request,
      { skipAuth: true }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error al verificar email');
    }

    return parseApiData(VerifyEmailResponseSchema, response.data, 'verificación de email');
  }

  async resendVerificationCode(email: string): Promise<{ success: boolean }> {
    const response = await httpClient.post<unknown>(
      API_ENDPOINTS.AUTH.RESEND_VERIFICATION,
      { email },
      { skipAuth: true }
    );

    if (!response.success) {
      throw new Error(response.error || 'Error al reenviar código');
    }

    return { success: true };
  }

  // ============================================
  // RECUPERACIÓN DE CONTRASEÑA
  // ============================================

  async forgotPassword(request: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    const response = await httpClient.post<unknown>(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      request,
      { skipAuth: true }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error al enviar código de recuperación');
    }

    return parseApiData(ForgotPasswordResponseSchema, response.data, 'recuperación de contraseña');
  }

  async verifyRecoveryCode(request: VerifyRecoveryCodeRequest): Promise<VerifyRecoveryCodeResponse> {
    const response = await httpClient.post<unknown>(
      API_ENDPOINTS.AUTH.VERIFY_RECOVERY_CODE,
      request,
      { skipAuth: true }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error al verificar código');
    }

    return parseApiData(VerifyRecoveryCodeResponseSchema, response.data, 'verificación de código');
  }

  async resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    const response = await httpClient.post<unknown>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      request,
      { skipAuth: true }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error al cambiar contraseña');
    }

    return parseApiData(ResetPasswordResponseSchema, response.data, 'cambio de contraseña');
  }
}
