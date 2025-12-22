/**
 * Card Defer Hook Tests
 */

import { cardRepository$ } from '@/repositories';
import { act, renderHook } from '@testing-library/react-native';
import { useCardDefer } from '../use-card-defer';

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
    },
  },
}));

describe('useCardDefer', () => {
  const mockSimulation = {
    originalAmount: 1000,
    months: 6,
    interestRate: 1.89,
    monthlyFee: 178.90,
    totalWithInterest: 1073.40,
    firstPaymentDate: '2026-01-03',
  };

  const mockRepository = {
    simulateDefer: jest.fn(),
    deferPayment: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (cardRepository$ as jest.Mock).mockReturnValue(mockRepository);
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useCardDefer());

      expect(result.current.simulation).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSimulating).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('simulateDefer', () => {
    it('should simulate defer successfully', async () => {
      mockRepository.simulateDefer.mockResolvedValue(mockSimulation);

      const { result } = renderHook(() => useCardDefer());

      let simulation;
      await act(async () => {
        simulation = await result.current.simulateDefer('1', 1000, 6);
      });

      expect(simulation).toEqual(mockSimulation);
      expect(result.current.simulation).toEqual(mockSimulation);
      expect(result.current.isSimulating).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockRepository.simulateDefer).toHaveBeenCalledWith('1', 1000, 6);
    });

    it('should handle simulation error', async () => {
      mockRepository.simulateDefer.mockRejectedValue(new Error('Simulation failed'));

      const { result } = renderHook(() => useCardDefer());

      let simulation;
      await act(async () => {
        simulation = await result.current.simulateDefer('1', 1000, 6);
      });

      expect(simulation).toBeNull();
      expect(result.current.simulation).toBeNull();
      expect(result.current.error).toBe('Simulation failed');
      expect(result.current.isSimulating).toBe(false);
    });

    it('should set isSimulating while simulating', async () => {
      let resolvePromise: (value: unknown) => void;
      mockRepository.simulateDefer.mockImplementation(() => 
        new Promise(resolve => { resolvePromise = resolve; })
      );

      const { result } = renderHook(() => useCardDefer());

      act(() => {
        result.current.simulateDefer('1', 1000, 6);
      });

      expect(result.current.isSimulating).toBe(true);

      await act(async () => {
        resolvePromise!(mockSimulation);
      });

      expect(result.current.isSimulating).toBe(false);
    });

    it('should handle non-Error exceptions', async () => {
      mockRepository.simulateDefer.mockRejectedValue('Unknown error');

      const { result } = renderHook(() => useCardDefer());

      await act(async () => {
        await result.current.simulateDefer('1', 1000, 6);
      });

      expect(result.current.error).toBe('Error al simular diferimiento');
    });
  });

  describe('confirmDefer', () => {
    const deferRequest = {
      cardId: '1',
      transactionIds: ['tx1', 'tx2'],
      months: 6,
      amount: 1000,
    };

    it('should confirm defer successfully', async () => {
      const successResult = { success: true, message: 'Pago diferido exitosamente' };
      mockRepository.deferPayment.mockResolvedValue(successResult);

      const { result } = renderHook(() => useCardDefer());

      // First set a simulation
      mockRepository.simulateDefer.mockResolvedValue(mockSimulation);
      await act(async () => {
        await result.current.simulateDefer('1', 1000, 6);
      });

      expect(result.current.simulation).not.toBeNull();

      let response;
      await act(async () => {
        response = await result.current.confirmDefer(deferRequest);
      });

      expect(response).toEqual(successResult);
      expect(result.current.simulation).toBeNull(); // Cleared after confirm
      expect(result.current.isLoading).toBe(false);
      expect(mockRepository.deferPayment).toHaveBeenCalledWith(deferRequest);
    });

    it('should handle confirm defer error', async () => {
      mockRepository.deferPayment.mockRejectedValue(new Error('Payment failed'));

      const { result } = renderHook(() => useCardDefer());

      let response;
      await act(async () => {
        response = await result.current.confirmDefer(deferRequest);
      });

      expect(response).toEqual({ success: false, message: 'Payment failed' });
      expect(result.current.error).toBe('Payment failed');
      expect(result.current.isLoading).toBe(false);
    });

    it('should set isLoading while confirming', async () => {
      let resolvePromise: (value: unknown) => void;
      mockRepository.deferPayment.mockImplementation(() => 
        new Promise(resolve => { resolvePromise = resolve; })
      );

      const { result } = renderHook(() => useCardDefer());

      act(() => {
        result.current.confirmDefer(deferRequest);
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolvePromise!({ success: true, message: 'Done' });
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should handle non-Error exceptions', async () => {
      mockRepository.deferPayment.mockRejectedValue('Unknown error');

      const { result } = renderHook(() => useCardDefer());

      let response;
      await act(async () => {
        response = await result.current.confirmDefer(deferRequest);
      });

      expect(response).toEqual({ success: false, message: 'Error al diferir pago' });
    });
  });

  describe('clearSimulation', () => {
    it('should clear simulation', async () => {
      mockRepository.simulateDefer.mockResolvedValue(mockSimulation);

      const { result } = renderHook(() => useCardDefer());

      // Set simulation first
      await act(async () => {
        await result.current.simulateDefer('1', 1000, 6);
      });

      expect(result.current.simulation).not.toBeNull();

      // Clear it
      act(() => {
        result.current.clearSimulation();
      });

      expect(result.current.simulation).toBeNull();
    });
  });
});
