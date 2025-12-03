/**
 * Auth Schemas - Zod Validation
 * 
 * Esquemas de validación para autenticación.
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
  user: UserSchema,
  expiresAt: z.string().datetime().optional(),
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
export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;
export type BiometricResult = z.infer<typeof BiometricResultSchema>;
