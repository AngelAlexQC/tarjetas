/**
 * Card Operation Hook Tests
 */

import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useCardOperation } from '../use-card-operation';
import { cardRepository$ } from '@/repositories';

// Mock del repositorio
jest.mock('@/repositories', () => ({
  cardRepository$: jest.fn(),
}));

// Mock del logger
jest.mock('@/utils/logger', () => ({
  loggers: {
    cards: {
      error: jest.fn(),
      info: jest.fn(),
    },
  },
}));

// Mock de expo-router
const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  replace: jest.fn(),
};

let mockParams: { id?: string } = { id: '1' };

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockParams,
  useRouter: () => mockRouter,
}));

describe('useCardOperation', () => {
  const mockCard = {
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
  };

  const mockRepository = {
    getCardById: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockParams = { id: '1' };
    (cardRepository$ as jest.Mock).mockReturnValue(mockRepository);
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      mockRepository.getCardById.mockResolvedValue(mockCard);
      
      const { result } = renderHook(() => useCardOperation({ autoLoad: false }));

      expect(result.current.card).toBeUndefined();
      expect(result.current.isLoadingCard).toBe(false);
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.result).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.cardId).toBe('1');
    });

    it('should auto-load card by default', async () => {
      mockRepository.getCardById.mockResolvedValue(mockCard);

      const { result } = renderHook(() => useCardOperation());

      await waitFor(() => {
        expect(result.current.card).toEqual(mockCard);
      });

      expect(mockRepository.getCardById).toHaveBeenCalledWith('1');
    });

    it('should not auto-load when autoLoad is false', () => {
      renderHook(() => useCardOperation({ autoLoad: false }));

      expect(mockRepository.getCardById).not.toHaveBeenCalled();
    });
  });

  describe('loadCard', () => {
    it('should load card successfully', async () => {
      mockRepository.getCardById.mockResolvedValue(mockCard);

      const { result } = renderHook(() => useCardOperation({ autoLoad: false }));

      await act(async () => {
        await result.current.loadCard('1');
      });

      expect(result.current.card).toEqual(mockCard);
      expect(result.current.isLoadingCard).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle load card error', async () => {
      mockRepository.getCardById.mockRejectedValue(new Error('Card not found'));

      const { result } = renderHook(() => useCardOperation({ autoLoad: false }));

      await act(async () => {
        await result.current.loadCard('999');
      });

      expect(result.current.card).toBeUndefined();
      expect(result.current.error).toBe('Card not found');
      expect(result.current.isLoadingCard).toBe(false);
    });

    it('should use route param id when no cardId provided', async () => {
      mockRepository.getCardById.mockResolvedValue(mockCard);

      const { result } = renderHook(() => useCardOperation({ autoLoad: false }));

      await act(async () => {
        await result.current.loadCard();
      });

      expect(mockRepository.getCardById).toHaveBeenCalledWith('1');
    });

    it('should handle missing id', async () => {
      mockParams = {};
      
      const { result } = renderHook(() => useCardOperation({ autoLoad: false }));

      await act(async () => {
        await result.current.loadCard();
      });

      expect(result.current.error).toBe('ID de tarjeta no proporcionado');
    });
  });

  describe('processing states', () => {
    it('should start processing', () => {
      mockRepository.getCardById.mockResolvedValue(mockCard);
      
      const { result } = renderHook(() => useCardOperation({ autoLoad: false }));

      act(() => {
        result.current.startProcessing();
      });

      expect(result.current.isProcessing).toBe(true);
      expect(result.current.error).toBeNull();
    });

    it('should finish with result', () => {
      mockRepository.getCardById.mockResolvedValue(mockCard);
      
      const { result } = renderHook(() => useCardOperation({ autoLoad: false }));

      act(() => {
        result.current.startProcessing();
      });

      const operationResult = {
        success: true,
        title: 'Success',
        message: 'Operation completed',
      };

      act(() => {
        result.current.finishWithResult(operationResult);
      });

      expect(result.current.isProcessing).toBe(false);
      expect(result.current.result).toEqual(operationResult);
    });

    it('should finish with error', () => {
      mockRepository.getCardById.mockResolvedValue(mockCard);
      
      const { result } = renderHook(() => useCardOperation({ autoLoad: false }));

      act(() => {
        result.current.startProcessing();
      });

      act(() => {
        result.current.finishWithError('Something went wrong');
      });

      expect(result.current.isProcessing).toBe(false);
      expect(result.current.result).toEqual({
        success: false,
        title: 'Error',
        message: 'Something went wrong',
      });
    });

    it('should reset result', () => {
      mockRepository.getCardById.mockResolvedValue(mockCard);
      
      const { result } = renderHook(() => useCardOperation({ autoLoad: false }));

      act(() => {
        result.current.finishWithResult({
          success: true,
          title: 'Success',
          message: 'Done',
        });
      });

      expect(result.current.result).not.toBeNull();

      act(() => {
        result.current.resetResult();
      });

      expect(result.current.result).toBeNull();
    });
  });

  describe('executeOperation', () => {
    beforeEach(() => {
      mockRepository.getCardById.mockResolvedValue(mockCard);
    });

    it('should execute operation successfully', async () => {
      const { result } = renderHook(() => useCardOperation({ autoLoad: false }));

      const mockOperation = jest.fn().mockResolvedValue({
        success: true,
        message: 'Card blocked',
        data: { cardId: '1' },
      });

      let response;
      await act(async () => {
        response = await result.current.executeOperation(
          mockOperation,
          'Card Blocked'
        );
      });

      expect(response).toEqual({
        success: true,
        message: 'Card blocked',
        data: { cardId: '1' },
      });
      expect(result.current.result?.success).toBe(true);
      expect(result.current.result?.title).toBe('Card Blocked');
      expect(result.current.isProcessing).toBe(false);
    });

    it('should execute operation with receipt prefix', async () => {
      const { result } = renderHook(() => useCardOperation({ autoLoad: false }));

      const mockOperation = jest.fn().mockResolvedValue({
        success: true,
        message: 'Card blocked',
      });

      await act(async () => {
        await result.current.executeOperation(
          mockOperation,
          'Card Blocked',
          { receiptPrefix: 'BLK' }
        );
      });

      expect(result.current.result?.receiptId).toMatch(/^BLK-\d+$/);
    });

    it('should execute operation with custom success message', async () => {
      const { result } = renderHook(() => useCardOperation({ autoLoad: false }));

      const mockOperation = jest.fn().mockResolvedValue({
        success: true,
        message: 'Original message',
      });

      await act(async () => {
        await result.current.executeOperation(
          mockOperation,
          'Success',
          { successMessage: 'Custom success message' }
        );
      });

      expect(result.current.result?.message).toBe('Custom success message');
    });

    it('should call onSuccess callback', async () => {
      const { result } = renderHook(() => useCardOperation({ autoLoad: false }));

      const mockOperation = jest.fn().mockResolvedValue({
        success: true,
        message: 'Done',
        data: { cardId: '1' },
      });

      const onSuccess = jest.fn();

      await act(async () => {
        await result.current.executeOperation(
          mockOperation,
          'Success',
          { onSuccess }
        );
      });

      expect(onSuccess).toHaveBeenCalledWith({ cardId: '1' });
    });

    it('should handle operation failure', async () => {
      const { result } = renderHook(() => useCardOperation({ autoLoad: false }));

      const mockOperation = jest.fn().mockResolvedValue({
        success: false,
        message: 'Card already blocked',
      });

      const onError = jest.fn();

      await act(async () => {
        await result.current.executeOperation(
          mockOperation,
          'Block Card',
          { onError }
        );
      });

      expect(result.current.result?.success).toBe(false);
      expect(result.current.result?.title).toBe('Error');
      expect(onError).toHaveBeenCalledWith('Card already blocked');
    });

    it('should handle operation exception', async () => {
      const { result } = renderHook(() => useCardOperation({ autoLoad: false }));

      const mockOperation = jest.fn().mockRejectedValue(new Error('Network error'));

      const onError = jest.fn();

      let response;
      await act(async () => {
        response = await result.current.executeOperation(
          mockOperation,
          'Block Card',
          { onError }
        );
      });

      expect(response).toEqual({ success: false, message: 'Network error' });
      expect(result.current.result?.success).toBe(false);
      expect(onError).toHaveBeenCalledWith('Network error');
    });

    it('should handle non-Error exception', async () => {
      const { result } = renderHook(() => useCardOperation({ autoLoad: false }));

      const mockOperation = jest.fn().mockRejectedValue('Unknown error');

      await act(async () => {
        await result.current.executeOperation(mockOperation, 'Block Card');
      });

      expect(result.current.result?.message).toBe('Error desconocido');
    });
  });

  describe('router', () => {
    it('should expose router', () => {
      mockRepository.getCardById.mockResolvedValue(mockCard);
      
      const { result } = renderHook(() => useCardOperation({ autoLoad: false }));

      expect(result.current.router).toBe(mockRouter);
    });
  });
});
