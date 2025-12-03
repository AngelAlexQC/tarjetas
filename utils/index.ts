/**
 * Utils Index
 *
 * Punto de entrada para todas las utilidades de la aplicación.
 */

// Result Pattern & Error Handling (nuevo sistema)
export {
    // App Error
    AppError,
    ErrorCode,
    // neverthrow re-exports
    Result,
    ResultAsync, err, errAsync,
    fromPromise,
    fromSafePromise,
    fromThrowable, isAppError, ok, okAsync
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
