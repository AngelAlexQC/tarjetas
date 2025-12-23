/**
 * Layout Constants
 *
 * Constantes de diseño responsivo centralizadas.
 * Evita magic numbers en el código.
 */

/**
 * Breakpoints de ancho de pantalla (en pixels)
 */
export const BREAKPOINTS = {
  /** Pantallas pequeñas (phones pequeños) */
  SMALL: 360,

  /** Pantallas medianas (phones estándar) */
  MEDIUM: 768,

  /** Pantallas grandes (tablets, desktop) */
  LARGE: 1024,

  /** Pantallas extra grandes */
  XLARGE: 1280,
} as const;

/**
 * Espaciado horizontal por tamaño de pantalla
 */
export const HORIZONTAL_PADDING = {
  /** Pantallas pequeñas */
  SMALL: 12,

  /** Pantallas medianas */
  MEDIUM: 16,

  /** Pantallas grandes portrait */
  LARGE: 24,

  /** Pantallas landscape */
  LANDSCAPE: 32,
} as const;

/**
 * Anchos máximos de contenido
 */
export const CONTENT_MAX_WIDTH = {
  /** Contenido principal en pantallas grandes */
  MAIN: 1024,

  /** Diálogos y modales */
  MODAL: 480,

  /** Formularios */
  FORM: 400,
} as const;

/**
 * Valores numéricos compactos para formateo
 */
export const NUMBER_THRESHOLDS = {
  THOUSAND: 1_000,
  MILLION: 1_000_000,
  BILLION: 1_000_000_000,
  TRILLION: 1_000_000_000_000,
} as const;

/**
 * Sufijos para números compactos
 */
export const NUMBER_SUFFIXES = {
  THOUSAND: 'K',
  MILLION: 'M',
  BILLION: 'B',
  TRILLION: 'T',
} as const;

/**
 * Umbrales de fechas para mensajes relativos
 */
export const DATE_THRESHOLDS = {
  /** Días para considerar "pronto" */
  SOON_DAYS: 7,

  /** Días para considerar "próximo" */
  UPCOMING_DAYS: 14,

  /** Días para mostrar fecha absoluta */
  ABSOLUTE_THRESHOLD_DAYS: 30,
} as const;
