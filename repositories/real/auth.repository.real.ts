/**
 * Real Auth Repository
 * 
 * Implementación del repositorio de autenticación con llamadas HTTP reales.
 */

import { API_ENDPOINTS } from '@/api/config';
import { httpClient } from '@/api/http-client';
import { IAuthRepository } from '../interfaces/auth.repository.interface';
import { LoginRequest, LoginResponse, User } from '../types/auth.types';

export class RealAuthRepository implements IAuthRepository {

  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await httpClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      request,
      { skipAuth: true }
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error al iniciar sesión');
    }
    
    return response.data;
  }

  async logout(): Promise<void> {
    await httpClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  }

  async refreshToken(): Promise<string> {
    const response = await httpClient.post<{ token: string }>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error al refrescar token');
    }
    
    return response.data.token;
  }

  async getCurrentUser(): Promise<User | null> {
    const response = await httpClient.get<User>(API_ENDPOINTS.AUTH.ME);
    
    if (!response.success) {
      return null;
    }
    
    return response.data || null;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await httpClient.put<User>(
      API_ENDPOINTS.USER.PROFILE,
      data
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error al actualizar perfil');
    }
    
    return response.data;
  }
}
