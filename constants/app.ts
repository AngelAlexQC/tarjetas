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

  /**
   * Tiempo de procesamiento simulado para operaciones sensibles (ms).
   */
  PROCESSING_DELAY: 2000,

  /**
   * Tiempo de expiración para códigos de seguridad dinámicos (segundos).
   * CVV dinámico expira después de este tiempo por seguridad.
   */
  DYNAMIC_CVV_EXPIRY_SECONDS: 300,
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
  TOUR_SEEN_TOOLTIPS: '@tour_seen_tooltips',
  TOUR_PAUSED: '@tour_paused',
} as const;
