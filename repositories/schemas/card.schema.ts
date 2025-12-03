/**
 * Card Schemas - Zod Validation
 * 
 * Esquemas de validación para datos de tarjetas.
 * Proveen validación en runtime y tipos TypeScript inferidos.
 */

import { z } from 'zod';

// ============================================
// ENUMS & PRIMITIVES
// ============================================

export const CardTypeSchema = z.enum(['credit', 'debit', 'virtual']);
export const CardBrandSchema = z.enum([
  'visa',
  'mastercard',
  'amex',
  'discover',
  'diners',
  'jcb',
  'maestro',
  'unionpay',
]);
export const CardStatusSchema = z.enum(['active', 'blocked', 'expired', 'pending']);
export const BlockTypeSchema = z.enum(['temporary', 'permanent']);
export const BlockReasonSchema = z.enum(['lost', 'stolen', 'damaged', 'fraud', 'temporary']);
export const TransactionTypeSchema = z.enum(['purchase', 'payment', 'transfer', 'fee']);
export const AccountTypeSchema = z.enum(['savings', 'checking']);

// ============================================
// CARD SCHEMA
// ============================================

export const CardSchema = z.object({
  id: z.string().min(1),
  cardNumber: z.string(),
  cardHolder: z.string().min(1),
  expiryDate: z.string().regex(/^\d{2}\/\d{2}$/, 'Format must be MM/YY'),
  balance: z.number(),
  cardType: CardTypeSchema,
  cardBrand: CardBrandSchema,
  status: CardStatusSchema,
  creditLimit: z.number().positive().optional(),
  availableCredit: z.number().optional(),
  lastTransactionDate: z.string().datetime().optional(),
});

export const CardArraySchema = z.array(CardSchema);

// ============================================
// ACTION RESULT
// ============================================

export const CardActionResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.unknown().optional(),
});

// ============================================
// BLOCK CARD
// ============================================

export const BlockCardRequestSchema = z.object({
  cardId: z.string().min(1),
  type: BlockTypeSchema,
  reason: BlockReasonSchema.optional(),
  comments: z.string().optional(),
});

// ============================================
// TRANSACTIONS
// ============================================

export const TransactionSchema = z.object({
  id: z.string().min(1),
  date: z.string(),
  description: z.string(),
  amount: z.number(),
  currency: z.string().length(3),
  category: z.string(),
  type: TransactionTypeSchema.optional(),
  canDefer: z.boolean().optional(),
});

export const TransactionArraySchema = z.array(TransactionSchema);

// ============================================
// DEFER PAYMENTS
// ============================================

export const DeferSimulationSchema = z.object({
  originalAmount: z.number().positive(),
  months: z.number().int().positive(),
  interestRate: z.number().min(0),
  monthlyFee: z.number().positive(),
  totalWithInterest: z.number().positive(),
  firstPaymentDate: z.string(),
});

export const DeferRequestSchema = z.object({
  cardId: z.string().min(1),
  transactionIds: z.array(z.string().min(1)).min(1),
  months: z.number().int().positive(),
});

// ============================================
// CASH ADVANCE
// ============================================

export const AccountSchema = z.object({
  id: z.string().min(1),
  type: AccountTypeSchema,
  number: z.string(),
  alias: z.string(),
  bankName: z.string(),
});

export const AccountArraySchema = z.array(AccountSchema);

export const CashAdvanceRequestSchema = z.object({
  cardId: z.string().min(1),
  amount: z.number().positive(),
  months: z.number().int().positive(),
  destinationAccountId: z.string().min(1),
});

// ============================================
// CARD LIMITS
// ============================================

export const CardLimitsSchema = z.object({
  dailyPurchase: z.number().min(0),
  dailyAtm: z.number().min(0),
  monthlyPurchase: z.number().min(0),
  onlinePurchase: z.number().min(0),
  internationalPurchase: z.number().min(0),
  maxDailyPurchase: z.number().positive().optional(),
  maxDailyAtm: z.number().positive().optional(),
  maxMonthlyPurchase: z.number().positive().optional(),
  maxOnlinePurchase: z.number().positive().optional(),
  maxInternationalPurchase: z.number().positive().optional(),
});

// ============================================
// PIN
// ============================================

export const ChangePinRequestSchema = z.object({
  cardId: z.string().min(1),
  currentPin: z.string().length(4).regex(/^\d{4}$/, 'PIN must be 4 digits'),
  newPin: z.string().length(4).regex(/^\d{4}$/, 'PIN must be 4 digits'),
  confirmPin: z.string().length(4).regex(/^\d{4}$/, 'PIN must be 4 digits'),
}).refine((data) => data.newPin === data.confirmPin, {
  message: "PINs don't match",
  path: ['confirmPin'],
});

