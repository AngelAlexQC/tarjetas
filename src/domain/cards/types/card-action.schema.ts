import type { FinancialIconType } from '@/components/ui/financial-icons';

export type CardActionType =
  | 'block'
  | 'unblock'
  | 'defer'
  | 'statement'
  | 'advances'
  | 'limits'
  | 'pin'
  | 'subscriptions'
  | 'pay'
  | 'cardless_atm'
  | 'travel'
  | 'channels'
  | 'cvv'
  | 'replace'
  | 'rewards';

export interface CardAction {
  id: CardActionType;
  title: string;
  description: string;
  icon: FinancialIconType;
  color: string;
  requiresAuth?: boolean;
}
