/**
 * Route Types
 * 
 * Tipos para las rutas de la aplicación con Expo Router.
 * Esto permite navegación tipada sin usar `as any`.
 */

import type { CardActionType } from '@/repositories/schemas/card-action.schema';
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
 * Mapeo de CardActionType a CardActionRoute
 * Algunos nombres difieren entre la acción y la ruta
 */
const ACTION_TO_ROUTE: Record<CardActionType, CardActionRoute> = {
  block: 'block',
  unblock: 'block', // unblock usa la misma ruta que block
  defer: 'defer',
  statement: 'statements',
  advances: 'advance',
  limits: 'limits',
  pin: 'pin',
  subscriptions: 'subscriptions',
  pay: 'pay',
  cardless_atm: 'cardless-atm',
  travel: 'travel',
  channels: 'channels',
  cvv: 'cvv',
  replace: 'replace',
  rewards: 'rewards',
};

/**
 * Helper para construir rutas desde CardActionType
 * Convierte automáticamente nombres de acción a rutas
 */
export function cardActionRoute(cardId: string, actionType: CardActionType): Href {
  const route = ACTION_TO_ROUTE[actionType];
  return `/cards/${cardId}/${route}` as Href;
}

/**
 * Helper para ruta principal
 */
export function homeRoute(): Href {
  return '/' as Href;
}
