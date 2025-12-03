/**
 * Mock Auth Repository
 * 
 * Implementación del repositorio de autenticación con datos mock.
 */

import { API_CONFIG } from '@/api/config';
import { IAuthRepository } from '../interfaces/auth.repository.interface';
import type { LoginRequest, LoginResponse, User } from '../schemas/auth.schema';

// Simula delay de red
const delay = (ms: number = API_CONFIG.MOCK_DELAY) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Usuario mock
const MOCK_USER: User = {
  id: '1',
  username: 'demo',
  email: 'demo@example.com',
  name: 'Sofía Durán',
  fullName: 'Sofía Jaqueline Durán Arévalo',
  phone: '097 90 68 798',
  avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  clientNumber: '34896777747433',
  documentId: '0105168991',
};

export class MockAuthRepository implements IAuthRepository {
  private currentUser: User | null = null;

  async login(request: LoginRequest): Promise<LoginResponse> {
    await delay();
    
    // Validaciones básicas
    if (!request.username || !request.password) {
      throw new Error('Por favor completa todos los campos');
    }

    if (request.password.length < 4) {
      throw new Error('La contraseña debe tener al menos 4 caracteres');
    }

    // Simular autenticación exitosa
    this.currentUser = {
      ...MOCK_USER,
      username: request.username.toLowerCase(),
      email: `${request.username.toLowerCase()}@example.com`,
    };

    return {
      user: this.currentUser,
      token: `mock_token_${request.username}_${Date.now()}`,
      refreshToken: `mock_refresh_${Date.now()}`,
    };
  }

  async logout(): Promise<void> {
    await delay(300);
    this.currentUser = null;
  }

  async refreshToken(): Promise<string> {
    await delay(300);
    return `mock_token_refreshed_${Date.now()}`;
  }

  async getCurrentUser(): Promise<User | null> {
    await delay(300);
    return this.currentUser || MOCK_USER;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    await delay();
    
    if (this.currentUser) {
      this.currentUser = { ...this.currentUser, ...data };
      return this.currentUser;
    }
    
    return { ...MOCK_USER, ...data };
  }
}
