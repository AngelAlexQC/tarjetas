import { ICardActionRepository } from '@/domain/cards/repository/card-action.interface';
import { CardAction } from '@/domain/cards/types/card-action.schema';

export class RealCardActionRepository implements ICardActionRepository {
  async getActions(_cardType: 'credit' | 'debit' | 'virtual'): Promise<CardAction[]> {
    console.warn('RealCardActionRepository.getActions not implemented yet. Using empty list.');
    return [];
  }
}
