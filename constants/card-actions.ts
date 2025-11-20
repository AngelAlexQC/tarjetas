/**
 * Tipos para acciones de tarjetas
 */

export type CardActionType =
  | 'block'
  | 'unblock'
  | 'defer'
  | 'statement'
  | 'advances'
  | 'limits'
  | 'pin'
  | 'notifications';

export interface CardAction {
  id: CardActionType;
  title: string;
  description: string;
  icon: string;
  color: string;
  requiresAuth?: boolean;
}

export const CARD_ACTIONS: CardAction[] = [
  {
    id: 'block',
    title: 'Bloquear',
    description: 'Bloquea temporalmente tu tarjeta',
    icon: '🔒',
    color: '#F44336',
    requiresAuth: true,
  },
  {
    id: 'defer',
    title: 'Diferir',
    description: 'Difiere tus compras',
    icon: '📅',
    color: '#2196F3',
  },
  {
    id: 'statement',
    title: 'Estado de Cuenta',
    description: 'Ver movimientos y saldos',
    icon: '📊',
    color: '#4CAF50',
  },
  {
    id: 'advances',
    title: 'Avances',
    description: 'Solicita un avance de efectivo',
    icon: '💰',
    color: '#FF9800',
    requiresAuth: true,
  },
  {
    id: 'limits',
    title: 'Cupos',
    description: 'Administra tus límites',
    icon: '📈',
    color: '#9C27B0',
  },
  {
    id: 'pin',
    title: 'PIN',
    description: 'Cambiar o recordar PIN',
    icon: '🔢',
    color: '#607D8B',
    requiresAuth: true,
  },
  {
    id: 'notifications',
    title: 'Notificaciones',
    description: 'Configurar alertas',
    icon: '🔔',
    color: '#00BCD4',
  },
];

export function getCardAction(actionId: CardActionType): CardAction | undefined {
  return CARD_ACTIONS.find(action => action.id === actionId);
}
