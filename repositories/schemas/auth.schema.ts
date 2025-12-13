/**
 * Auth Schemas - Zod Validation
 * 
 * Esquemas de validación para autenticación.
 * 
 * IMPORTANTE: Este es el único lugar donde se definen los tipos de autenticación.
 * NO crear tipos duplicados en otro lugar.
 * 
 * Las constantes de validación están centralizadas en @/constants/security
 */

import { AUTH_CONFIG, VALIDATION_PATTERNS } from '@/constants/security';
import { z } from 'zod';

// ============================================
// CUSTOM VALIDATORS (basados en constantes centralizadas)
// ============================================

/**
 * Validador de contraseña segura usando las mismas reglas que validators.ts
 */
const passwordSchema = z.string()
  .min(AUTH_CONFIG.PASSWORD_MIN_LENGTH, `La contraseña debe tener al menos ${AUTH_CONFIG.PASSWORD_MIN_LENGTH} caracteres`)
  .refine(
    (password) => VALIDATION_PATTERNS.PASSWORD_UPPERCASE.test(password),
    'La contraseña debe contener al menos una mayúscula'
  )
  .refine(
    (password) => VALIDATION_PATTERNS.PASSWORD_LOWERCASE.test(password),
    'La contraseña debe contener al menos una minúscula'
  )
  .refine(
    (password) => VALIDATION_PATTERNS.PASSWORD_NUMBER.test(password),
    'La contraseña debe contener al menos un número'
  )
  .refine(
    (password) => VALIDATION_PATTERNS.PASSWORD_SPECIAL.test(password),
    'La contraseña debe contener al menos un carácter especial'
  );

// ============================================
// USER
// ============================================

export const UserSchema = z.object({
  id: z.string().min(1),
  username: z.string().min(1),
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format').optional(),
  name: z.string().optional(),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
  clientNumber: z.string().optional(),
  documentId: z.string().optional(),
});

// ============================================
// LOGIN
// ============================================

export const LoginRequestSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const LoginResponseSchema = z.object({
  token: z.string().min(1),
  refreshToken: z.string().optional(),
  user: UserSchema,
  expiresAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, 'Invalid datetime format').optional(),
});

// ============================================
// REGISTER
// ============================================

export const RegisterRequestSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email'),
  phone: z.string().min(AUTH_CONFIG.PHONE_MIN_LENGTH, 'Phone is required'),
  username: z.string().min(AUTH_CONFIG.USERNAME_MIN_LENGTH, `Username must be at least ${AUTH_CONFIG.USERNAME_MIN_LENGTH} characters`),
  password: passwordSchema,
});

export const RegisterResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  userId: z.string().optional(),
  requiresVerification: z.boolean().optional(),
});

export const VerifyEmailRequestSchema = z.object({
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  code: z.string().length(AUTH_CONFIG.VERIFICATION_CODE_LENGTH),
});

export const VerifyEmailResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  token: z.string().optional(),
  user: UserSchema.optional(),
});

// ============================================
// PASSWORD RECOVERY
// ============================================

export const ForgotPasswordRequestSchema = z.object({
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email'),
});

export const ForgotPasswordResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export const VerifyRecoveryCodeRequestSchema = z.object({
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  code: z.string().length(AUTH_CONFIG.VERIFICATION_CODE_LENGTH),
});

export const VerifyRecoveryCodeResponseSchema = z.object({
  success: z.boolean(),
  resetToken: z.string().optional(),
  message: z.string().optional(),
});

export const ResetPasswordRequestSchema = z.object({
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  code: z.string().length(AUTH_CONFIG.VERIFICATION_CODE_LENGTH),
  newPassword: passwordSchema,
});

export const ResetPasswordResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

// ============================================
// REFRESH TOKEN
// ============================================

export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

export const RefreshTokenResponseSchema = z.object({
  token: z.string().min(1),
  refreshToken: z.string().optional(),
});

// ============================================
// LOGOUT
// ============================================

export const LogoutResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

// ============================================
// BIOMETRIC
// ============================================

export const BiometricResultSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});

// ============================================
// INFERRED TYPES
// ============================================

export type User = z.infer<typeof UserSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// Register types
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
export type VerifyEmailRequest = z.infer<typeof VerifyEmailRequestSchema>;
export type VerifyEmailResponse = z.infer<typeof VerifyEmailResponseSchema>;

// Password recovery types
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;
export type ForgotPasswordResponse = z.infer<typeof ForgotPasswordResponseSchema>;
export type VerifyRecoveryCodeRequest = z.infer<typeof VerifyRecoveryCodeRequestSchema>;
export type VerifyRecoveryCodeResponse = z.infer<typeof VerifyRecoveryCodeResponseSchema>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;
export type ResetPasswordResponse = z.infer<typeof ResetPasswordResponseSchema>;

export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;
export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;
export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;
export type BiometricResult = z.infer<typeof BiometricResultSchema>;

