/**
 * Real Card Repository
 * 
 * Implementación del repositorio de tarjetas que hace llamadas HTTP reales al backend.
 */

import { API_ENDPOINTS, httpClient } from '@/api';
import { ICardRepository } from '../interfaces';
import {
    Account,
    BlockCardRequest,
    Card,
    CardActionResult,
    CardLimits,
    CashAdvanceRequest,
    ChangePinRequest,
    DeferRequest,
    DeferSimulation,
    DynamicCvv,
    NotificationSettings,
    ReplaceCardRequest,
    Rewards,
    Statement,
    Subscription,
    Transaction,
    TravelNotice,
} from '../types';

export class RealCardRepository implements ICardRepository {
  
  async getCards(): Promise<Card[]> {
    const response = await httpClient.get<Card[]>(API_ENDPOINTS.CARDS.LIST);
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener tarjetas');
    }
    return response.data || [];
  }

  async getCardById(id: string): Promise<Card | undefined> {
    const response = await httpClient.get<Card>(API_ENDPOINTS.CARDS.GET(id));
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener tarjeta');
    }
    return response.data;
  }

  async blockCard(request: BlockCardRequest): Promise<CardActionResult> {
    const response = await httpClient.post<CardActionResult>(
      API_ENDPOINTS.CARDS.BLOCK(request.cardId),
      request
    );
    if (!response.success) {
      return {
        success: false,
        message: response.error || 'Error al bloquear tarjeta',
      };
    }
    return response.data || { success: true, message: 'Tarjeta bloqueada' };
  }

  async unblockCard(cardId: string): Promise<CardActionResult> {
    const response = await httpClient.post<CardActionResult>(
      API_ENDPOINTS.CARDS.UNBLOCK(cardId)
    );
    if (!response.success) {
      return {
        success: false,
        message: response.error || 'Error al desbloquear tarjeta',
      };
    }
    return response.data || { success: true, message: 'Tarjeta desbloqueada' };
  }

  async getDeferrableTransactions(cardId: string): Promise<Transaction[]> {
    const response = await httpClient.get<Transaction[]>(
      `${API_ENDPOINTS.CARDS.DEFER(cardId)}/transactions`
    );
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener transacciones');
    }
    return response.data || [];
  }

  async simulateDefer(cardId: string, amount: number, months: number): Promise<DeferSimulation> {
    const response = await httpClient.post<DeferSimulation>(
      `${API_ENDPOINTS.CARDS.DEFER(cardId)}/simulate`,
      { amount, months }
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error al simular diferimiento');
    }
    return response.data;
  }

  async deferPayment(request: DeferRequest): Promise<CardActionResult> {
    const response = await httpClient.post<CardActionResult>(
      API_ENDPOINTS.CARDS.DEFER(request.cardId),
      request
    );
    if (!response.success) {
      return {
        success: false,
        message: response.error || 'Error al diferir pago',
      };
    }
    return response.data || { success: true, message: 'Pago diferido exitosamente' };
  }

  async getAccounts(): Promise<Account[]> {
    const response = await httpClient.get<Account[]>('/accounts');
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener cuentas');
    }
    return response.data || [];
  }

  async requestAdvance(request: CashAdvanceRequest): Promise<CardActionResult> {
    const response = await httpClient.post<CardActionResult>(
      API_ENDPOINTS.CARDS.ADVANCE(request.cardId),
      request
    );
    if (!response.success) {
      return {
        success: false,
        message: response.error || 'Error al solicitar avance',
      };
    }
    return response.data || { success: true, message: 'Avance aprobado' };
  }

  async getLimits(cardId: string): Promise<CardLimits> {
    const response = await httpClient.get<CardLimits>(
      API_ENDPOINTS.CARDS.LIMITS(cardId)
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error al obtener límites');
    }
    return response.data;
  }

  async updateLimits(cardId: string, limits: Partial<CardLimits>): Promise<CardActionResult> {
    const response = await httpClient.put<CardActionResult>(
      API_ENDPOINTS.CARDS.LIMITS(cardId),
      limits
    );
    if (!response.success) {
      return {
        success: false,
        message: response.error || 'Error al actualizar límites',
      };
    }
    return response.data || { success: true, message: 'Límites actualizados' };
  }

  async changePin(request: ChangePinRequest): Promise<CardActionResult> {
    const response = await httpClient.post<CardActionResult>(
      API_ENDPOINTS.CARDS.CHANGE_PIN(request.cardId),
      request
    );
    if (!response.success) {
      return {
        success: false,
        message: response.error || 'Error al cambiar PIN',
      };
    }
    return response.data || { success: true, message: 'PIN cambiado exitosamente' };
  }

  async getStatement(cardId: string, month?: number, year?: number): Promise<Statement> {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    
    const url = `${API_ENDPOINTS.CARDS.STATEMENT(cardId)}${params.toString() ? `?${params}` : ''}`;
    const response = await httpClient.get<Statement>(url);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error al obtener estado de cuenta');
    }
    return response.data;
  }

  async createTravelNotice(notice: TravelNotice): Promise<CardActionResult> {
    const response = await httpClient.post<CardActionResult>(
      API_ENDPOINTS.CARDS.TRAVEL_NOTICE(notice.cardId),
      notice
    );
    if (!response.success) {
      return {
        success: false,
        message: response.error || 'Error al crear aviso de viaje',
      };
    }
    return response.data || { success: true, message: 'Aviso de viaje registrado' };
  }

  async requestReplacement(request: ReplaceCardRequest): Promise<CardActionResult> {
    const response = await httpClient.post<CardActionResult>(
      API_ENDPOINTS.CARDS.REPLACE(request.cardId),
      request
    );
    if (!response.success) {
      return {
        success: false,
        message: response.error || 'Error al solicitar reemplazo',
      };
    }
    return response.data || { success: true, message: 'Solicitud de reemplazo registrada' };
  }

  async getSubscriptions(cardId: string): Promise<Subscription[]> {
    const response = await httpClient.get<Subscription[]>(
      API_ENDPOINTS.CARDS.SUBSCRIPTIONS(cardId)
    );
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener suscripciones');
    }
    return response.data || [];
  }

  async toggleSubscription(cardId: string, subscriptionId: string): Promise<CardActionResult> {
    const response = await httpClient.post<CardActionResult>(
      `${API_ENDPOINTS.CARDS.SUBSCRIPTIONS(cardId)}/${subscriptionId}/toggle`
    );
    if (!response.success) {
      return {
        success: false,
        message: response.error || 'Error al modificar suscripción',
      };
    }
    return response.data || { success: true, message: 'Suscripción modificada' };
  }

  async getRewards(cardId: string): Promise<Rewards> {
    const response = await httpClient.get<Rewards>(
      API_ENDPOINTS.CARDS.REWARDS(cardId)
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error al obtener recompensas');
    }
    return response.data;
  }

  async generateDynamicCvv(cardId: string): Promise<DynamicCvv> {
    const response = await httpClient.post<DynamicCvv>(
      API_ENDPOINTS.CARDS.CVV(cardId)
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error al generar CVV');
    }
    return response.data;
  }

  async updateNotifications(cardId: string, settings: NotificationSettings): Promise<CardActionResult> {
    const response = await httpClient.put<CardActionResult>(
      `${API_ENDPOINTS.CARDS.GET(cardId)}/notifications`,
      settings
    );
    if (!response.success) {
      return {
        success: false,
        message: response.error || 'Error al actualizar notificaciones',
      };
    }
    return response.data || { success: true, message: 'Notificaciones actualizadas' };
  }
}
