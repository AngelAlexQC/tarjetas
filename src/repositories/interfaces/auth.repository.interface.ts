/**
 * Auth Repository Interface
 * 
 * Contrato que define todas las operaciones de autenticación.
 */

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
    VerifyEmailRequest,
    VerifyEmailResponse,
    VerifyRecoveryCodeRequest,
    VerifyRecoveryCodeResponse,
} from '../schemas/auth.schema';

export interface IAuthRepository {
  // Login/Logout
  login(request: LoginRequest): Promise<LoginResponse>;
  logout(): Promise<void>;
  
  // Token
  refreshToken(): Promise<string>;
  
  // Usuario
  getCurrentUser(): Promise<User | null>;
  updateProfile(data: Partial<User>): Promise<User>;
  
  // Registro
  register(request: RegisterRequest): Promise<RegisterResponse>;
  verifyEmail(request: VerifyEmailRequest): Promise<VerifyEmailResponse>;
  resendVerificationCode(email: string): Promise<{ success: boolean }>;
  
  // Recuperación de contraseña
  forgotPassword(request: ForgotPasswordRequest): Promise<ForgotPasswordResponse>;
  recoverUser(request: RecoverUserRequest): Promise<RecoverUserResponse>;
  verifyRecoveryCode(request: VerifyRecoveryCodeRequest): Promise<VerifyRecoveryCodeResponse>;
  resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse>;
}
