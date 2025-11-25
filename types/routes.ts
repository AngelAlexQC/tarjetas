/**
 * Route Types
 * 
 * Tipos para las rutas de la aplicación con Expo Router.
 * Esto permite navegación tipada sin usar `as any`.
 */

import { Href } from 'expo-router';

// Acciones de tarjeta disponibles como rutas
export type CardActionRoute = 
  | 'block'
  | 'defer'
  | 'statements'
  | 'advance'
  | 'limits'
  | 'pin'
  | 'subscriptions'
  | 'pay'
  | 'cardless-atm'
  | 'travel'
  | 'channels'
  | 'cvv'
  | 'replace'
  | 'rewards';

/**
 * Helper para construir rutas de tarjeta tipadas
 */
export function cardRoute(cardId: string, action: CardActionRoute): Href {
  return `/cards/${cardId}/${action}` as Href;
}

/**
 * Helper para ruta principal
 */
export function homeRoute(): Href {
  return '/' as Href;
}
