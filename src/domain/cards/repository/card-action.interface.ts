import { CardAction } from '@/domain/cards/types/card-action.schema';

export interface ICardActionRepository {
  getActions(cardType: 'credit' | 'debit' | 'virtual'): Promise<CardAction[]>;
}
