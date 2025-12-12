/**
 * Constants Index
 * 
 * Barrel exports para constantes comunes de la aplicación.
 * Nota: Muchas constantes se importan directamente desde sus archivos
 * para mejor tree-shaking y claridad de dependencias.
 */

// Design system - colores más usados
export { BrandColors, FeedbackColors } from './design-tokens';

// Security constants
export {
  AUTH_CONFIG,
  RATE_LIMIT_CONFIG,
  VALIDATION_PATTERNS,
  SANITIZED_ERROR_MESSAGES,
  SENSITIVE_FIELDS,
} from './security';

// Layout constants
export {
  BREAKPOINTS,
  HORIZONTAL_PADDING,
  CONTENT_MAX_WIDTH,
  NUMBER_THRESHOLDS,
  NUMBER_SUFFIXES,
  DATE_THRESHOLDS,
} from './layout';

