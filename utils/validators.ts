/**
 * Validadores de formulario compartidos
 * 
 * Funciones de validación reutilizables para formularios de autenticación.
 * 
 * IMPORTANTE: Las constantes de validación están centralizadas en @/constants/security
 * para mantener consistencia entre frontend y schemas.
 */

import { AUTH_CONFIG, VALIDATION_PATTERNS } from '@/constants/security';

/**
 * Valida si un email tiene formato correcto
 * Usa una regex más estricta basada en RFC 5322 simplificada
 */
export const isValidEmail = (email: string): boolean => {
  return VALIDATION_PATTERNS.EMAIL.test(email.trim());
};

/**
 * Valida si una contraseña cumple los requisitos de seguridad
 * - Mínimo 8 caracteres (configurable en AUTH_CONFIG)
 * - Al menos una letra mayúscula
 * - Al menos una letra minúscula
 * - Al menos un número
 * - Al menos un carácter especial
 */
export const isValidPassword = (password: string): boolean => {
  if (password.length < AUTH_CONFIG.PASSWORD_MIN_LENGTH) return false;
  
  const hasUpperCase = VALIDATION_PATTERNS.PASSWORD_UPPERCASE.test(password);
  const hasLowerCase = VALIDATION_PATTERNS.PASSWORD_LOWERCASE.test(password);
  const hasNumber = VALIDATION_PATTERNS.PASSWORD_NUMBER.test(password);
  const hasSpecialChar = VALIDATION_PATTERNS.PASSWORD_SPECIAL.test(password);
  
  return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
};

/**
 * Obtiene los requisitos faltantes de una contraseña
 * Útil para mostrar feedback detallado al usuario
 */
export const getPasswordRequirements = (password: string): {
  minLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  isValid: boolean;
} => {
  const requirements = {
    minLength: password.length >= AUTH_CONFIG.PASSWORD_MIN_LENGTH,
    hasUpperCase: VALIDATION_PATTERNS.PASSWORD_UPPERCASE.test(password),
    hasLowerCase: VALIDATION_PATTERNS.PASSWORD_LOWERCASE.test(password),
    hasNumber: VALIDATION_PATTERNS.PASSWORD_NUMBER.test(password),
    hasSpecialChar: VALIDATION_PATTERNS.PASSWORD_SPECIAL.test(password),
  };
  
  return {
    ...requirements,
    isValid: Object.values(requirements).every(Boolean),
  };
};

/**
 * Valida si un número de teléfono tiene formato válido
 * - Acepta prefijo opcional (+)
 * - 10 a 15 dígitos
 */
export const isValidPhone = (phone: string): boolean => {
  return VALIDATION_PATTERNS.PHONE.test(phone.replace(/\s/g, ''));
};
