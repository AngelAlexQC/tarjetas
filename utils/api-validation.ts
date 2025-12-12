/**
 * API Response Validation Utilities
 *
 * Utilidades para validar respuestas de la API usando Zod + neverthrow.
 * Garantiza type-safety en runtime para datos del backend.
 *
 * IMPORTANTE: Este módulo usa el patrón Result de neverthrow.
 * Los errores son valores explícitos, no excepciones.
 */

import { z } from 'zod';
import { loggers } from './logger';
import { AppError, err, ok, Result } from './result';

const log = loggers.api;

/**
 * Campos sensibles que no deben aparecer en logs
 */
const SENSITIVE_FIELDS = ['password', 'token', 'refreshToken', 'secret', 'apiKey', 'authorization', 'creditCard', 'cvv', 'pin'];

/**
 * Sanitiza datos para logging, ocultando campos sensibles
 */
function sanitizeForLogging(data: unknown): unknown {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;
  
  if (Array.isArray(data)) {
    return data.map(sanitizeForLogging);
  }
  
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (SENSITIVE_FIELDS.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeForLogging(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Valida datos de la API contra un schema Zod.
 * Retorna un Result<T, AppError> que debe ser manejado explícitamente.
 *
 * @param schema - Schema Zod para validar
 * @param data - Datos a validar
 * @param context - Contexto para mensajes de error (ej: "tarjetas", "usuario")
 * @returns Result con datos tipados o AppError
 *
 * @example
 * const result = validateApiData(CardArraySchema, response.data, 'tarjetas');
 *
 * // Opción 1: match para manejar ambos casos
 * result.match(
 *   cards => console.log('Cards:', cards),
 *   error => console.error('Error:', error.message)
 * );
 *
 * // Opción 2: isOk/isErr para condicionales
 * if (result.isOk()) {
 *   return result.value; // Card[]
 * }
 *
 * // Opción 3: unwrapOr para valor por defecto
 * const cards = result.unwrapOr([]);
 */
export function validateApiData<T>(
  schema: z.ZodType<T>,
  data: unknown,
  context: string
): Result<T, AppError> {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errorDetails = result.error.issues.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
      code: e.code,
    }));

    log.error(`Validation failed for ${context}:`, errorDetails);

    // En dev, loguear los datos recibidos para debug (sanitizados)
    if (__DEV__) {
      log.debug(`Received data for ${context}:`, sanitizeForLogging(data));
    }

    return err(AppError.validation(`Datos inválidos del servidor (${context})`));
  }

  return ok(result.data);
}

/**
 * Valida y retorna datos, lanzando excepción si falla.
 *
 * ⚠️ NOTA: Esta función existe para compatibilidad.
 * Preferir validateApiData() que retorna Result.
 *
 * @param schema - Schema Zod para validar
 * @param data - Datos a validar
 * @param context - Contexto para mensajes de error
 * @returns Datos validados y tipados
 * @throws AppError si la validación falla
 */
export function parseApiData<T>(schema: z.ZodType<T>, data: unknown, context: string): T {
  const result = validateApiData(schema, data, context);

  if (result.isErr()) {
    throw result.error;
  }

  return result.value;
}

/**
 * Valida datos opcionales (puede ser undefined/null).
 * Retorna Result<T | undefined, AppError>.
 *
 * @param schema - Schema Zod para validar
 * @param data - Datos a validar (puede ser undefined)
 * @param context - Contexto para mensajes de error
 * @returns Result con datos validados o undefined
 */
export function validateOptionalApiData<T>(
  schema: z.ZodType<T>,
  data: unknown,
  context: string
): Result<T | undefined, AppError> {
  if (data === undefined || data === null) {
    return ok(undefined);
  }

  return validateApiData(schema, data, context);
}

/**
 * Crea un validador reutilizable para un schema específico.
 * Útil cuando validas el mismo tipo muchas veces.
 *
 * @param schema - Schema Zod
 * @param context - Contexto para mensajes de error
 * @returns Función validadora que retorna Result
 *
 * @example
 * const validateCards = createApiValidator(CardArraySchema, 'tarjetas');
 * const result = validateCards(response.data);
 */
export function createApiValidator<T>(
  schema: z.ZodType<T>,
  context: string
): (data: unknown) => Result<T, AppError> {
  return (data: unknown) => validateApiData(schema, data, context);
}
