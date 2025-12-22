import { ICardActionRepository } from '@/repositories/interfaces/card-action.repository.interface';
import { CardAction } from '@/repositories/schemas/card-action.schema';

const CARD_ACTIONS: CardAction[] = [
  {
    id: 'pay',
    title: 'Pagar Tarjeta',
    description: 'Paga tu tarjeta de crédito',
    icon: 'creditCard',
    color: '#4CAF50',
    requiresAuth: true,
  },
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
    id: 'subscriptions',
    title: 'Suscripciones',
    description: 'Gestionar suscripciones',
    icon: 'creditCard',
    color: '#00BCD4',
  },
  {
    id: 'cardless_atm',
    title: 'Retiro s/ Tarjeta',
    description: 'Retira dinero sin plástico',
    icon: 'qr',
    color: '#3F51B5',
    requiresAuth: true,
  },
  {
    id: 'travel',
    title: 'Aviso de Viaje',
    description: 'Notifica tus viajes',
    icon: 'plane',
    color: '#009688',
  },
  {
    id: 'channels',
    title: 'Canales',
    description: 'Configura canales de uso',
    icon: 'settings',
    color: '#795548',
  },
  {
    id: 'cvv',
    title: 'CVV Dinámico',
    description: 'Código de seguridad temporal',
    icon: 'eye',
    color: '#673AB7',
    requiresAuth: true,
  },
  {
    id: 'replace',
    title: 'Reposición',
    description: 'Solicita una nueva tarjeta',
    icon: 'refresh',
    color: '#FF5722',
  },
  {
    id: 'rewards',
    title: 'Puntos',
    description: 'Tus puntos acumulados',
    icon: 'gift',
    color: '#E91E63',
  },
];

export class MockCardActionRepository implements ICardActionRepository {
  async getActions(cardType: 'credit' | 'debit' | 'virtual'): Promise<CardAction[]> {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 300));

    let actions = [...CARD_ACTIONS];

    if (cardType === 'debit') {
      // Débito: no puede diferir, avances, pagar tarjeta, recompensas
      actions = actions.filter(action => 
        !['defer', 'advances', 'pay', 'rewards'].includes(action.id)
      );
    } else if (cardType === 'credit') {
        // Crédito: no retiro sin tarjeta (usualmente es avance)
         actions = actions.filter(action => 
        !['cardless_atm'].includes(action.id)
      );
    } else if (cardType === 'virtual') {
      // Virtual: no PIN, no reposición física, no retiro cajero (a menos que sea NFC), no viaje (no física)
       actions = actions.filter(action => 
        !['pin', 'replace', 'cardless_atm', 'travel'].includes(action.id)
      );
    }
    
    return actions;
  }
}
