/**
 * Card Schemas - Zod Validation
 * 
 * Esquemas de validación para datos de tarjetas.
 * Proveen validación en runtime y tipos TypeScript inferidos.
 * 
 * IMPORTANTE: Este es el único lugar donde se definen los tipos de tarjetas.
 * NO crear tipos duplicados en otro lugar.
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
export const SubscriptionStatusSchema = z.enum(['active', 'paused', 'cancelled']);
export const SubscriptionCategorySchema = z.enum(['entertainment', 'software', 'shopping', 'utilities', 'other']);
export const RewardTierSchema = z.enum(['bronze', 'silver', 'gold', 'platinum']);
export const ReplaceReasonSchema = z.enum(['damaged', 'lost', 'stolen', 'expired']);

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
  dailyOnline: z.number().min(0),
  monthlyPurchase: z.number().min(0),
  onlinePurchase: z.number().min(0),
  internationalPurchase: z.number().min(0),
  perTransaction: z.number().min(0).optional(),
  // Max limits (for UI sliders)
  maxDailyPurchase: z.number().positive().optional(),
  maxDailyAtm: z.number().positive().optional(),
  maxDailyOnline: z.number().positive().optional(),
  maxMonthlyPurchase: z.number().positive().optional(),
  maxOnlinePurchase: z.number().positive().optional(),
  maxInternationalPurchase: z.number().positive().optional(),
  // Credit specific
  creditLimit: z.number().positive().optional(),
  availableCredit: z.number().optional(),
  cashAdvanceLimit: z.number().positive().optional(),
  availableCashAdvance: z.number().optional(),
});

// ============================================
// PIN
// ============================================

export const ChangePinRequestSchema = z.object({
  cardId: z.string().min(1),
  currentPin: z.string().length(4).regex(/^\d{4}$/, 'PIN must be 4 digits').optional(),
  newPin: z.string().length(4).regex(/^\d{4}$/, 'PIN must be 4 digits'),
  confirmPin: z.string().length(4).regex(/^\d{4}$/, 'PIN must be 4 digits').optional(),
}).refine((data) => !data.confirmPin || data.newPin === data.confirmPin, {
  message: "PINs don't match",
  path: ['confirmPin'],
});

// ============================================
// STATEMENT
// ============================================

export const StatementTransactionSchema = z.object({
  date: z.string(),
  description: z.string(),
  amount: z.number(),
});

export const StatementSchema = z.object({
  id: z.string().min(1).optional(),
  period: z.string().optional(),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
  dueDate: z.string(),
  minimumPayment: z.number().min(0).optional(),
  minPayment: z.number().min(0).optional(),
  totalPayment: z.number().min(0).optional(),
  totalSpent: z.number().optional(),
  previousBalance: z.number().optional(),
  payments: z.number().optional(),
  purchases: z.number().optional(),
  fees: z.number().optional(),
  interest: z.number().optional(),
  newBalance: z.number().optional(),
  transactions: z.array(StatementTransactionSchema).or(TransactionArraySchema),
  pdfUrl: z.string().url().optional(),
});

// ============================================
// TRAVEL NOTICE
// ============================================

export const TravelNoticeSchema = z.object({
  cardId: z.string().min(1),
  destination: z.string().min(1).optional(),
  destinations: z.array(z.string().min(1)).min(1).optional(),
  startDate: z.string(),
  endDate: z.string(),
  contactPhone: z.string().optional(),
});

// ============================================
// REPLACE CARD
// ============================================

export const ReplaceCardRequestSchema = z.object({
  cardId: z.string().min(1),
  reason: ReplaceReasonSchema,
  deliveryAddress: z.union([
    z.string(),
    z.object({
      street: z.string().min(1),
      city: z.string().min(1),
      state: z.string().min(1),
      zipCode: z.string().min(1),
      country: z.string().min(1),
    }),
  ]).optional(),
});

// ============================================
// SUBSCRIPTIONS
// ============================================

export const SubscriptionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  merchant: z.string().min(1).optional(),
  plan: z.string().optional(),
  amount: z.number().positive(),
  currency: z.string(),
  frequency: z.enum(['weekly', 'monthly', 'yearly']).optional(),
  nextBillingDate: z.string().optional(),
  nextBilling: z.string().optional(),
  isActive: z.boolean().optional(),
  status: SubscriptionStatusSchema.optional(),
  category: SubscriptionCategorySchema,
  logoUrl: z.string().url().optional(),
  merchantLogo: z.string().optional(),
});

export const SubscriptionArraySchema = z.array(SubscriptionSchema);

// ============================================
// REWARDS
// ============================================

export const RewardHistorySchema = z.object({
  id: z.union([z.string(), z.number()]),
  description: z.string(),
  points: z.number(),
  date: z.string(),
});

export const RewardsSchema = z.object({
  totalPoints: z.number().min(0),
  pendingPoints: z.number().min(0).optional(),
  redeemedPoints: z.number().min(0).optional(),
  expiringPoints: z.number().min(0).optional(),
  expirationDate: z.string().optional(),
  tier: RewardTierSchema.optional(),
  nextTierPoints: z.number().positive().optional(),
  history: z.array(RewardHistorySchema).optional(),
});

// ============================================
// DYNAMIC CVV
// ============================================

export const DynamicCvvSchema = z.object({
  cvv: z.string().regex(/^\d{3,4}$/, 'CVV must be 3-4 digits'),
  expiresAt: z.string().datetime().optional(),
  expiresIn: z.number().int().positive().optional(),
  remainingSeconds: z.number().int().positive().optional(),
});

// ============================================
// NOTIFICATIONS
// ============================================

export const NotificationSettingsSchema = z.object({
  purchases: z.boolean().optional(),
  payments: z.boolean().optional(),
  lowBalance: z.boolean().optional(),
  security: z.boolean().optional(),
  marketing: z.boolean().optional(),
  transactionAlerts: z.boolean().optional(),
  paymentReminders: z.boolean().optional(),
  securityAlerts: z.boolean().optional(),
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
export type SubscriptionStatus = z.infer<typeof SubscriptionStatusSchema>;
export type SubscriptionCategory = z.infer<typeof SubscriptionCategorySchema>;
export type RewardTier = z.infer<typeof RewardTierSchema>;
export type ReplaceReason = z.infer<typeof ReplaceReasonSchema>;

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
export type StatementTransaction = z.infer<typeof StatementTransactionSchema>;
export type Statement = z.infer<typeof StatementSchema>;
export type TravelNotice = z.infer<typeof TravelNoticeSchema>;
export type ReplaceCardRequest = z.infer<typeof ReplaceCardRequestSchema>;
export type Subscription = z.infer<typeof SubscriptionSchema>;
export type RewardHistory = z.infer<typeof RewardHistorySchema>;
export type Rewards = z.infer<typeof RewardsSchema>;
export type DynamicCvv = z.infer<typeof DynamicCvvSchema>;
export type NotificationSettings = z.infer<typeof NotificationSettingsSchema>;
export type OperationResult = z.infer<typeof OperationResultSchema>;

// ============================================
// CASH ADVANCE RESULT (response specific)
// ============================================

export const CashAdvanceResultSchema = z.object({
  fee: z.string(),
  total: z.string(),
  transactionId: z.string(),
});

export type CashAdvanceResult = z.infer<typeof CashAdvanceResultSchema>;

// ============================================
// UPDATE LIMITS REQUEST
// ============================================

export const UpdateLimitsRequestSchema = z.object({
  cardId: z.string().min(1),
  limits: CardLimitsSchema.partial(),
});

export type UpdateLimitsRequest = z.infer<typeof UpdateLimitsRequestSchema>;

// ============================================
// OPERATION STATUS (UI helpers)
// ============================================

export type OperationStatus = 'idle' | 'loading' | 'success' | 'error';
