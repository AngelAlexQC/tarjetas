/**
 * Card Queries Hook Tests
 */

import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useCardQueries } from '../use-card-queries';
import { cardRepository$ } from '@/repositories';

// Mock del repositorio
jest.mock('@/repositories', () => ({
  cardRepository$: jest.fn(),
}));

// Mock del logger
jest.mock('@/core/logging/logger', () => ({
  loggers: {
    cards: {
      error: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
    },
  },
}));

// Mock del tenant theme context
jest.mock('@/contexts/tenant-theme-context', () => ({
  useTenantTheme: jest.fn(() => ({
    currentTheme: { slug: 'test-tenant' },
  })),
}));

describe('useCardQueries', () => {
  const mockCards = [
    {
      id: '1',
      cardNumber: '•••• •••• •••• 1234',
      cardHolder: 'Test User',
      expiryDate: '12/27',
      balance: 1500.50,
      cardType: 'credit' as const,
      cardBrand: 'visa' as const,
      status: 'active' as const,
      creditLimit: 10000,
      availableCredit: 8500,
    },
    {
      id: '2',
      cardNumber: '•••• •••• •••• 5678',
      cardHolder: 'Test User 2',
      expiryDate: '06/28',
      balance: 2500.00,
      cardType: 'debit' as const,
      cardBrand: 'mastercard' as const,
      status: 'active' as const,
    },
  ];

  const mockRepository = {
    getCards: jest.fn(),
    getCardById: jest.fn(),
    getLimits: jest.fn(),
    getStatement: jest.fn(),
    getSubscriptions: jest.fn(),
    getRewards: jest.fn(),
    generateDynamicCvv: jest.fn(),
    getDeferrableTransactions: jest.fn(),
    getAccounts: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (cardRepository$ as jest.Mock).mockReturnValue(mockRepository);
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useCardQueries());

      expect(result.current.cards).toEqual([]);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should not auto-fetch by default', async () => {
      renderHook(() => useCardQueries());

      expect(mockRepository.getCards).not.toHaveBeenCalled();
    });

    it('should auto-fetch when autoFetch is true', async () => {
      mockRepository.getCards.mockResolvedValue(mockCards);

      renderHook(() => useCardQueries({ autoFetch: true }));

      await waitFor(() => {
        expect(mockRepository.getCards).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('fetchCards', () => {
    it('should fetch cards successfully', async () => {
      mockRepository.getCards.mockResolvedValue(mockCards);

      const { result } = renderHook(() => useCardQueries());

      await act(async () => {
        const cards = await result.current.fetchCards();
        expect(cards).toEqual(mockCards);
      });

      expect(result.current.cards).toEqual(mockCards);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle fetch error', async () => {
      mockRepository.getCards.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useCardQueries());

      await act(async () => {
        const cards = await result.current.fetchCards();
        expect(cards).toEqual([]);
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.isLoading).toBe(false);
    });

    it('should set loading state while fetching', async () => {
      let resolvePromise: (value: unknown) => void;
      mockRepository.getCards.mockImplementation(() => 
        new Promise(resolve => { resolvePromise = resolve; })
      );

      const { result } = renderHook(() => useCardQueries());

      act(() => {
        result.current.fetchCards();
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolvePromise!(mockCards);
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('getCardById', () => {
    it('should get card by id successfully', async () => {
      const card = mockCards[0];
      mockRepository.getCardById.mockResolvedValue(card);

      const { result } = renderHook(() => useCardQueries());

      let fetchedCard;
      await act(async () => {
        fetchedCard = await result.current.getCardById('1');
      });

      expect(fetchedCard).toEqual(card);
      expect(mockRepository.getCardById).toHaveBeenCalledWith('1');
    });

    it('should return undefined on error', async () => {
      mockRepository.getCardById.mockRejectedValue(new Error('Not found'));

      const { result } = renderHook(() => useCardQueries());

      let fetchedCard;
      await act(async () => {
        fetchedCard = await result.current.getCardById('999');
      });

      expect(fetchedCard).toBeUndefined();
    });
  });

  describe('getLimits', () => {
    const mockLimits = {
      dailyPurchase: 5000,
      dailyAtm: 1000,
      monthlyPurchase: 50000,
      onlinePurchase: 10000,
      internationalPurchase: 5000,
    };

    it('should get limits successfully', async () => {
      mockRepository.getLimits.mockResolvedValue(mockLimits);

      const { result } = renderHook(() => useCardQueries());

      let limits;
      await act(async () => {
        limits = await result.current.getLimits('1');
      });

      expect(limits).toEqual(mockLimits);
      expect(mockRepository.getLimits).toHaveBeenCalledWith('1');
    });

    it('should return null on error', async () => {
      mockRepository.getLimits.mockRejectedValue(new Error('Error'));

      const { result } = renderHook(() => useCardQueries());

      let limits;
      await act(async () => {
        limits = await result.current.getLimits('1');
      });

      expect(limits).toBeNull();
    });
  });

  describe('getStatement', () => {
    const mockStatement = {
      id: '1',
      cardId: '1',
      month: 11,
      year: 2025,
      totalBalance: 5000,
      minimumPayment: 500,
      dueDate: '2025-12-15',
      transactions: [],
    };

    it('should get statement successfully', async () => {
      mockRepository.getStatement.mockResolvedValue(mockStatement);

      const { result } = renderHook(() => useCardQueries());

      let statement;
      await act(async () => {
        statement = await result.current.getStatement('1', 11, 2025);
      });

      expect(statement).toEqual(mockStatement);
      expect(mockRepository.getStatement).toHaveBeenCalledWith('1', 11, 2025);
    });

    it('should return null on error', async () => {
      mockRepository.getStatement.mockRejectedValue(new Error('Error'));

      const { result } = renderHook(() => useCardQueries());

      let statement;
      await act(async () => {
        statement = await result.current.getStatement('1');
      });

      expect(statement).toBeNull();
    });
  });

  describe('getSubscriptions', () => {
    const mockSubscriptions = [
      { id: '1', name: 'Netflix', amount: 15.99, status: 'active' },
      { id: '2', name: 'Spotify', amount: 9.99, status: 'active' },
    ];

    it('should get subscriptions successfully', async () => {
      mockRepository.getSubscriptions.mockResolvedValue(mockSubscriptions);

      const { result } = renderHook(() => useCardQueries());

      let subscriptions;
      await act(async () => {
        subscriptions = await result.current.getSubscriptions('1');
      });

      expect(subscriptions).toEqual(mockSubscriptions);
    });

    it('should return empty array on error', async () => {
      mockRepository.getSubscriptions.mockRejectedValue(new Error('Error'));

      const { result } = renderHook(() => useCardQueries());

      let subscriptions;
      await act(async () => {
        subscriptions = await result.current.getSubscriptions('1');
      });

      expect(subscriptions).toEqual([]);
    });
  });

  describe('getRewards', () => {
    const mockRewards = {
      points: 5000,
      tier: 'gold',
      expiringPoints: 500,
      expirationDate: '2025-12-31',
    };

    it('should get rewards successfully', async () => {
      mockRepository.getRewards.mockResolvedValue(mockRewards);

      const { result } = renderHook(() => useCardQueries());

      let rewards;
      await act(async () => {
        rewards = await result.current.getRewards('1');
      });

      expect(rewards).toEqual(mockRewards);
    });

    it('should return null on error', async () => {
      mockRepository.getRewards.mockRejectedValue(new Error('Error'));

      const { result } = renderHook(() => useCardQueries());

      let rewards;
      await act(async () => {
        rewards = await result.current.getRewards('1');
      });

      expect(rewards).toBeNull();
    });
  });

  describe('generateDynamicCvv', () => {
    const mockCvv = {
      cvv: '123',
      expiresAt: '2025-12-03T12:00:00Z',
      remainingSeconds: 300,
    };

    it('should generate CVV successfully', async () => {
      mockRepository.generateDynamicCvv.mockResolvedValue(mockCvv);

      const { result } = renderHook(() => useCardQueries());

      let cvv;
      await act(async () => {
        cvv = await result.current.generateDynamicCvv('1');
      });

      expect(cvv).toEqual(mockCvv);
    });

    it('should return null on error', async () => {
      mockRepository.generateDynamicCvv.mockRejectedValue(new Error('Error'));

      const { result } = renderHook(() => useCardQueries());

      let cvv;
      await act(async () => {
        cvv = await result.current.generateDynamicCvv('1');
      });

      expect(cvv).toBeNull();
    });
  });

  describe('getDeferrableTransactions', () => {
    const mockTransactions = [
      { id: '1', description: 'Purchase 1', amount: 100, canDefer: true },
      { id: '2', description: 'Purchase 2', amount: 200, canDefer: true },
    ];

    it('should get deferrable transactions successfully', async () => {
      mockRepository.getDeferrableTransactions.mockResolvedValue(mockTransactions);

      const { result } = renderHook(() => useCardQueries());

      let transactions;
      await act(async () => {
        transactions = await result.current.getDeferrableTransactions('1');
      });

      expect(transactions).toEqual(mockTransactions);
    });

    it('should return empty array on error', async () => {
      mockRepository.getDeferrableTransactions.mockRejectedValue(new Error('Error'));

      const { result } = renderHook(() => useCardQueries());

      let transactions;
      await act(async () => {
        transactions = await result.current.getDeferrableTransactions('1');
      });

      expect(transactions).toEqual([]);
    });
  });

  describe('getAccounts', () => {
    const mockAccounts = [
      { id: '1', type: 'savings', number: '****1234' },
      { id: '2', type: 'checking', number: '****5678' },
    ];

    it('should get accounts successfully', async () => {
      mockRepository.getAccounts.mockResolvedValue(mockAccounts);

      const { result } = renderHook(() => useCardQueries());

      let accounts;
      await act(async () => {
        accounts = await result.current.getAccounts();
      });

      expect(accounts).toEqual(mockAccounts);
    });

    it('should return empty array on error', async () => {
      mockRepository.getAccounts.mockRejectedValue(new Error('Error'));

      const { result } = renderHook(() => useCardQueries());

      let accounts;
      await act(async () => {
        accounts = await result.current.getAccounts();
      });

      expect(accounts).toEqual([]);
    });
  });
});
