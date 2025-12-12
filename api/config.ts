/**
 * API Configuration
 * 
 * Este archivo centraliza la configuración de la API.
 * 
 * Variables de entorno requeridas para producción:
 * - EXPO_PUBLIC_API_URL: URL base del backend
 * 
 * Variables de entorno opcionales para desarrollo:
 * - EXPO_PUBLIC_USE_MOCK: 'false' para desactivar mock en desarrollo
 * - EXPO_PUBLIC_API_URL_DEV: URL del backend en desarrollo
 */

export const API_CONFIG = {
  /**
   * Cuando es true, la app usa datos mock locales.
   * Cuando es false, la app hace llamadas HTTP reales al backend.
   * 
   * En desarrollo: usa mock por defecto (puede desactivarse con EXPO_PUBLIC_USE_MOCK=false)
   * En producción: SIEMPRE usa la API real (ignora la variable de entorno)
   */
  USE_MOCK_API: __DEV__ && process.env.EXPO_PUBLIC_USE_MOCK !== 'false',

  /**
   * URL base del backend
   * 
   * DESARROLLO: Usa HTTP localhost (solo para desarrollo local)
   * PRODUCCIÓN: DEBE usar HTTPS - la variable EXPO_PUBLIC_API_URL es obligatoria
   * 
   * SEGURIDAD: Nunca usar HTTP en producción (OWASP M5 - Insecure Communication)
   */
  BASE_URL: (() => {
    if (__DEV__) {
      // HTTP permitido solo en desarrollo local
      return process.env.EXPO_PUBLIC_API_URL_DEV || 'http://localhost:3000/api';
    }
    const prodUrl = process.env.EXPO_PUBLIC_API_URL;
    if (!prodUrl) {
      // En producción, la URL de la API es obligatoria
      throw new Error(
        'EXPO_PUBLIC_API_URL is required in production. ' +
        'Please set this environment variable before building.'
      );
    }
    // Validar que producción use HTTPS
    if (!prodUrl.startsWith('https://')) {
      throw new Error(
        'EXPO_PUBLIC_API_URL must use HTTPS in production for security.'
      );
    }
    return prodUrl;
  })(),

  /**
   * Timeout para las peticiones HTTP (en milisegundos)
   * 15 segundos es un balance entre UX móvil y conexiones lentas
   */
  TIMEOUT: 15000,

  /**
   * Headers por defecto para las peticiones
   */
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },

  /**
   * Retraso simulado para mock (ms) - útil para simular latencia de red
   * Valor bajo para desarrollo rápido, aumentar para probar estados de carga
   */
  MOCK_DELAY: 500,
};

/**
 * Endpoints de la API
 */
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh',
    ME: '/auth/me',
    // Registro
    REGISTER: '/auth/register',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    // Recuperación de contraseña
    FORGOT_PASSWORD: '/auth/forgot-password',
    VERIFY_RECOVERY_CODE: '/auth/verify-recovery-code',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // User
  USER: {
    PROFILE: '/user/profile',
    NOTIFICATIONS: '/user/notifications',
  },

  // Accounts
  ACCOUNTS: {
    LIST: '/accounts',
  },

  // Tenants
  TENANTS: {
    LIST: '/tenants',
    GET: (id: string) => `/tenants/${id}`,
    GET_BY_SLUG: (slug: string) => `/tenants/slug/${slug}`,
    SEARCH: '/tenants/search',
    CONFIG: (id: string) => `/tenants/${id}/config`,
    FEATURES: (id: string) => `/tenants/${id}/features`,
  },

  // Cards
  CARDS: {
    LIST: '/cards',
    GET: (id: string) => `/cards/${id}`,
    BLOCK: (id: string) => `/cards/${id}/block`,
    UNBLOCK: (id: string) => `/cards/${id}/unblock`,
    LIMITS: (id: string) => `/cards/${id}/limits`,
    CHANGE_PIN: (id: string) => `/cards/${id}/pin`,
    STATEMENT: (id: string) => `/cards/${id}/statement`,
    ADVANCE: (id: string) => `/cards/${id}/advance`,
    DEFER: (id: string) => `/cards/${id}/defer`,
    CVV: (id: string) => `/cards/${id}/cvv`,
    TRAVEL_NOTICE: (id: string) => `/cards/${id}/travel-notice`,
    REPLACE: (id: string) => `/cards/${id}/replace`,
    SUBSCRIPTIONS: (id: string) => `/cards/${id}/subscriptions`,
    REWARDS: (id: string) => `/cards/${id}/rewards`,
    NOTIFICATIONS: (id: string) => `/cards/${id}/notifications`,
  },
};
