/**
 * Security Constants
 *
 * Constantes de seguridad centralizadas.
 * IMPORTANTE: No modificar sin revisión de seguridad.
 */

/**
 * Configuración de autenticación
 */
export const AUTH_CONFIG = {
  /** Longitud mínima de contraseña */
  PASSWORD_MIN_LENGTH: 8,

  /** Longitud mínima de username */
  USERNAME_MIN_LENGTH: 4,

  /** Longitud de códigos de verificación */
  VERIFICATION_CODE_LENGTH: 6,

  /** Longitud mínima de teléfono */
  PHONE_MIN_LENGTH: 10,

  /** Longitud máxima de teléfono */
  PHONE_MAX_LENGTH: 15,

  /** Tiempo de sesión inactiva antes de expirar (ms) - 15 minutos */
  SESSION_TIMEOUT_MS: 15 * 60 * 1000,

  /** Tiempo de gracia después de actividad (ms) - 1 minuto */
  SESSION_GRACE_PERIOD_MS: 60 * 1000,
} as const;

/**
 * Configuración de rate limiting para intentos de login
 */
export const RATE_LIMIT_CONFIG = {
  /** Máximo de intentos antes de bloqueo */
  MAX_LOGIN_ATTEMPTS: 5,

  /** Tiempo de bloqueo inicial (ms) - 1 minuto */
  INITIAL_LOCKOUT_MS: 60 * 1000,

  /** Factor de multiplicación para bloqueos progresivos */
  LOCKOUT_MULTIPLIER: 2,

  /** Tiempo máximo de bloqueo (ms) - 30 minutos */
  MAX_LOCKOUT_MS: 30 * 60 * 1000,

  /** Tiempo para resetear contador de intentos (ms) - 15 minutos */
  ATTEMPT_RESET_MS: 15 * 60 * 1000,
} as const;

/**
 * Regex patterns para validación
 */
export const VALIDATION_PATTERNS = {
  /** Email - Validación estricta RFC 5322 simplificada */
  EMAIL: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,

  /** Contraseña con mayúscula */
  PASSWORD_UPPERCASE: /[A-Z]/,

  /** Contraseña con minúscula */
  PASSWORD_LOWERCASE: /[a-z]/,

  /** Contraseña con número */
  PASSWORD_NUMBER: /\d/,

  /** Contraseña con carácter especial */
  PASSWORD_SPECIAL: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\/'`~;]/,

  /** Teléfono con prefijo opcional */
  PHONE: /^\+?[0-9]{10,15}$/,
} as const;

/**
 * Mensajes de error sanitizados para usuarios
 * NO exponen detalles técnicos
 */
export const SANITIZED_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Usuario o contraseña incorrectos',
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet e intenta de nuevo.',
  SERVER_ERROR: 'El servicio no está disponible. Intenta más tarde.',
  GENERIC_LOGIN_ERROR: 'Error al iniciar sesión. Intenta de nuevo.',
  GENERIC_REGISTER_ERROR: 'Error al registrar. Intenta de nuevo.',
  GENERIC_VERIFICATION_ERROR: 'Error al verificar. Intenta de nuevo.',
  GENERIC_RECOVERY_ERROR: 'Error al recuperar contraseña. Intenta de nuevo.',
  RATE_LIMITED: 'Demasiados intentos. Intenta de nuevo más tarde.',
  SESSION_EXPIRED: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
  BIOMETRIC_UNAVAILABLE: 'Autenticación biométrica no disponible',
  BIOMETRIC_CANCELLED: 'Cancelado por el usuario',
  BIOMETRIC_FAILED: 'Autenticación fallida',
  NO_SESSION: 'No hay sesión guardada',
} as const;

/**
 * Campos sensibles que deben ser redactados en logs
 */
export const SENSITIVE_FIELDS = [
  'password',
  'token',
  'refreshToken',
  'secret',
  'apiKey',
  'authorization',
  'creditCard',
  'cvv',
  'pin',
  'ssn',
  'securityCode',
] as const;
