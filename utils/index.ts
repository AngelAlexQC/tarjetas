/**
 * Utils Index
 *
 * Punto de entrada para todas las utilidades de la aplicación.
 */

// Result Pattern & Error Handling (nuevo sistema)
export {
  // neverthrow re-exports
  Result,
  ResultAsync,
  ok,
  err,
  okAsync,
  errAsync,
  fromPromise,
  fromSafePromise,
  fromThrowable,
  // App Error
  AppError,
  ErrorCode,
  isAppError,
} from './result';

// API Validation
export { parseApiData, validateApiData } from './api-validation';

// Auth Storage
export { authStorage } from './auth-storage';

// Logger
export { createLogger, logger, loggers } from './logger';

// Formatters
export * from './formatters';

// Image utilities
export { convertImageToBase64 } from './image-to-base64';

// Receipt HTML
export { generateReceiptHtml } from './receipt-html';
