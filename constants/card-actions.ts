import type { FinancialIconType } from '@/components/ui/financial-icons';

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
  icon: FinancialIconType;
  color: string;
  requiresAuth?: boolean;
}

export const CARD_ACTIONS: CardAction[] = [
  {
    id: 'block',
    title: 'Bloquear',
    description: 'Bloquea temporalmente tu tarjeta',
    icon: 'lock',
    color: '#F44336',
    requiresAuth: true,
  },
  {
    id: 'defer',
    title: 'Diferir',
    description: 'Difiere tus compras',
    icon: 'calendar',
    color: '#2196F3',
  },
  {
    id: 'statement',
    title: 'Estado de Cuenta',
    description: 'Ver movimientos y saldos',
    icon: 'chart',
    color: '#4CAF50',
  },
  {
    id: 'advances',
    title: 'Avances',
    description: 'Solicita un avance de efectivo',
    icon: 'money',
    color: '#FF9800',
    requiresAuth: true,
  },
  {
    id: 'limits',
    title: 'Cupos',
    description: 'Administra tus límites',
    icon: 'barChart',
    color: '#9C27B0',
  },
  {
    id: 'pin',
    title: 'PIN',
    description: 'Cambiar o recordar PIN',
    icon: 'pin',
    color: '#607D8B',
    requiresAuth: true,
  },
  {
    id: 'notifications',
    title: 'Notificaciones',
    description: 'Configurar alertas',
    icon: 'bell',
    color: '#00BCD4',
  },
];

export function getCardAction(actionId: CardActionType): CardAction | undefined {
  return CARD_ACTIONS.find(action => action.id === actionId);
}
