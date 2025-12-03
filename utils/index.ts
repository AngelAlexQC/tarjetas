/**
 * Utils Index
 *
 * Punto de entrada para todas las utilidades de la aplicación.
 */

// Result Pattern & Error Handling
export {
    AppError,
    ErrorCode,
    Result,
    err,
    isAppError,
    ok
} from './result';

// API Validation
export {
    createApiValidator,
    parseApiData,
    validateApiData,
    validateOptionalApiData
} from './api-validation';

// Auth Storage
export { authStorage } from './auth-storage';

// Logger
export { createLogger, logger, loggers } from './logger';

// Formatters
export * from './formatters';

// Image utilities
export { getLogoHtmlForPdf } from './image-to-base64';

// Receipt HTML
export { generateReceiptHtml } from './receipt-html';
