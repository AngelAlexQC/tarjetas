/**
 * API Configuration
 * 
 * Este archivo centraliza la configuración de la API.
 * Cambia USE_MOCK_API a false cuando quieras usar el backend real.
 * 
 * Variables de entorno requeridas para producción:
 * - EXPO_PUBLIC_API_URL: URL base del backend
 */

export const API_CONFIG = {
  /**
   * Cuando es true, la app usa datos mock locales.
   * Cuando es false, la app hace llamadas HTTP reales al backend.
   */
  USE_MOCK_API: true,

  /**
   * URL base del backend
   * En desarrollo usa localhost, en producción usa variable de entorno
   */
  BASE_URL: __DEV__ 
    ? (process.env.EXPO_PUBLIC_API_URL_DEV || 'http://localhost:3000/api')
    : (process.env.EXPO_PUBLIC_API_URL || ''),

  /**
   * Timeout para las peticiones HTTP (en milisegundos)
   */
  TIMEOUT: 30000,

  /**
   * Headers por defecto para las peticiones
   */
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },

  /**
   * Retraso simulado para mock (ms) - útil para simular latencia de red
   */
  MOCK_DELAY: 800,
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
  },

  // User
  USER: {
    PROFILE: '/user/profile',
    NOTIFICATIONS: '/user/notifications',
  },
};
