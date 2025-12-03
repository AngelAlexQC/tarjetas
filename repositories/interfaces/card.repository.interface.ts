/**
 * Card Repository Interface
 * 
 * Contrato que define todas las operaciones disponibles para tarjetas.
 * Tanto el MockCardRepository como el RealCardRepository deben implementar esta interfaz.
 */

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
} from '../types/card.types';

export interface ICardRepository {
  // Obtener tarjetas
  getCards(): Promise<Card[]>;
  getCardById(id: string): Promise<Card | undefined>;

  // Bloqueo/Desbloqueo
  blockCard(request: BlockCardRequest): Promise<CardActionResult>;
  unblockCard(cardId: string): Promise<CardActionResult>;

  // Diferir pagos
  getDeferrableTransactions(cardId: string): Promise<Transaction[]>;
  simulateDefer(cardId: string, amount: number, months: number): Promise<DeferSimulation>;
  deferPayment(request: DeferRequest): Promise<CardActionResult>;

  // Avance de efectivo
  getAccounts(): Promise<Account[]>;
  requestAdvance(request: CashAdvanceRequest): Promise<CardActionResult>;

  // Límites
  getLimits(cardId: string): Promise<CardLimits>;
  updateLimits(cardId: string, limits: Partial<CardLimits>): Promise<CardActionResult>;

  // PIN
  changePin(request: ChangePinRequest): Promise<CardActionResult>;

  // Estado de cuenta
  getStatement(cardId: string, month?: number, year?: number): Promise<Statement>;

  // Aviso de viaje
  createTravelNotice(notice: TravelNotice): Promise<CardActionResult>;

  // Reemplazo de tarjeta
  requestReplacement(request: ReplaceCardRequest): Promise<CardActionResult>;

  // Suscripciones
  getSubscriptions(cardId: string): Promise<Subscription[]>;
  toggleSubscription(cardId: string, subscriptionId: string): Promise<CardActionResult>;

  // Recompensas
  getRewards(cardId: string): Promise<Rewards>;

  // CVV Dinámico
  generateDynamicCvv(cardId: string): Promise<DynamicCvv>;

  // Notificaciones
  updateNotifications(cardId: string, settings: NotificationSettings): Promise<CardActionResult>;
}
