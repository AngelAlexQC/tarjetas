/**
 * Auth Repository Interface
 * 
 * Contrato que define todas las operaciones de autenticación.
 */

import {
  User,
  LoginRequest,
  LoginResponse,
} from '../types';

export interface IAuthRepository {
  // Login/Logout
  login(request: LoginRequest): Promise<LoginResponse>;
  logout(): Promise<void>;
  
  // Token
  refreshToken(): Promise<string>;
  
  // Usuario
  getCurrentUser(): Promise<User | null>;
  updateProfile(data: Partial<User>): Promise<User>;
}
