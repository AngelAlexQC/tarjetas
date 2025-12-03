/**
 * Application Errors
 * 
 * Sistema de errores tipados para la aplicación.
 * Facilita el manejo consistente de errores en toda la app.
 */

/**
 * Códigos de error de la aplicación.
 */
export enum ErrorCode {
  // Errores de red
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  
  // Errores de autenticación
  UNAUTHORIZED = 'UNAUTHORIZED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  BIOMETRIC_FAILED = 'BIOMETRIC_FAILED',
  BIOMETRIC_NOT_AVAILABLE = 'BIOMETRIC_NOT_AVAILABLE',
  
  // Errores de validación
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Errores de negocio
  CARD_BLOCKED = 'CARD_BLOCKED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  LIMIT_EXCEEDED = 'LIMIT_EXCEEDED',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',
  
  // Errores genéricos
  UNKNOWN = 'UNKNOWN',
  SERVER_ERROR = 'SERVER_ERROR',
}

/**
 * Mensajes de error por defecto para cada código.
 */
const DEFAULT_ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.NETWORK_ERROR]: 'Error de conexión. Verifica tu conexión a internet.',
  [ErrorCode.TIMEOUT]: 'La solicitud tardó demasiado. Intenta de nuevo.',
  [ErrorCode.UNAUTHORIZED]: 'No tienes autorización para realizar esta acción.',
  [ErrorCode.SESSION_EXPIRED]: 'Tu sesión ha expirado. Inicia sesión nuevamente.',
  [ErrorCode.INVALID_CREDENTIALS]: 'Usuario o contraseña incorrectos.',
  [ErrorCode.BIOMETRIC_FAILED]: 'La autenticación biométrica falló.',
  [ErrorCode.BIOMETRIC_NOT_AVAILABLE]: 'Autenticación biométrica no disponible.',
  [ErrorCode.VALIDATION_ERROR]: 'Los datos ingresados no son válidos.',
  [ErrorCode.INVALID_INPUT]: 'Entrada inválida.',
  [ErrorCode.CARD_BLOCKED]: 'La tarjeta está bloqueada.',
  [ErrorCode.INSUFFICIENT_FUNDS]: 'Fondos insuficientes.',
  [ErrorCode.LIMIT_EXCEEDED]: 'Has excedido el límite permitido.',
  [ErrorCode.OPERATION_NOT_ALLOWED]: 'Esta operación no está permitida.',
  [ErrorCode.UNKNOWN]: 'Ha ocurrido un error inesperado.',
  [ErrorCode.SERVER_ERROR]: 'Error del servidor. Intenta más tarde.',
};

/**
 * Error base de la aplicación.
 */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly originalError?: unknown;
  readonly details?: Record<string, unknown>;

  constructor(
    code: ErrorCode,
    message?: string,
    options?: {
      originalError?: unknown;
      details?: Record<string, unknown>;
    }
  ) {
    super(message || DEFAULT_ERROR_MESSAGES[code]);
    this.name = 'AppError';
    this.code = code;
    this.originalError = options?.originalError;
    this.details = options?.details;
  }

  /**
   * Crea un error de red.
   */
  static network(message?: string, originalError?: unknown): AppError {
    return new AppError(ErrorCode.NETWORK_ERROR, message, { originalError });
  }

  /**
   * Crea un error de timeout.
   */
  static timeout(message?: string): AppError {
    return new AppError(ErrorCode.TIMEOUT, message);
  }

  /**
   * Crea un error de validación.
   */
  static validation(message: string, details?: Record<string, unknown>): AppError {
    return new AppError(ErrorCode.VALIDATION_ERROR, message, { details });
  }

  /**
   * Crea un error de autenticación.
   */
  static unauthorized(message?: string): AppError {
    return new AppError(ErrorCode.UNAUTHORIZED, message);
  }

  /**
   * Crea un error de sesión expirada.
   */
  static sessionExpired(): AppError {
    return new AppError(ErrorCode.SESSION_EXPIRED);
  }

  /**
   * Crea un error desde una respuesta HTTP.
   */
  static fromHttpStatus(status: number, message?: string): AppError {
    switch (status) {
      case 400:
        return new AppError(ErrorCode.INVALID_INPUT, message);
      case 401:
        return new AppError(ErrorCode.UNAUTHORIZED, message);
      case 403:
        return new AppError(ErrorCode.OPERATION_NOT_ALLOWED, message);
      case 404:
        return new AppError(ErrorCode.UNKNOWN, message || 'Recurso no encontrado');
      case 408:
        return new AppError(ErrorCode.TIMEOUT, message);
      case 500:
      case 502:
      case 503:
        return new AppError(ErrorCode.SERVER_ERROR, message);
      default:
        return new AppError(ErrorCode.UNKNOWN, message);
    }
  }

  /**
   * Crea un AppError desde cualquier error desconocido.
   */
  static from(error: unknown): AppError {
    if (error instanceof AppError) {
      return error;
    }
    
    if (error instanceof Error) {
      return new AppError(ErrorCode.UNKNOWN, error.message, { originalError: error });
    }
    
    return new AppError(ErrorCode.UNKNOWN, String(error));
  }
}

/**
 * Tipo para resultado de operación que puede fallar.
 */
export type Result<T, E = AppError> = 
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Helper para crear un resultado exitoso.
 */
export function success<T>(data: T): Result<T> {
  return { success: true, data };
}

/**
 * Helper para crear un resultado fallido.
 */
export function failure<E = AppError>(error: E): Result<never, E> {
  return { success: false, error };
}

/**
 * Helper para verificar si es un AppError.
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
