import { ICardActionRepository } from '@/repositories/interfaces/card-action.repository.interface';
import { CardAction } from '@/repositories/schemas/card-action.schema';

export class RealCardActionRepository implements ICardActionRepository {
  async getActions(cardType: 'credit' | 'debit' | 'virtual'): Promise<CardAction[]> {
    console.warn('RealCardActionRepository.getActions not implemented yet. Using empty list.');
    return [];
  }
}
