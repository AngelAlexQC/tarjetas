/**
 * Card Types
 * 
 * Tipos centralizados para el módulo de tarjetas
 */

// Tipo de tarjeta
export type CardType = 'credit' | 'debit' | 'virtual';

// Marca de tarjeta
export type CardBrand = 
  | 'visa' 
  | 'mastercard' 
  | 'amex' 
  | 'discover' 
  | 'diners' 
  | 'jcb' 
  | 'maestro' 
  | 'unionpay';

// Estado de la tarjeta
export type CardStatus = 'active' | 'blocked' | 'expired' | 'pending';

// Modelo de Tarjeta
export interface Card {
  id: string;
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  balance: number;
  cardType: CardType;
  cardBrand: CardBrand;
  status: CardStatus;
  creditLimit?: number;
  availableCredit?: number;
  lastTransactionDate?: string;
}

// Resultado de acción genérico
export interface CardActionResult<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

// --- Block Card ---
export type BlockReason = 'lost' | 'stolen' | 'damaged' | 'fraud' | 'temporary';
export type BlockType = 'temporary' | 'permanent';

export interface BlockCardRequest {
  cardId: string;
  type: BlockType;
  reason?: BlockReason;
  comments?: string;
}

// --- Transactions ---
export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  type?: 'purchase' | 'payment' | 'transfer' | 'fee';
  canDefer?: boolean;
}

// --- Defer Payments ---
export interface DeferSimulation {
  originalAmount: number;
  months: number;
  interestRate: number;
  monthlyFee: number;
  totalWithInterest: number;
  firstPaymentDate: string;
}

export interface DeferRequest {
  cardId: string;
  transactionIds: string[];
  months: number;
}

// --- Cash Advance ---
export interface Account {
  id: string;
  type: 'savings' | 'checking';
  number: string;
  alias: string;
  bankName: string;
}

export interface CashAdvanceRequest {
  cardId: string;
  amount: number;
  months: number;
  destinationAccountId: string;
}

export interface CashAdvanceResult {
  fee: string;
  total: string;
  transactionId: string;
}

// --- Limits ---
export interface CardLimits {
  dailyAtm: number;
  dailyPos: number;
  dailyOnline: number;
  monthlyTotal: number;
  perTransaction: number;
  creditLimit?: number;
  availableCredit?: number;
  cashAdvanceLimit?: number;
  availableCashAdvance?: number;
}

export interface UpdateLimitsRequest {
  cardId: string;
  limits: Partial<CardLimits>;
}

// --- PIN ---
export interface ChangePinRequest {
  cardId: string;
  newPin: string;
  currentPin?: string;
}

// --- Statement ---
export interface StatementTransaction {
  date: string;
  description: string;
  amount: number;
}

export interface Statement {
  transactions: StatementTransaction[];
  totalSpent: number;
  minPayment: number;
  dueDate: string;
  periodStart: string;
  periodEnd: string;
}

// --- Travel Notice ---
export interface TravelNotice {
  destination: string;
  startDate: string;
  endDate: string;
  cardId: string;
}

// --- Replace Card ---
export type ReplaceReason = 'damaged' | 'lost' | 'stolen';

export interface ReplaceCardRequest {
  cardId: string;
  reason: ReplaceReason;
  deliveryAddress?: string;
}

// --- Subscriptions ---
export interface Subscription {
  id: string;
  name: string;
  plan: string;
  amount: number;
  currency: string;
  nextBilling: string;
  status: 'active' | 'paused';
  category: 'entertainment' | 'software' | 'shopping';
  merchantLogo?: string;
}

// --- Rewards ---
export interface RewardHistory {
  id: number;
  description: string;
  points: number;
  date: string;
}

export interface Rewards {
  totalPoints: number;
  history: RewardHistory[];
}

// --- CVV ---
export interface DynamicCvv {
  cvv: string;
  expiresIn: number; // segundos
}

// --- Notifications ---
export interface NotificationSettings {
  transactionAlerts?: boolean;
  paymentReminders?: boolean;
  securityAlerts?: boolean;
}
