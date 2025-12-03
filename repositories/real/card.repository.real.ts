/**
 * Real Card Repository
 * 
 * Implementación del repositorio de tarjetas que hace llamadas HTTP reales al backend.
 * Todas las respuestas son validadas con Zod para garantizar type-safety en runtime.
 */

import { API_ENDPOINTS } from '@/api/config';
import { httpClient } from '@/api/http-client';
import { parseApiData } from '@/utils/api-validation';
import { ICardRepository } from '../interfaces/card.repository.interface';
import type {
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
} from '../schemas/card.schema';
import {
  AccountArraySchema,
  CardActionResultSchema,
  CardArraySchema,
  CardLimitsSchema,
  CardSchema,
  DeferSimulationSchema,
  DynamicCvvSchema,
  RewardsSchema,
  StatementSchema,
  SubscriptionArraySchema,
  TransactionArraySchema,
} from '../schemas/card.schema';

/**
 * Helper para procesar respuestas de acciones (block, update, etc.)
 * Las acciones pueden fallar a nivel HTTP o a nivel de negocio.
 */
function processActionResponse(
  response: { success: boolean; data?: unknown; error?: string },
  fallbackMessage: string
): CardActionResult {
  if (!response.success) {
    return {
      success: false,
      message: response.error || fallbackMessage,
    };
  }
  
  // Si hay data, validarla; si no, usar mensaje de éxito
  if (response.data) {
    return parseApiData(CardActionResultSchema, response.data, 'resultado de acción');
  }
  
  return { success: true, message: fallbackMessage.replace('Error', 'Operación exitosa') };
}

export class RealCardRepository implements ICardRepository {
  
