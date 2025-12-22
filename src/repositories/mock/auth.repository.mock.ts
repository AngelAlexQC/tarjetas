/**
 * Mock Auth Repository
 * 
 * Implementación del repositorio de autenticación con datos mock.
 */

import { API_CONFIG } from '@/core/http/config';
import { IAuthRepository } from '../interfaces/auth.repository.interface';
import type {
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    LoginResponse,
    RecoverUserRequest,
    RecoverUserResponse,
    RegisterRequest,
    RegisterResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
    User,
    ValidateClientRequest,
    ValidateClientResponse,
    VerifyEmailRequest,
    VerifyEmailResponse,
    VerifyRecoveryCodeRequest,
    VerifyRecoveryCodeResponse,
} from '../schemas/auth.schema';

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

// Código de verificación simulado (para desarrollo)
const MOCK_VERIFICATION_CODE = '123456';

export class MockAuthRepository implements IAuthRepository {
  private currentUser: User | null = null;
  private pendingRegistrations: Map<string, RegisterRequest> = new Map();

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

    // Verificar código (en mock siempre es 123456)
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

    if (!request.email && (!request.accountNumber || (!request.birthDate && !request.constitutionDate && !request.cardPin))) {
      throw new Error('Por favor ingresa tu correo o tu número de cuenta con datos de verificación');
    }

    // En mock siempre retornamos éxito
    return {
      success: true,
      message: 'Código de recuperación enviado',
    };
  }

  async recoverUser(request: RecoverUserRequest): Promise<RecoverUserResponse> {
    await delay();

    if (!request.documentId || !request.documentType) {
      throw new Error('Datos de identificación incompletos');
    }

    if (!request.birthDate && !request.pin) {
      throw new Error('Debes ingresar tu fecha de nacimiento o PIN');
    }

    // Mock response
    return {
      success: true,
      username: MOCK_USER.username,
      maskedEmail: 'd***@example.com',
    };
  }

  async verifyRecoveryCode(request: VerifyRecoveryCodeRequest): Promise<VerifyRecoveryCodeResponse> {
    await delay();

    // Verificar código (en mock siempre es 123456)
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

    // Verificar código (en mock siempre es 123456)
    if (request.code !== MOCK_VERIFICATION_CODE) {
      throw new Error('Código de verificación incorrecto');
    }

    return {
      success: true,
      message: 'Contraseña actualizada exitosamente',
    };
  }

  // ============================================
  // VALIDACIÓN CLIENTE (Mock)
  // ============================================

  async validateClient(request: ValidateClientRequest): Promise<ValidateClientResponse> {
    await delay();

    // Mock logic: 
    // ID ending in 1 = Success
    // ID ending in 0 = Not Found
    // Other = Error

    if (request.documentId.endsWith('0')) {
      throw new Error('Cliente no encontrado');
    }
    
    // Simulate finding a client
    return {
      success: true,
      clientName: 'Juan Pérez Consumer', // Placeholder Mock Name
      message: 'Cliente validado',
    };
  }
}
