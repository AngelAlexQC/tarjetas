/**
 * Mock Card Repository Tests
 * 
 * Usa jest.useFakeTimers con advanceTimers: true para auto-avanzar timers
 */

import { MockCardRepository } from '@/domain/cards/repository/card.mock';

jest.mock('@/core/http/config', () => ({
  API_CONFIG: {
    USE_MOCK_API: true,
    MOCK_DELAY: 10, // Delay mínimo para tests
  },
}));

describe('MockCardRepository', () => {
  let repository: MockCardRepository;

  beforeEach(() => {
    repository = new MockCardRepository();
    jest.useFakeTimers({ advanceTimers: true });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getCards', () => {
    it('should return an array of cards', async () => {
      const cards = await repository.getCards();
      expect(Array.isArray(cards)).toBe(true);
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should return cards with required properties', async () => {
      const cards = await repository.getCards();
      const card = cards[0];
      expect(card).toMatchObject({
        id: expect.any(String),
        cardNumber: expect.any(String),
        cardHolder: expect.any(String),
        expiryDate: expect.any(String),
        cardType: expect.any(String),
        cardBrand: expect.any(String),
        status: expect.any(String),
      });
    });
  });

  describe('getCardById', () => {
    it('should return a card by id', async () => {
      const cards = await repository.getCards();
      const card = await repository.getCardById(cards[0].id);
      expect(card).toBeDefined();
      expect(card?.id).toBe(cards[0].id);
    });

    it('should return undefined for non-existent id', async () => {
      const card = await repository.getCardById('non-existent');
      expect(card).toBeUndefined();
    });
  });

  describe('blockCard', () => {
    it('should block temporarily', async () => {
      const result = await repository.blockCard({ cardId: '1', type: 'temporary' });
      expect(result.success).toBe(true);
      expect(result.message).toContain('pausada');
    });

    it('should block permanently', async () => {
      const result = await repository.blockCard({ cardId: '1', type: 'permanent', reason: 'lost' });
      expect(result.success).toBe(true);
      expect(result.message).toContain('bloqueada');
    });
  });

  describe('unblockCard', () => {
    it('should unblock a card', async () => {
      const result = await repository.unblockCard('1');
      expect(result.success).toBe(true);
    });
  });

  describe('getDeferrableTransactions', () => {
    it('should return deferrable transactions', async () => {
      const transactions = await repository.getDeferrableTransactions('1');
      expect(Array.isArray(transactions)).toBe(true);
      transactions.forEach(t => expect(t.canDefer).toBe(true));
    });
  });

  describe('simulateDefer', () => {
    it('should calculate defer simulation', async () => {
      const simulation = await repository.simulateDefer('1', 100, 12);
      expect(simulation).toMatchObject({
        originalAmount: 100,
        months: 12,
        interestRate: expect.any(Number),
        monthlyFee: expect.any(Number),
        totalWithInterest: expect.any(Number),
      });
      expect(simulation.totalWithInterest).toBeGreaterThan(100);
    });
  });

  describe('deferPayment', () => {
    it('should defer payment', async () => {
      const result = await repository.deferPayment({
        cardId: '1',
        transactionIds: ['1'],
        months: 6,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('getAccounts', () => {
    it('should return accounts', async () => {
      const accounts = await repository.getAccounts();
      expect(Array.isArray(accounts)).toBe(true);
      expect(accounts.length).toBeGreaterThan(0);
    });
  });

  describe('requestAdvance', () => {
    it('should process advance request', async () => {
      const result = await repository.requestAdvance({
        cardId: '1',
        amount: 100,
        months: 6,
        destinationAccountId: '1',
      });
      expect(result).toHaveProperty('success');
    });
  });

  describe('getLimits', () => {
    it('should return limits', async () => {
      const limits = await repository.getLimits('1');
      expect(limits).toHaveProperty('dailyPurchase');
      expect(limits).toHaveProperty('monthlyPurchase');
    });
  });

  describe('updateLimits', () => {
    it('should update limits', async () => {
      const result = await repository.updateLimits('1', { dailyPurchase: 1000 });
      expect(result).toHaveProperty('success');
    });
  });

  describe('changePin', () => {
    it('should change PIN', async () => {
      const result = await repository.changePin({
        cardId: '1',
        currentPin: '1234',
        newPin: '5678',
      });
      expect(result).toHaveProperty('success');
    });
  });

  describe('generateDynamicCvv', () => {
    it('should generate CVV', async () => {
      const cvv = await repository.generateDynamicCvv('1');
      expect(cvv.cvv).toHaveLength(3);
      expect(cvv).toHaveProperty('expiresIn');
    });
  });

  describe('getSubscriptions', () => {
    it('should return subscriptions', async () => {
      const subs = await repository.getSubscriptions('1');
      expect(Array.isArray(subs)).toBe(true);
    });
  });

  describe('getRewards', () => {
    it('should return rewards', async () => {
      const rewards = await repository.getRewards('1');
      expect(rewards).toHaveProperty('totalPoints');
      expect(rewards).toHaveProperty('history');
    });
  });

  describe('getStatement', () => {
    it('should return statement', async () => {
      const statement = await repository.getStatement('1');
      expect(statement).toHaveProperty('transactions');
      expect(statement).toHaveProperty('totalPayment');
    });
  });
});
