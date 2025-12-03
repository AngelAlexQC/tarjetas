/**
 * Result Pattern - Error Handling con neverthrow
 *
 * Este módulo centraliza el manejo de errores usando el patrón Result.
 * neverthrow proporciona tipos Result<T, E> y ResultAsync<T, E> que hacen
 * los errores explícitos en el sistema de tipos.
 *
 * PRINCIPIOS:
 * 1. Los errores son valores, no excepciones
 * 2. Los errores son parte del contrato de la función (en el tipo de retorno)
 * 3. El compilador te obliga a manejar los errores
 *
 * USO:
 * ```typescript
 * import { ok, err, ResultAsync } from '@/utils/result';
 *
 * // Crear resultados
 * const success = ok({ id: '1', name: 'Card' });
 * const failure = err(AppError.notFound('Card not found'));
 *
 * // Encadenar operaciones
 * const result = await getCard(id)
 *   .andThen(card => validateCard(card))
 *   .map(card => transformCard(card));
 *
 * // Manejar el resultado
 * result.match(
 *   card => console.log('Success:', card),
 *   error => console.log('Error:', error.message)
 * );
 * ```
 */

// Re-exportar todo de neverthrow para uso centralizado
export {
  Result,
  ResultAsync,
  ok,
  err,
  okAsync,
  errAsync,
  fromPromise,
  fromSafePromise,
  fromThrowable,
} from 'neverthrow';

// Re-exportar tipos útiles
export type { Ok, Err } from 'neverthrow';

// ============================================
// APP ERROR - Error tipado de la aplicación
// ============================================

/**
 * Códigos de error de la aplicación.
 * Cada código representa una categoría de error específica.
 */
export enum ErrorCode {
  // Red
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',

  // Autenticación
  UNAUTHORIZED = 'UNAUTHORIZED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  BIOMETRIC_FAILED = 'BIOMETRIC_FAILED',
  BIOMETRIC_NOT_AVAILABLE = 'BIOMETRIC_NOT_AVAILABLE',

  // Validación
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',

  // Negocio
  CARD_BLOCKED = 'CARD_BLOCKED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  LIMIT_EXCEEDED = 'LIMIT_EXCEEDED',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',

  // Sistema
  UNKNOWN = 'UNKNOWN',
  SERVER = 'SERVER',
}

/**
 * Mensajes por defecto para cada código de error.
 * Usados cuando no se proporciona un mensaje personalizado.
 */
const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.NETWORK]: 'Error de conexión. Verifica tu internet.',
  [ErrorCode.TIMEOUT]: 'La solicitud tardó demasiado. Intenta de nuevo.',
  [ErrorCode.UNAUTHORIZED]: 'No tienes autorización para esta acción.',
  [ErrorCode.SESSION_EXPIRED]: 'Tu sesión ha expirado. Inicia sesión nuevamente.',
  [ErrorCode.INVALID_CREDENTIALS]: 'Usuario o contraseña incorrectos.',
  [ErrorCode.BIOMETRIC_FAILED]: 'La autenticación biométrica falló.',
  [ErrorCode.BIOMETRIC_NOT_AVAILABLE]: 'Autenticación biométrica no disponible.',
  [ErrorCode.VALIDATION]: 'Los datos ingresados no son válidos.',
  [ErrorCode.NOT_FOUND]: 'El recurso solicitado no existe.',
  [ErrorCode.CARD_BLOCKED]: 'La tarjeta está bloqueada.',
  [ErrorCode.INSUFFICIENT_FUNDS]: 'Fondos insuficientes.',
  [ErrorCode.LIMIT_EXCEEDED]: 'Has excedido el límite permitido.',
  [ErrorCode.OPERATION_NOT_ALLOWED]: 'Esta operación no está permitida.',
  [ErrorCode.UNKNOWN]: 'Ha ocurrido un error inesperado.',
  [ErrorCode.SERVER]: 'Error del servidor. Intenta más tarde.',
};

