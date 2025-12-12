/**
 * Real Card Repository Tests
 */

import { API_ENDPOINTS } from '@/api/config';
import { httpClient } from '@/api/http-client';
import { RealCardRepository } from '../card.repository.real';

// Mock dependencies
jest.mock('@/api/http-client', () => ({
  httpClient: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
  },
}));

jest.mock('@/utils/api-validation', () => ({
  parseApiData: jest.fn((schema, data) => data),
}));

describe('RealCardRepository', () => {
  let repository: RealCardRepository;

  beforeEach(() => {
    repository = new RealCardRepository();
    jest.clearAllMocks();
  });

  describe('getCards', () => {
    it('should get all cards successfully', async () => {
      const mockCards = [
        { id: '1', cardNumber: '•••• 1234', cardType: 'credit' },
        { id: '2', cardNumber: '•••• 5678', cardType: 'debit' },
      ];
      (httpClient.get as jest.Mock).mockResolvedValue({
        success: true,
        data: mockCards,
      });

      const cards = await repository.getCards();

      expect(httpClient.get).toHaveBeenCalledWith(API_ENDPOINTS.CARDS.LIST);
      expect(cards).toEqual(mockCards);
    });

    it('should throw error on failure', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Error de servidor',
      });

      await expect(repository.getCards()).rejects.toThrow('Error de servidor');
    });
  });

  describe('getCardById', () => {
    it('should get card by ID successfully', async () => {
      const mockCard = { id: '1', cardNumber: '•••• 1234', cardType: 'credit' };
      (httpClient.get as jest.Mock).mockResolvedValue({
        success: true,
        data: mockCard,
      });

      const card = await repository.getCardById('1');

      expect(httpClient.get).toHaveBeenCalledWith(API_ENDPOINTS.CARDS.GET('1'));
      expect(card).toEqual(mockCard);
    });

    it('should return undefined when no data', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue({
        success: true,
        data: null,
      });

      const card = await repository.getCardById('999');

      expect(card).toBeUndefined();
    });

    it('should throw error on failure', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Tarjeta no encontrada',
      });

      await expect(repository.getCardById('invalid')).rejects.toThrow('Tarjeta no encontrada');
    });
  });

  describe('blockCard', () => {
    it('should block card successfully', async () => {
      (httpClient.post as jest.Mock).mockResolvedValue({
        success: true,
        data: { success: true, message: 'Tarjeta bloqueada' },
      });

      const result = await repository.blockCard({
        cardId: '1',
        type: 'temporary',
      });

      expect(httpClient.post).toHaveBeenCalledWith(
        API_ENDPOINTS.CARDS.BLOCK('1'),
        { cardId: '1', type: 'temporary' }
      );
      expect(result.success).toBe(true);
    });

    it('should handle block failure', async () => {
      (httpClient.post as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Tarjeta ya bloqueada',
      });

      const result = await repository.blockCard({ cardId: '1', type: 'permanent' });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Tarjeta ya bloqueada');
    });
  });

  describe('unblockCard', () => {
    it('should unblock card successfully', async () => {
      (httpClient.post as jest.Mock).mockResolvedValue({
        success: true,
        data: { success: true, message: 'Tarjeta desbloqueada' },
      });

      const result = await repository.unblockCard('1');

      expect(httpClient.post).toHaveBeenCalledWith(API_ENDPOINTS.CARDS.UNBLOCK('1'));
      expect(result.success).toBe(true);
    });
  });

  describe('getDeferrableTransactions', () => {
    it('should get deferrable transactions', async () => {
      const mockTransactions = [
        { id: 't1', amount: 500, description: 'Compra' },
        { id: 't2', amount: 300, description: 'Restaurante' },
      ];
      (httpClient.get as jest.Mock).mockResolvedValue({
        success: true,
        data: mockTransactions,
      });

      const transactions = await repository.getDeferrableTransactions('1');

      expect(httpClient.get).toHaveBeenCalledWith(`${API_ENDPOINTS.CARDS.DEFER('1')}/transactions`);
      expect(transactions).toEqual(mockTransactions);
    });

    it('should throw error on failure', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Error al obtener transacciones',
      });

      await expect(repository.getDeferrableTransactions('1'))
        .rejects.toThrow('Error al obtener transacciones');
    });
  });

  describe('simulateDefer', () => {
    it('should simulate defer successfully', async () => {
      const mockSimulation = {
        totalAmount: 525,
        monthlyPayment: 175,
        interestRate: 0.05,
        months: 3,
      };
      (httpClient.post as jest.Mock).mockResolvedValue({
        success: true,
        data: mockSimulation,
      });

      const simulation = await repository.simulateDefer('1', 500, 3);

      expect(httpClient.post).toHaveBeenCalledWith(
        `${API_ENDPOINTS.CARDS.DEFER('1')}/simulate`,
        { amount: 500, months: 3 }
      );
      expect(simulation).toEqual(mockSimulation);
    });

    it('should throw error on failure', async () => {
      (httpClient.post as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Monto mínimo no alcanzado',
      });

      await expect(repository.simulateDefer('1', 10, 3))
        .rejects.toThrow('Monto mínimo no alcanzado');
    });
  });

  describe('deferPayment', () => {
    it('should defer payment successfully', async () => {
      (httpClient.post as jest.Mock).mockResolvedValue({
        success: true,
        data: { success: true, message: 'Diferimiento aplicado' },
      });

      const result = await repository.deferPayment({
        cardId: '1',
        months: 3,
        transactionIds: ['t1'],
      });

      expect(result.success).toBe(true);
    });
  });

  describe('getAccounts', () => {
    it('should get accounts successfully', async () => {
      const mockAccounts = [
        { id: 'acc1', accountNumber: '•••• 1111', type: 'checking' },
      ];
      (httpClient.get as jest.Mock).mockResolvedValue({
        success: true,
        data: mockAccounts,
      });

      const accounts = await repository.getAccounts();

      expect(accounts).toEqual(mockAccounts);
    });
  });

  describe('requestAdvance', () => {
    it('should request cash advance successfully', async () => {
      (httpClient.post as jest.Mock).mockResolvedValue({
        success: true,
        data: { success: true, message: 'Avance aprobado' },
      });

      const result = await repository.requestAdvance({
        cardId: '1',
        amount: 1000,
        months: 6,
        destinationAccountId: 'acc1',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('getLimits', () => {
    it('should get limits successfully', async () => {
      const mockLimits = {
        dailyAtm: 5000,
        dailyPurchase: 10000,
        monthlyPurchase: 50000,
      };
      (httpClient.get as jest.Mock).mockResolvedValue({
        success: true,
        data: mockLimits,
      });

      const limits = await repository.getLimits('1');

      expect(httpClient.get).toHaveBeenCalledWith(API_ENDPOINTS.CARDS.LIMITS('1'));
      expect(limits).toEqual(mockLimits);
    });

    it('should throw error on failure', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Error al obtener límites',
      });

      await expect(repository.getLimits('1')).rejects.toThrow('Error al obtener límites');
    });
  });

  describe('updateLimits', () => {
    it('should update limits successfully', async () => {
      (httpClient.put as jest.Mock).mockResolvedValue({
        success: true,
        data: { success: true, message: 'Límites actualizados' },
      });

      const result = await repository.updateLimits('1', { dailyAtm: 3000 });

      expect(httpClient.put).toHaveBeenCalledWith(
        API_ENDPOINTS.CARDS.LIMITS('1'),
        { dailyAtm: 3000 }
      );
      expect(result.success).toBe(true);
    });
  });

  describe('changePin', () => {
    it('should change PIN successfully', async () => {
      (httpClient.post as jest.Mock).mockResolvedValue({
        success: true,
        data: { success: true, message: 'PIN actualizado' },
      });

      const result = await repository.changePin({
        cardId: '1',
        currentPin: '1234',
        newPin: '5678',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('getStatement', () => {
    it('should get statement without date params', async () => {
      const mockStatement = {
        transactions: [],
        balance: 1000,
        dueDate: '2025-01-15',
      };
      (httpClient.get as jest.Mock).mockResolvedValue({
        success: true,
        data: mockStatement,
      });

      const statement = await repository.getStatement('1');

      expect(httpClient.get).toHaveBeenCalledWith(API_ENDPOINTS.CARDS.STATEMENT('1'));
      expect(statement).toEqual(mockStatement);
    });

    it('should get statement with date params', async () => {
      const mockStatement = { transactions: [], balance: 500 };
      (httpClient.get as jest.Mock).mockResolvedValue({
        success: true,
        data: mockStatement,
      });

      await repository.getStatement('1', 12, 2024);

      expect(httpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('month=12')
      );
      expect(httpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('year=2024')
      );
    });

    it('should throw error on failure', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Estado de cuenta no disponible',
      });

      await expect(repository.getStatement('1'))
        .rejects.toThrow('Estado de cuenta no disponible');
    });
  });

  describe('createTravelNotice', () => {
    it('should create travel notice successfully', async () => {
      (httpClient.post as jest.Mock).mockResolvedValue({
        success: true,
        data: { success: true, message: 'Aviso creado' },
      });

      const result = await repository.createTravelNotice({
        cardId: '1',
        startDate: '2025-01-15',
        endDate: '2025-01-30',
        destinations: ['USA'],
      });

      expect(httpClient.post).toHaveBeenCalledWith(
        API_ENDPOINTS.CARDS.TRAVEL_NOTICE('1'),
        expect.any(Object)
      );
      expect(result.success).toBe(true);
    });
  });

  describe('requestReplacement', () => {
    it('should request replacement successfully', async () => {
      (httpClient.post as jest.Mock).mockResolvedValue({
        success: true,
        data: { success: true, message: 'Solicitud enviada' },
      });

      const result = await repository.requestReplacement({
        cardId: '1',
        reason: 'lost',
      });

      expect(httpClient.post).toHaveBeenCalledWith(
        API_ENDPOINTS.CARDS.REPLACE('1'),
        expect.any(Object)
      );
      expect(result.success).toBe(true);
    });
  });

  describe('getSubscriptions', () => {
    it('should get subscriptions successfully', async () => {
      const mockSubscriptions = [
        { id: 'sub1', merchant: 'Netflix', amount: 15.99 },
      ];
      (httpClient.get as jest.Mock).mockResolvedValue({
        success: true,
        data: mockSubscriptions,
      });

      const subscriptions = await repository.getSubscriptions('1');

      expect(subscriptions).toEqual(mockSubscriptions);
    });

    it('should throw error on failure', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Error al obtener suscripciones',
      });

      await expect(repository.getSubscriptions('1'))
        .rejects.toThrow('Error al obtener suscripciones');
    });
  });

  describe('toggleSubscription', () => {
    it('should toggle subscription successfully', async () => {
      (httpClient.post as jest.Mock).mockResolvedValue({
        success: true,
        data: { success: true, message: 'Suscripción actualizada' },
      });

      const result = await repository.toggleSubscription('1', 'sub1');

      expect(httpClient.post).toHaveBeenCalledWith(
        `${API_ENDPOINTS.CARDS.SUBSCRIPTIONS('1')}/sub1/toggle`
      );
      expect(result.success).toBe(true);
    });
  });

  describe('getRewards', () => {
    it('should get rewards successfully', async () => {
      const mockRewards = {
        points: 5000,
        tier: 'gold',
        expiringPoints: 100,
      };
      (httpClient.get as jest.Mock).mockResolvedValue({
        success: true,
        data: mockRewards,
      });

      const rewards = await repository.getRewards('1');

      expect(rewards).toEqual(mockRewards);
    });

    it('should throw error on failure', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Error al obtener recompensas',
      });

      await expect(repository.getRewards('1'))
        .rejects.toThrow('Error al obtener recompensas');
    });
  });

  describe('generateDynamicCvv', () => {
    it('should generate dynamic CVV successfully', async () => {
      const mockCvv = {
        cvv: '123',
        expiresAt: '2025-01-01T12:05:00Z',
      };
      (httpClient.post as jest.Mock).mockResolvedValue({
        success: true,
        data: mockCvv,
      });

      const cvv = await repository.generateDynamicCvv('1');

      expect(httpClient.post).toHaveBeenCalledWith(API_ENDPOINTS.CARDS.CVV('1'));
      expect(cvv).toEqual(mockCvv);
    });

    it('should throw error on failure', async () => {
      (httpClient.post as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Error al generar CVV',
      });

      await expect(repository.generateDynamicCvv('1'))
        .rejects.toThrow('Error al generar CVV');
    });
  });

  describe('updateNotifications', () => {
    it('should update notifications successfully', async () => {
      (httpClient.put as jest.Mock).mockResolvedValue({
        success: true,
        data: { success: true, message: 'Notificaciones actualizadas' },
      });

      const result = await repository.updateNotifications('1', {
        purchases: true,
        payments: false,
      });

      expect(httpClient.put).toHaveBeenCalledWith(
        API_ENDPOINTS.CARDS.NOTIFICATIONS('1'),
        { purchases: true, payments: false }
      );
      expect(result.success).toBe(true);
    });
  });
});
