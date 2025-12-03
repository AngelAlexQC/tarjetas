/**
 * Real Auth Repository
 * 
 * Implementación del repositorio de autenticación con llamadas HTTP reales.
 * Todas las respuestas son validadas con Zod para garantizar type-safety en runtime.
 */

import { API_ENDPOINTS } from '@/api/config';
import { httpClient } from '@/api/http-client';
import { parseApiData, parseOptionalApiData } from '@/utils/api-validation';
import { IAuthRepository } from '../interfaces/auth.repository.interface';
import type { LoginRequest, LoginResponse, User } from '../schemas/auth.schema';
import {
  LoginResponseSchema,
  RefreshTokenResponseSchema,
  UserSchema,
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
    
    return parseOptionalApiData(UserSchema, response.data, 'usuario actual') ?? null;
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
}
