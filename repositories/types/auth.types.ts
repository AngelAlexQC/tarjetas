/**
 * Auth Types
 * 
 * Tipos centralizados para autenticación
 */

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  fullName?: string;
  phone?: string;
  avatar?: string;
  clientNumber?: string;
  documentId?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken?: string;
}
