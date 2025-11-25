/**
 * Card Operations Types
 * 
 * Este archivo re-exporta los tipos desde el sistema de repositorios
 * para mantener compatibilidad con el código existente.
 * 
 * @deprecated Para nuevas funcionalidades, importar directamente desde '@/repositories'
 */

// Re-exportar todos los tipos desde repositories
export {
  type BlockReason,
  type BlockType,
  type BlockCardRequest,
  type Transaction,
  type DeferSimulation,
  type DeferRequest,
  type Account,
  type CashAdvanceRequest,
  type CardLimits,
  type ChangePinRequest,
  type Subscription,
  type CardActionResult,
} from '@/repositories';

// Tipos específicos de UI que no están en el repositorio
export type OperationStatus = 'idle' | 'loading' | 'success' | 'error';

export interface OperationResult {
  success: boolean;
  title: string;
  message: string;
  receiptId?: string;
  date?: string;
}

// Re-export UpdateLimitsRequest for compatibility
export interface UpdateLimitsRequest {
  cardId: string;
  limits: Partial<import('@/repositories').CardLimits>;
}
