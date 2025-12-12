/**
 * Mock Auth Repository
 * 
 * Implementación del repositorio de autenticación con datos mock.
 */

import { API_CONFIG } from '@/api/config';
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

// Simula delay de red
const delay = (ms: number = API_CONFIG.MOCK_DELAY) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Usuario mock con datos claramente ficticios
// NOTA: Usar datos obviamente falsos para evitar confusión con datos reales
const MOCK_USER: User = {
  id: 'mock-user-001',
  username: 'demo',
  email: 'demo@example.com',
  name: 'Usuario Demo',
  fullName: 'Usuario Demo de Pruebas',
  phone: '000 00 00 000',
  avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  clientNumber: '00000000000000',
  documentId: '0000000000',
};

// Código de verificación para desarrollo (solo funciona en modo mock)
// En producción este archivo no se usa
const MOCK_VERIFICATION_CODE = process.env.EXPO_PUBLIC_MOCK_OTP || '000000';

export class MockAuthRepository implements IAuthRepository {
  private currentUser: User | null = null;
  private pendingRegistrations: Map<string, RegisterRequest> = new Map();

  async login(request: LoginRequest): Promise<LoginResponse> {
    await delay();
    
    // Validaciones básicas
    if (!request.username || !request.password) {
      throw new Error('Por favor completa todos los campos');
    }

    // NOTA: Validación unificada - misma regla que producción (8 caracteres mínimo)
    if (request.password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
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

  // ============================================
  // REGISTRO
  // ============================================

  async register(request: RegisterRequest): Promise<RegisterResponse> {
    await delay();

    // Validaciones básicas
    if (!request.email || !request.username || !request.password) {
      throw new Error('Por favor completa todos los campos obligatorios');
    }

    if (request.password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    // Simular que el email ya está registrado (para testing)
    if (request.email === 'existing@example.com') {
      throw new Error('Este correo electrónico ya está registrado');
    }

    // Guardar registro pendiente
    this.pendingRegistrations.set(request.email, request);

    return {
      success: true,
      message: 'Código de verificación enviado',
      userId: `user_${Date.now()}`,
      requiresVerification: true,
    };
  }

  async verifyEmail(request: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    await delay();

    if (request.code !== MOCK_VERIFICATION_CODE) {
      throw new Error('Código de verificación incorrecto');
    }

    const pendingUser = this.pendingRegistrations.get(request.email);
    if (!pendingUser) {
      throw new Error('No hay registro pendiente para este email');
    }

    // Crear usuario verificado
    const newUser: User = {
      id: `user_${Date.now()}`,
      username: pendingUser.username,
      email: pendingUser.email,
      name: pendingUser.fullName.split(' ')[0],
      fullName: pendingUser.fullName,
      phone: pendingUser.phone,
    };

    this.currentUser = newUser;
    this.pendingRegistrations.delete(request.email);

    return {
      success: true,
      message: 'Cuenta verificada exitosamente',
      token: `mock_token_${newUser.username}_${Date.now()}`,
      user: newUser,
    };
  }

  async resendVerificationCode(email: string): Promise<{ success: boolean }> {
    await delay();
    
    if (!this.pendingRegistrations.has(email)) {
      throw new Error('No hay registro pendiente para este email');
    }

    return { success: true };
  }

  // ============================================
  // RECUPERACIÓN DE CONTRASEÑA
  // ============================================

  async forgotPassword(request: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    await delay();

    if (!request.email) {
      throw new Error('Por favor ingresa tu correo electrónico');
    }

    // En mock siempre retornamos éxito
    return {
      success: true,
      message: 'Código de recuperación enviado',
    };
  }

  async verifyRecoveryCode(request: VerifyRecoveryCodeRequest): Promise<VerifyRecoveryCodeResponse> {
    await delay();

    if (request.code !== MOCK_VERIFICATION_CODE) {
      throw new Error('Código de verificación incorrecto');
    }

    return {
      success: true,
      resetToken: `reset_token_${Date.now()}`,
      message: 'Código verificado',
    };
  }

  async resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    await delay();

    if (!request.newPassword || request.newPassword.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    if (request.code !== MOCK_VERIFICATION_CODE) {
      throw new Error('Código de verificación incorrecto');
    }

    return {
      success: true,
      message: 'Contraseña actualizada exitosamente',
    };
  }
}
