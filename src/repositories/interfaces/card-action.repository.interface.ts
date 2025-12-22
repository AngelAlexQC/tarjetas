import { CardAction } from '@/repositories/schemas/card-action.schema';

export interface ICardActionRepository {
  getActions(cardType: 'credit' | 'debit' | 'virtual'): Promise<CardAction[]>;
}
