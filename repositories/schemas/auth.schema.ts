/**
 * Auth Schemas - Zod Validation
 * 
 * Esquemas de validación para autenticación.
 * 
 * IMPORTANTE: Este es el único lugar donde se definen los tipos de autenticación.
 * NO crear tipos duplicados en otro lugar.
 */

import { z } from 'zod';

// ============================================
// USER
// ============================================

export const UserSchema = z.object({
  id: z.string().min(1),
  username: z.string().min(1),
  email: z.string().email().optional(),
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
  expiresAt: z.string().datetime().optional(),
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
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;
export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;
export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;
export type BiometricResult = z.infer<typeof BiometricResultSchema>;