/**
 * Error tipado de la aplicación.
 *
 * Uso con neverthrow:
 * ```typescript
 * const result: Result<Card, AppError> = err(AppError.notFound('Card'));
 * ```
 */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly cause?: unknown;

  private constructor(code: ErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.cause = cause;

    // Mantener el stack trace correcto en V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  // ============================================
  // FACTORY METHODS - Crear errores específicos
  // ============================================

  /** Error de red/conexión */
  static network(message?: string, cause?: unknown): AppError {
    return new AppError(ErrorCode.NETWORK, message ?? ERROR_MESSAGES[ErrorCode.NETWORK], cause);
  }

  /** Error de timeout */
  static timeout(message?: string): AppError {
    return new AppError(ErrorCode.TIMEOUT, message ?? ERROR_MESSAGES[ErrorCode.TIMEOUT]);
  }

  /** No autorizado */
  static unauthorized(message?: string): AppError {
    return new AppError(ErrorCode.UNAUTHORIZED, message ?? ERROR_MESSAGES[ErrorCode.UNAUTHORIZED]);
  }

  /** Sesión expirada */
  static sessionExpired(): AppError {
    return new AppError(ErrorCode.SESSION_EXPIRED, ERROR_MESSAGES[ErrorCode.SESSION_EXPIRED]);
  }

  /** Credenciales inválidas */
  static invalidCredentials(message?: string): AppError {
    return new AppError(
      ErrorCode.INVALID_CREDENTIALS,
      message ?? ERROR_MESSAGES[ErrorCode.INVALID_CREDENTIALS]
    );
  }

  /** Error biométrico */
  static biometricFailed(message?: string): AppError {
    return new AppError(
      ErrorCode.BIOMETRIC_FAILED,
      message ?? ERROR_MESSAGES[ErrorCode.BIOMETRIC_FAILED]
    );
  }

  /** Biométrica no disponible */
  static biometricNotAvailable(): AppError {
    return new AppError(
      ErrorCode.BIOMETRIC_NOT_AVAILABLE,
      ERROR_MESSAGES[ErrorCode.BIOMETRIC_NOT_AVAILABLE]
    );
  }

  /** Error de validación */
  static validation(message: string): AppError {
    return new AppError(ErrorCode.VALIDATION, message);
  }

  /** Recurso no encontrado */
  static notFound(resource: string): AppError {
    return new AppError(ErrorCode.NOT_FOUND, `${resource} no encontrado`);
  }

  /** Tarjeta bloqueada */
  static cardBlocked(): AppError {
    return new AppError(ErrorCode.CARD_BLOCKED, ERROR_MESSAGES[ErrorCode.CARD_BLOCKED]);
  }

  /** Fondos insuficientes */
  static insufficientFunds(): AppError {
    return new AppError(ErrorCode.INSUFFICIENT_FUNDS, ERROR_MESSAGES[ErrorCode.INSUFFICIENT_FUNDS]);
  }

  /** Límite excedido */
  static limitExceeded(message?: string): AppError {
    return new AppError(ErrorCode.LIMIT_EXCEEDED, message ?? ERROR_MESSAGES[ErrorCode.LIMIT_EXCEEDED]);
  }

  /** Operación no permitida */
  static operationNotAllowed(message?: string): AppError {
    return new AppError(
      ErrorCode.OPERATION_NOT_ALLOWED,
      message ?? ERROR_MESSAGES[ErrorCode.OPERATION_NOT_ALLOWED]
    );
  }

  /** Error del servidor */
  static server(message?: string, cause?: unknown): AppError {
    return new AppError(ErrorCode.SERVER, message ?? ERROR_MESSAGES[ErrorCode.SERVER], cause);
  }

  /** Error desconocido */
  static unknown(message?: string, cause?: unknown): AppError {
    return new AppError(ErrorCode.UNKNOWN, message ?? ERROR_MESSAGES[ErrorCode.UNKNOWN], cause);
  }

  // ============================================
  // CONVERSION METHODS
  // ============================================

  /**
   * Crea un AppError desde un código de estado HTTP.
   */
  static fromHttpStatus(status: number, message?: string): AppError {
    switch (status) {
      case 400:
        return AppError.validation(message ?? 'Solicitud inválida');
      case 401:
        return AppError.unauthorized(message);
      case 403:
        return AppError.operationNotAllowed(message);
      case 404:
        return AppError.notFound(message ?? 'Recurso');
      case 408:
        return AppError.timeout(message);
      case 500:
      case 502:
      case 503:
        return AppError.server(message);
      default:
        return AppError.unknown(message);
    }
  }

  /**
   * Crea un AppError desde cualquier error desconocido.
   * Útil para convertir errores de librerías externas.
   */
  static from(error: unknown): AppError {
    if (error instanceof AppError) {
      return error;
    }

    if (error instanceof Error) {
      // Detectar errores de red comunes
      if (error.message.includes('Network') || error.message.includes('fetch')) {
        return AppError.network(error.message, error);
      }
      if (error.message.includes('timeout') || error.message.includes('Timeout')) {
        return AppError.timeout(error.message);
      }
      return AppError.unknown(error.message, error);
    }

    if (typeof error === 'string') {
      return AppError.unknown(error);
    }

    return AppError.unknown('Error desconocido', error);
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Verifica si el error es de un código específico.
   */
  is(code: ErrorCode): boolean {
    return this.code === code;
  }

  /**
   * Verifica si es un error de autenticación.
   */
  isAuthError(): boolean {
    return [
      ErrorCode.UNAUTHORIZED,
      ErrorCode.SESSION_EXPIRED,
      ErrorCode.INVALID_CREDENTIALS,
    ].includes(this.code);
  }

  /**
   * Verifica si es un error de red.
   */
  isNetworkError(): boolean {
    return [ErrorCode.NETWORK, ErrorCode.TIMEOUT].includes(this.code);
  }

  /**
   * Serializa el error para logging.
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      cause: this.cause instanceof Error ? this.cause.message : this.cause,
    };
  }
}

/**
 * Type guard para verificar si algo es un AppError.
 */
export function isAppError(value: unknown): value is AppError {
  return value instanceof AppError;
}
