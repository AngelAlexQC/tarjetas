/**
 * Card Mutations Hook Tests
 */

import { renderHook, act } from '@testing-library/react-native';
import { cardRepository$ } from '@/repositories';
import { useCardMutations } from '../use-card-mutations';

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

describe('useCardMutations', () => {
  const mockRepository = {
    blockCard: jest.fn(),
    unblockCard: jest.fn(),
    updateLimits: jest.fn(),
    changePin: jest.fn(),
    createTravelNotice: jest.fn(),
    requestReplacement: jest.fn(),
    toggleSubscription: jest.fn(),
    updateNotifications: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (cardRepository$ as jest.Mock).mockReturnValue(mockRepository);
  });

  describe('blockCard', () => {
    it('should block card successfully', async () => {
      mockRepository.blockCard.mockResolvedValue({
        success: true,
        message: 'Tarjeta bloqueada',
      });

      const { result } = renderHook(() => useCardMutations());

      let response;
      await act(async () => {
        response = await result.current.blockCard({
          cardId: '1',
          type: 'temporary',
        });
      });

      expect(response).toEqual({
        success: true,
        message: 'Tarjeta bloqueada',
      });
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle block card error', async () => {
      mockRepository.blockCard.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useCardMutations());

      let response;
      await act(async () => {
        response = await result.current.blockCard({
          cardId: '1',
          type: 'temporary',
        });
      });

      expect(response).toEqual({
        success: false,
        message: 'Network error',
      });
      expect(result.current.error).toBe('Network error');
    });
  });

  describe('unblockCard', () => {
    it('should unblock card successfully', async () => {
      mockRepository.unblockCard.mockResolvedValue({
        success: true,
        message: 'Tarjeta desbloqueada',
      });

      const { result } = renderHook(() => useCardMutations());

      let response;
      await act(async () => {
        response = await result.current.unblockCard('1');
      });

      expect(response).toEqual({
        success: true,
        message: 'Tarjeta desbloqueada',
      });
    });
  });

  describe('changePin', () => {
    it('should change PIN successfully', async () => {
      mockRepository.changePin.mockResolvedValue({
        success: true,
        message: 'PIN actualizado',
      });

      const { result } = renderHook(() => useCardMutations());

      let response;
      await act(async () => {
        response = await result.current.changePin({
          cardId: '1',
          newPin: '5678',
          currentPin: '1234',
        });
      });

      expect(response).toEqual({
        success: true,
        message: 'PIN actualizado',
      });
    });
  });

  describe('updateLimits', () => {
    it('should update limits successfully', async () => {
      mockRepository.updateLimits.mockResolvedValue({
        success: true,
        message: 'Límites actualizados',
      });

      const { result } = renderHook(() => useCardMutations());

      let response;
      await act(async () => {
        response = await result.current.updateLimits('1', {
          dailyAtm: 5000,
        });
      });

      expect(response).toEqual({
        success: true,
        message: 'Límites actualizados',
      });
      expect(mockRepository.updateLimits).toHaveBeenCalledWith('1', {
        dailyAtm: 5000,
      });
    });
  });
});
