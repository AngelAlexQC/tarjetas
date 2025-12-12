/**
 * Error Sanitization Utilities
 *
 * Funciones para sanitizar mensajes de error antes de mostrarlos al usuario.
 * IMPORTANTE: Nunca exponer detalles técnicos al usuario final.
 */

import { SANITIZED_ERROR_MESSAGES } from '@/constants/security';

/**
 * Sanitiza mensajes de error de autenticación para no exponer detalles técnicos.
 * Los errores técnicos deben loguearse internamente pero al usuario se le muestra
 * un mensaje genérico y seguro.
 *
 * @param error - El error capturado
 * @param defaultMessage - Mensaje por defecto si no se puede categorizar el error
 * @returns Mensaje sanitizado seguro para mostrar al usuario
 */
export function sanitizeAuthError(
  error: unknown,
  defaultMessage: string = SANITIZED_ERROR_MESSAGES.GENERIC_LOGIN_ERROR
): string {
  const message = error instanceof Error ? error.message.toLowerCase() : '';

  // Errores de servidor (verificar primero para evitar falsos positivos)
  if (
    message.includes('server') ||
    message.includes('500') ||
    message.includes('502') ||
    message.includes('503') ||
    message.includes('504')
  ) {
    return SANITIZED_ERROR_MESSAGES.SERVER_ERROR;
  }

  // Rate limiting
  if (
    message.includes('rate') ||
    message.includes('limit') ||
    message.includes('too many') ||
    message.includes('429')
  ) {
    return SANITIZED_ERROR_MESSAGES.RATE_LIMITED;
  }

  // Errores de credenciales - mensaje específico seguro
  if (
    message.includes('credential') ||
    message.includes('password') ||
    message.includes('username') ||
    message.includes('invalid') ||
    message.includes('unauthorized') ||
    message.includes('401')
  ) {
    return SANITIZED_ERROR_MESSAGES.INVALID_CREDENTIALS;
  }

  // Errores de red
  if (
    message.includes('network') ||
    message.includes('connection') ||
    message.includes('timeout') ||
    message.includes('fetch') ||
    message.includes('econnrefused')
  ) {
    return SANITIZED_ERROR_MESSAGES.NETWORK_ERROR;
  }

  // Mensaje genérico para cualquier otro error
  return defaultMessage;
}

/**
 * Sanitiza errores de registro
 */
export function sanitizeRegisterError(error: unknown): string {
  const message = error instanceof Error ? error.message.toLowerCase() : '';

  // Usuario ya existe
  if (
    message.includes('exists') ||
    message.includes('duplicate') ||
    message.includes('already') ||
    message.includes('409')
  ) {
    return 'Este usuario o email ya está registrado';
  }

  // Validación
  if (message.includes('validation') || message.includes('invalid')) {
    return 'Por favor verifica los datos ingresados';
  }

  return sanitizeAuthError(error, SANITIZED_ERROR_MESSAGES.GENERIC_REGISTER_ERROR);
}

/**
 * Sanitiza errores de verificación
 */
export function sanitizeVerificationError(error: unknown): string {
  const message = error instanceof Error ? error.message.toLowerCase() : '';

  // Código expirado
  if (message.includes('expired') || message.includes('expir')) {
    return 'El código ha expirado. Solicita uno nuevo.';
  }

  // Código incorrecto
  if (message.includes('incorrect') || message.includes('invalid') || message.includes('wrong')) {
    return 'Código incorrecto. Verifica e intenta de nuevo.';
  }

  return sanitizeAuthError(error, SANITIZED_ERROR_MESSAGES.GENERIC_VERIFICATION_ERROR);
}

/**
 * Sanitiza errores de recuperación de contraseña
 */
export function sanitizeRecoveryError(error: unknown): string {
  const message = error instanceof Error ? error.message.toLowerCase() : '';

  // Email no encontrado - mensaje genérico por seguridad
  // NO revelar si el email existe o no en el sistema
  if (message.includes('not found') || message.includes('no existe') || message.includes('404')) {
    return 'Si el email existe en nuestro sistema, recibirás un código de recuperación.';
  }

  return sanitizeAuthError(error, SANITIZED_ERROR_MESSAGES.GENERIC_RECOVERY_ERROR);
}
