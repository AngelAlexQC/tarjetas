/**
 * Utils Index
 *
 * Punto de entrada para utilidades comunes.
 * Nota: Muchas utilidades se importan directamente para mejor tree-shaking.
 */

// Logger
export { loggers } from '@/core/logging';

// Validators
export * from '@/country/common/validators';

// API Validation
export * from './api-validation';

// Platform utilities
export * from './platform-alert';

// Formatters (re-export from core)
export * from '@/core/formatters';

