/**
 * Card Service
 * 
 * Servicio de tarjetas que mantiene compatibilidad con el código existente
 * pero internamente usa el sistema de repositorios.
 * 
 * @deprecated Para nuevas funcionalidades, usa directamente:
 * - cardRepository$() de @/repositories
 * - useCards() hook de @/hooks/use-cards
 */

import { CardActionType } from '@/constants/card-actions';
import { Card, CardActionResult, cardRepository$, NotificationSettings } from '@/repositories';
import { loggers } from '@/utils/logger';

// Parámetros tipados para executeAction
interface ExecuteActionParams {
  amount?: number;
  months?: number;
  month?: number;
  year?: number;
  oldPin?: string;
  newPin?: string;
  settings?: NotificationSettings;
}

const log = loggers.cards;

// Re-exportar tipos para compatibilidad
export type { Card, CardActionResult } from '@/repositories';

class CardService {
  private get repository() {
    return cardRepository$();
  }

  private static _warnedGetCards = false;

  getCards(): Card[] {
    // Nota: Este método es síncrono por compatibilidad legacy
    // Internamente el repositorio usa datos cacheados en modo mock
    // Para modo real, usar el hook useCards o cardRepository$().getCards()
    if (!CardService._warnedGetCards) {
      CardService._warnedGetCards = true;
      log.warn(
        'getCards() is synchronous and may not reflect latest data. ' +
        'Consider using cardRepository$().getCards() for async access.'
      );
    }
    
    // Retornar datos mock directamente para compatibilidad
    const mockCards: Card[] = [
      {
        id: "1",
        cardNumber: "•••• •••• •••• 9010",
        cardHolder: "Juan Pérez",
        expiryDate: "12/27",
        balance: Math.floor(Math.random() * 5000) + 500,
        cardType: "credit",
        cardBrand: "visa",
        status: "active",
        creditLimit: 8000,
        availableCredit: 5000,
        lastTransactionDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "2",
        cardNumber: "•••• •••• •••• 3456",
        cardHolder: "María García",
        expiryDate: "08/28",
        balance: Math.floor(Math.random() * 5000) + 500,
        cardType: "debit",
        cardBrand: "mastercard",
        status: "active",
        lastTransactionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "3",
        cardNumber: "•••• •••••• •0005",
        cardHolder: "Ana Martínez",
        expiryDate: "06/29",
        balance: Math.floor(Math.random() * 5000) + 500,
        cardType: "virtual",
        cardBrand: "amex",
        status: "active",
        creditLimit: 6000,
        availableCredit: 4000,
        lastTransactionDate: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      },
      {
        id: "4",
        cardNumber: "•••• •••• •••• 6789",
        cardHolder: "Carlos López",
        expiryDate: "03/26",
        balance: Math.floor(Math.random() * 5000) + 500,
        cardType: "credit",
        cardBrand: "discover",
        status: "active",
        creditLimit: 7000,
        availableCredit: 5500,
        lastTransactionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    
    return mockCards;
  }

  getCardById(id: string): Card | undefined {
    return this.getCards().find(c => c.id === id);
  }

  async blockCard(cardId: string): Promise<CardActionResult> {
    return this.repository.blockCard({ cardId, type: 'temporary' });
  }

  async unblockCard(cardId: string): Promise<CardActionResult> {
    return this.repository.unblockCard(cardId);
  }

  async deferPayment(cardId: string, amount: number, months: number): Promise<CardActionResult> {
    return this.repository.deferPayment({ cardId, transactionIds: [], months });
  }

  async getStatement(cardId: string, month?: number, year?: number): Promise<CardActionResult> {
    try {
      const statement = await this.repository.getStatement(cardId, month, year);
      return {
        success: true,
        message: 'Estado de cuenta generado',
        data: statement,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error al obtener estado de cuenta',
      };
    }
  }

  async requestAdvance(cardId: string, amount: number): Promise<CardActionResult> {
    return this.repository.requestAdvance({ cardId, amount, months: 1, destinationAccountId: '' });
  }

  async getLimits(cardId: string): Promise<CardActionResult> {
    try {
      const limits = await this.repository.getLimits(cardId);
      return {
        success: true,
        message: 'Información de cupos',
        data: limits,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error al obtener límites',
      };
    }
  }

  async changePin(cardId: string, oldPin: string, newPin: string): Promise<CardActionResult> {
    return this.repository.changePin({ cardId, newPin, currentPin: oldPin });
  }

  async updateNotifications(
    cardId: string,
    settings: {
      transactionAlerts?: boolean;
      paymentReminders?: boolean;
      securityAlerts?: boolean;
    }
  ): Promise<CardActionResult> {
    return this.repository.updateNotifications(cardId, settings);
  }

  // Tipo extendido para acciones adicionales
  async executeAction(
    cardId: string,
    actionType: CardActionType | 'notifications',
    params?: ExecuteActionParams
  ): Promise<CardActionResult> {
    switch (actionType) {
      case 'block':
        return this.blockCard(cardId);
      case 'unblock':
        return this.unblockCard(cardId);
      case 'defer':
        return this.deferPayment(cardId, params?.amount ?? 0, params?.months ?? 3);
      case 'statement':
        return this.getStatement(cardId, params?.month, params?.year);
      case 'advances':
        return this.requestAdvance(cardId, params?.amount ?? 0);
      case 'limits':
        return this.getLimits(cardId);
      case 'pin':
        return this.changePin(cardId, params?.oldPin ?? '', params?.newPin ?? '');
      case 'notifications':
        if (!params?.settings) {
          return { success: false, message: 'Configuración de notificaciones requerida' };
        }
        return this.updateNotifications(cardId, params.settings);
      default:
        return {
          success: false,
          message: 'Acción no soportada',
        };
    }
  }
}

export const cardService = new CardService();
