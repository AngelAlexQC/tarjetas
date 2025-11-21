export type OperationStatus = 'idle' | 'loading' | 'success' | 'error';

export interface OperationResult {
  success: boolean;
  title: string;
  message: string;
  receiptId?: string;
  date?: string;
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

// --- Defer Payments ---
export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  canDefer: boolean;
}

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
  securityCode: string; // CVV or similar for validation
}

// --- Limits ---
export interface CardLimits {
  dailyAtm: number;
  dailyPos: number;
  dailyOnline: number;
  monthlyTotal: number;
  perTransaction: number;
}

export interface UpdateLimitsRequest {
  cardId: string;
  limits: CardLimits;
}

// --- PIN ---
export interface ChangePinRequest {
  cardId: string;
  newPin: string;
  currentPin?: string; // Depending on bank policy
}

// --- Subscriptions ---
export interface Subscription {
  id: string;
  merchantName: string;
  merchantLogo?: string;
  averageAmount: number;
  frequency: 'monthly' | 'yearly' | 'weekly';
  lastPaymentDate: string;
  status: 'active' | 'paused' | 'blocked';
}
