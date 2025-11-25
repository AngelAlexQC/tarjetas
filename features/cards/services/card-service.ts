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

/**
 * Caché sincrónico de tarjetas.
 * Se inicializa una vez y se usa para métodos síncronos legacy.
 */
let cachedCards: Card[] | null = null;

/**
 * Inicializa el caché de tarjetas.
 * Llamar antes de usar getCards() sincrónico si se necesitan datos frescos.
 */
export async function initializeCardCache(): Promise<Card[]> {
  const cards = await cardRepository$().getCards();
  cachedCards = cards;
  return cards;
}

class CardService {
  private get repository() {
    return cardRepository$();
  }

  private static _warnedGetCards = false;
  private static _isInitializing = false;

  /**
   * Obtiene las tarjetas de forma síncrona.
   * Usa caché local para compatibilidad con código legacy.
   * @deprecated Usar cardRepository$().getCards() para acceso async
   */
  getCards(): Card[] {
    // Inicializar caché en background si no existe
    if (!cachedCards && !CardService._isInitializing) {
      CardService._isInitializing = true;
      initializeCardCache()
        .then(() => { CardService._isInitializing = false; })
        .catch((err) => { 
          log.error('Error initializing card cache:', err);
          CardService._isInitializing = false;
        });
      
      // Retornar array vacío mientras carga
      if (!CardService._warnedGetCards) {
        CardService._warnedGetCards = true;
        log.warn(
          'getCards() es síncrono y puede no reflejar los datos más recientes. ' +
          'Usa cardRepository$().getCards() para acceso async.'
        );
      }
      return [];
    }
    
    return cachedCards || [];
  }

  /**
   * Obtiene las tarjetas de forma asíncrona.
   * Preferir este método sobre getCards() síncrono.
   */
  async getCardsAsync(): Promise<Card[]> {
    const cards = await this.repository.getCards();
    cachedCards = cards;
    return cards;
  }

  getCardById(id: string): Card | undefined {
    return this.getCards().find(c => c.id === id);
  }

  async getCardByIdAsync(id: string): Promise<Card | undefined> {
    return this.repository.getCardById(id);
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