// ============================================
// STATEMENT
// ============================================

export const StatementSchema = z.object({
  id: z.string().min(1),
  period: z.string(),
  dueDate: z.string(),
  minimumPayment: z.number().min(0),
  totalPayment: z.number().min(0),
  previousBalance: z.number(),
  payments: z.number(),
  purchases: z.number(),
  fees: z.number(),
  interest: z.number(),
  newBalance: z.number(),
  transactions: TransactionArraySchema,
  pdfUrl: z.string().url().optional(),
});

// ============================================
// TRAVEL NOTICE
// ============================================

export const TravelNoticeSchema = z.object({
  cardId: z.string().min(1),
  destinations: z.array(z.string().min(1)).min(1),
  startDate: z.string(),
  endDate: z.string(),
  contactPhone: z.string().optional(),
});

// ============================================
// REPLACE CARD
// ============================================

export const ReplaceCardRequestSchema = z.object({
  cardId: z.string().min(1),
  reason: z.enum(['damaged', 'lost', 'stolen', 'expired']),
  deliveryAddress: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    zipCode: z.string().min(1),
    country: z.string().min(1),
  }).optional(),
});

// ============================================
// SUBSCRIPTIONS
// ============================================

export const SubscriptionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  merchant: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().length(3),
  frequency: z.enum(['weekly', 'monthly', 'yearly']),
  nextBillingDate: z.string(),
  isActive: z.boolean(),
  category: z.string(),
  logoUrl: z.string().url().optional(),
});

export const SubscriptionArraySchema = z.array(SubscriptionSchema);

// ============================================
// REWARDS
// ============================================

export const RewardsSchema = z.object({
  totalPoints: z.number().min(0),
  pendingPoints: z.number().min(0),
  redeemedPoints: z.number().min(0),
  expiringPoints: z.number().min(0),
  expirationDate: z.string().optional(),
  tier: z.enum(['bronze', 'silver', 'gold', 'platinum']).optional(),
  nextTierPoints: z.number().positive().optional(),
});

// ============================================
// DYNAMIC CVV
// ============================================

export const DynamicCvvSchema = z.object({
  cvv: z.string().regex(/^\d{3,4}$/, 'CVV must be 3-4 digits'),
  expiresAt: z.string().datetime(),
  remainingSeconds: z.number().int().positive(),
});

// ============================================
// NOTIFICATIONS
// ============================================

export const NotificationSettingsSchema = z.object({
  purchases: z.boolean(),
  payments: z.boolean(),
  lowBalance: z.boolean(),
  security: z.boolean(),
  marketing: z.boolean(),
  threshold: z.number().min(0).optional(),
});

// ============================================
// OPERATION RESULT (for UI)
// ============================================

export const OperationResultSchema = z.object({
  success: z.boolean(),
  title: z.string(),
  message: z.string(),
  receiptId: z.string().optional(),
});

// ============================================
// INFERRED TYPES
// ============================================

export type CardType = z.infer<typeof CardTypeSchema>;
export type CardBrand = z.infer<typeof CardBrandSchema>;
export type CardStatus = z.infer<typeof CardStatusSchema>;
export type BlockType = z.infer<typeof BlockTypeSchema>;
export type BlockReason = z.infer<typeof BlockReasonSchema>;
export type TransactionType = z.infer<typeof TransactionTypeSchema>;
export type AccountType = z.infer<typeof AccountTypeSchema>;

export type Card = z.infer<typeof CardSchema>;
export type CardActionResult<T = unknown> = z.infer<typeof CardActionResultSchema> & { data?: T };
export type BlockCardRequest = z.infer<typeof BlockCardRequestSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type DeferSimulation = z.infer<typeof DeferSimulationSchema>;
export type DeferRequest = z.infer<typeof DeferRequestSchema>;
export type Account = z.infer<typeof AccountSchema>;
export type CashAdvanceRequest = z.infer<typeof CashAdvanceRequestSchema>;
export type CardLimits = z.infer<typeof CardLimitsSchema>;
export type ChangePinRequest = z.infer<typeof ChangePinRequestSchema>;
export type Statement = z.infer<typeof StatementSchema>;
export type TravelNotice = z.infer<typeof TravelNoticeSchema>;
export type ReplaceCardRequest = z.infer<typeof ReplaceCardRequestSchema>;
export type Subscription = z.infer<typeof SubscriptionSchema>;
export type Rewards = z.infer<typeof RewardsSchema>;
export type DynamicCvv = z.infer<typeof DynamicCvvSchema>;
export type NotificationSettings = z.infer<typeof NotificationSettingsSchema>;
export type OperationResult = z.infer<typeof OperationResultSchema>;