  async getCards(): Promise<Card[]> {
    const response = await httpClient.get<unknown>(API_ENDPOINTS.CARDS.LIST);
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener tarjetas');
    }
    return parseApiData(CardArraySchema, response.data, 'lista de tarjetas');
  }

  async getCardById(id: string): Promise<Card | undefined> {
    const response = await httpClient.get<unknown>(API_ENDPOINTS.CARDS.GET(id));
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener tarjeta');
    }
    if (!response.data) return undefined;
    return parseApiData(CardSchema, response.data, 'tarjeta');
  }

  async blockCard(request: BlockCardRequest): Promise<CardActionResult> {
    const response = await httpClient.post<unknown>(
      API_ENDPOINTS.CARDS.BLOCK(request.cardId),
      request
    );
    return processActionResponse(response, 'Error al bloquear tarjeta');
  }

  async unblockCard(cardId: string): Promise<CardActionResult> {
    const response = await httpClient.post<unknown>(
      API_ENDPOINTS.CARDS.UNBLOCK(cardId)
    );
    return processActionResponse(response, 'Error al desbloquear tarjeta');
  }

  async getDeferrableTransactions(cardId: string): Promise<Transaction[]> {
    const response = await httpClient.get<unknown>(
      `${API_ENDPOINTS.CARDS.DEFER(cardId)}/transactions`
    );
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener transacciones');
    }
    return parseApiData(TransactionArraySchema, response.data ?? [], 'transacciones diferibles');
  }

  async simulateDefer(cardId: string, amount: number, months: number): Promise<DeferSimulation> {
    const response = await httpClient.post<unknown>(
      `${API_ENDPOINTS.CARDS.DEFER(cardId)}/simulate`,
      { amount, months }
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error al simular diferimiento');
    }
    return parseApiData(DeferSimulationSchema, response.data, 'simulación de diferimiento');
  }

  async deferPayment(request: DeferRequest): Promise<CardActionResult> {
    const response = await httpClient.post<unknown>(
      API_ENDPOINTS.CARDS.DEFER(request.cardId),
      request
    );
    return processActionResponse(response, 'Error al diferir pago');
  }

  async getAccounts(): Promise<Account[]> {
    const response = await httpClient.get<unknown>('/accounts');
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener cuentas');
    }
    return parseApiData(AccountArraySchema, response.data ?? [], 'cuentas');
  }

  async requestAdvance(request: CashAdvanceRequest): Promise<CardActionResult> {
    const response = await httpClient.post<unknown>(
      API_ENDPOINTS.CARDS.ADVANCE(request.cardId),
      request
    );
    return processActionResponse(response, 'Error al solicitar avance');
  }

  async getLimits(cardId: string): Promise<CardLimits> {
    const response = await httpClient.get<unknown>(
      API_ENDPOINTS.CARDS.LIMITS(cardId)
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error al obtener límites');
    }
    return parseApiData(CardLimitsSchema, response.data, 'límites de tarjeta');
  }

  async updateLimits(cardId: string, limits: Partial<CardLimits>): Promise<CardActionResult> {
    const response = await httpClient.put<unknown>(
      API_ENDPOINTS.CARDS.LIMITS(cardId),
      limits
    );
    return processActionResponse(response, 'Error al actualizar límites');
  }

  async changePin(request: ChangePinRequest): Promise<CardActionResult> {
    const response = await httpClient.post<unknown>(
      API_ENDPOINTS.CARDS.CHANGE_PIN(request.cardId),
      request
    );
    return processActionResponse(response, 'Error al cambiar PIN');
  }

  async getStatement(cardId: string, month?: number, year?: number): Promise<Statement> {
    const params = new URLSearchParams();
    if (month) params.append('month', month.toString());
    if (year) params.append('year', year.toString());
    
    const url = `${API_ENDPOINTS.CARDS.STATEMENT(cardId)}${params.toString() ? `?${params}` : ''}`;
    const response = await httpClient.get<unknown>(url);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error al obtener estado de cuenta');
    }
    return parseApiData(StatementSchema, response.data, 'estado de cuenta');
  }

  async createTravelNotice(notice: TravelNotice): Promise<CardActionResult> {
    const response = await httpClient.post<unknown>(
      API_ENDPOINTS.CARDS.TRAVEL_NOTICE(notice.cardId),
      notice
    );
    return processActionResponse(response, 'Error al crear aviso de viaje');
  }

  async requestReplacement(request: ReplaceCardRequest): Promise<CardActionResult> {
    const response = await httpClient.post<unknown>(
      API_ENDPOINTS.CARDS.REPLACE(request.cardId),
      request
    );
    return processActionResponse(response, 'Error al solicitar reemplazo');
  }

  async getSubscriptions(cardId: string): Promise<Subscription[]> {
    const response = await httpClient.get<unknown>(
      API_ENDPOINTS.CARDS.SUBSCRIPTIONS(cardId)
    );
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener suscripciones');
    }
    return parseApiData(SubscriptionArraySchema, response.data ?? [], 'suscripciones');
  }

  async toggleSubscription(cardId: string, subscriptionId: string): Promise<CardActionResult> {
    const response = await httpClient.post<unknown>(
      `${API_ENDPOINTS.CARDS.SUBSCRIPTIONS(cardId)}/${subscriptionId}/toggle`
    );
    return processActionResponse(response, 'Error al modificar suscripción');
  }

  async getRewards(cardId: string): Promise<Rewards> {
    const response = await httpClient.get<unknown>(
      API_ENDPOINTS.CARDS.REWARDS(cardId)
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error al obtener recompensas');
    }
    return parseApiData(RewardsSchema, response.data, 'recompensas');
  }

  async generateDynamicCvv(cardId: string): Promise<DynamicCvv> {
    const response = await httpClient.post<unknown>(
      API_ENDPOINTS.CARDS.CVV(cardId)
    );
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Error al generar CVV');
    }
    return parseApiData(DynamicCvvSchema, response.data, 'CVV dinámico');
  }

  async updateNotifications(cardId: string, settings: NotificationSettings): Promise<CardActionResult> {
    const response = await httpClient.put<unknown>(
      `${API_ENDPOINTS.CARDS.GET(cardId)}/notifications`,
      settings
    );
    return processActionResponse(response, 'Error al actualizar notificaciones');
  }
}
