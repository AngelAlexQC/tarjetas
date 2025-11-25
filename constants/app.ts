/**
 * Timing Constants
 * 
 * Valores de tiempo centralizados para consistencia en la app.
 */

export const TIMING = {
  /**
   * Tiempo de gracia después de autenticación biométrica exitosa (ms).
   * Evita re-solicitar autenticación si el usuario acaba de autenticarse.
   */
  BIOMETRIC_GRACE_PERIOD: 2000,

  /**
   * Delay antes de marcar la app como lista después de navegación inicial (ms).
   * Permite que las animaciones de entrada terminen.
   */
  APP_READY_DELAY_WITH_TENANT: 4500,
  APP_READY_DELAY_WITHOUT_TENANT: 4000,

  /**
   * Delay para animaciones de splash screen (ms).
   */
  SPLASH_ANIMATION_DURATION: 600,
  SPLASH_FADE_DURATION: 400,
};

/**
 * Layout Constants
 */
export const LAYOUT = {
  /**
   * Ancho máximo del contenido en pantallas grandes.
   */
  CONTENT_MAX_WIDTH: 600,

  /**
   * Proporción de tarjeta (ancho/alto).
   */
  CARD_ASPECT_RATIO: 0.63,

  /**
   * Porcentaje del ancho de pantalla para las tarjetas.
   */
  CARD_WIDTH_PERCENTAGE: 0.85,

  /**
   * Ancho máximo de tarjeta.
   */
  CARD_MAX_WIDTH: 400,
};

/**
 * Storage Keys
 */
export const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: '@onboarding_completed',
  TENANT_THEME: '@tenant_theme',
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  USERNAME_REMEMBERED: 'username_remembered',
} as const;
