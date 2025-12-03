/**
 * API Response Validation Utilities
 * 
 * Utilidades para validar respuestas de la API usando Zod.
 * Garantiza type-safety en runtime para datos del backend.
 */

import { z } from 'zod';
import { AppError, ErrorCode } from './errors';
import { loggers } from './logger';

const log = loggers.api;

/**
 * Resultado de una validación de API
 */
export type ValidationResult<T> = 
  | { success: true; data: T }
  | { success: false; error: AppError };

/**
 * Valida datos de la API contra un schema Zod.
 * Usa safeParse para no lanzar excepciones.
 * 
 * @param schema - Schema Zod para validar
 * @param data - Datos a validar
 * @param context - Contexto para mensajes de error (ej: "tarjetas", "usuario")
 * @returns Resultado de validación con datos tipados o error
 * 
 * @example
 * const result = validateApiData(CardArraySchema, response.data, 'tarjetas');
 * if (!result.success) {
 *   throw result.error;
 * }
 * return result.data; // Card[] tipado y validado
 */
export function validateApiData<T>(
  schema: z.ZodType<T>,
  data: unknown,
  context: string
): ValidationResult<T> {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    // Zod v4 usa .issues directamente en el error
    const errorDetails = result.error.issues.map((e: z.core.$ZodIssue) => ({
      path: e.path.join('.'),
      message: e.message,
      code: e.code,
    }));
    
    log.error(`Validation failed for ${context}:`, errorDetails);
    
    return {
      success: false,
      error: new AppError(
        ErrorCode.VALIDATION_ERROR,
        `Datos inválidos recibidos del servidor (${context})`,
        {
          details: { 
            context, 
            errors: errorDetails,
            receivedData: __DEV__ ? data : undefined, // Solo en dev para debug
          },
        }
      ),
    };
  }
  
  return { success: true, data: result.data };
}

/**
 * Valida y retorna datos, lanzando excepción si falla.
 * Versión simplificada para casos donde quieres throw directo.
 * 
 * @param schema - Schema Zod para validar
 * @param data - Datos a validar
 * @param context - Contexto para mensajes de error
 * @returns Datos validados y tipados
 * @throws AppError si la validación falla
 * 
 * @example
 * const cards = parseApiData(CardArraySchema, response.data, 'tarjetas');
 * // cards es Card[] validado, o lanza AppError
 */
export function parseApiData<T>(
  schema: z.ZodType<T>,
  data: unknown,
  context: string
): T {
  const result = validateApiData(schema, data, context);
  
  if (!result.success) {
    throw result.error;
  }
  
  return result.data;
}

/**
 * Valida datos opcionales (puede ser undefined/null).
 * Útil para respuestas que pueden no tener data.
 * 
 * @param schema - Schema Zod para validar
 * @param data - Datos a validar (puede ser undefined)
 * @param context - Contexto para mensajes de error
 * @returns Datos validados o undefined
 */
export function parseOptionalApiData<T>(
  schema: z.ZodType<T>,
  data: unknown,
  context: string
): T | undefined {
  if (data === undefined || data === null) {
    return undefined;
  }
  
  return parseApiData(schema, data, context);
}

/**
 * Crea un parser reutilizable para un schema específico.
 * Útil cuando validas el mismo tipo muchas veces.
 * 
 * @param schema - Schema Zod
 * @param context - Contexto para mensajes de error
 * @returns Función parser tipada
 * 
 * @example
 * const parseCards = createApiParser(CardArraySchema, 'tarjetas');
 * const cards = parseCards(response.data);
 */
export function createApiParser<T>(
  schema: z.ZodType<T>,
  context: string
): (data: unknown) => T {
  return (data: unknown) => parseApiData(schema, data, context);
}
