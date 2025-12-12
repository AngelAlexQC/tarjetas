/**
 * Card Mutations Hook Tests
 */

import { cardRepository$ } from '@/repositories';
import { act, renderHook } from '@testing-library/react-native';
import { useCardMutations } from '../use-card-mutations';

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

    it('should handle updateLimits error', async () => {
      mockRepository.updateLimits.mockRejectedValue(new Error('Límite excedido'));

      const { result } = renderHook(() => useCardMutations());

      let response;
      await act(async () => {
        response = await result.current.updateLimits('1', { dailyAtm: 100000 });
      });

      expect(response).toEqual({
        success: false,
        message: 'Límite excedido',
      });
    });
  });

  describe('createTravelNotice', () => {
    it('should create travel notice successfully', async () => {
      mockRepository.createTravelNotice.mockResolvedValue({
        success: true,
        message: 'Aviso de viaje creado',
      });

      const { result } = renderHook(() => useCardMutations());

      const notice = {
        cardId: '1',
        startDate: '2025-01-15',
        endDate: '2025-01-30',
        destinations: ['USA', 'Canada'],
      };

      let response;
      await act(async () => {
        response = await result.current.createTravelNotice(notice);
      });

      expect(response).toEqual({
        success: true,
        message: 'Aviso de viaje creado',
      });
      expect(mockRepository.createTravelNotice).toHaveBeenCalledWith(notice);
    });

    it('should handle createTravelNotice error', async () => {
      mockRepository.createTravelNotice.mockRejectedValue(new Error('Fechas inválidas'));

      const { result } = renderHook(() => useCardMutations());

      let response;
      await act(async () => {
        response = await result.current.createTravelNotice({
          cardId: '1',
          startDate: 'invalid',
          endDate: 'invalid',
          destinations: [],
        });
      });

      expect(response).toEqual({
        success: false,
        message: 'Fechas inválidas',
      });
      expect(result.current.error).toBe('Fechas inválidas');
    });
  });

  describe('requestReplacement', () => {
    it('should request replacement successfully', async () => {
      mockRepository.requestReplacement.mockResolvedValue({
        success: true,
        message: 'Solicitud de reemplazo enviada',
      });

      const { result } = renderHook(() => useCardMutations());

      const request = {
        cardId: '1',
        reason: 'lost' as const,
        deliveryAddress: {
          street: '123 Main St',
          city: 'Ciudad',
          state: 'Estado',
          zipCode: '12345',
          country: 'País',
        },
      };

      let response;
      await act(async () => {
        response = await result.current.requestReplacement(request);
      });

      expect(response).toEqual({
        success: true,
        message: 'Solicitud de reemplazo enviada',
      });
      expect(mockRepository.requestReplacement).toHaveBeenCalledWith(request);
    });

    it('should handle requestReplacement error', async () => {
      mockRepository.requestReplacement.mockRejectedValue(new Error('Tarjeta ya tiene reemplazo pendiente'));

      const { result } = renderHook(() => useCardMutations());

      let response;
      await act(async () => {
        response = await result.current.requestReplacement({
          cardId: '1',
          reason: 'damaged',
        });
      });

      expect(response).toEqual({
        success: false,
        message: 'Tarjeta ya tiene reemplazo pendiente',
      });
    });
  });

  describe('toggleSubscription', () => {
    it('should toggle subscription successfully', async () => {
      mockRepository.toggleSubscription.mockResolvedValue({
        success: true,
        message: 'Suscripción actualizada',
      });

      const { result } = renderHook(() => useCardMutations());

      let response;
      await act(async () => {
        response = await result.current.toggleSubscription('card-1', 'sub-123');
      });

      expect(response).toEqual({
        success: true,
        message: 'Suscripción actualizada',
      });
      expect(mockRepository.toggleSubscription).toHaveBeenCalledWith('card-1', 'sub-123');
    });

    it('should handle toggleSubscription error', async () => {
      mockRepository.toggleSubscription.mockRejectedValue(new Error('Suscripción no encontrada'));

      const { result } = renderHook(() => useCardMutations());

      let response;
      await act(async () => {
        response = await result.current.toggleSubscription('card-1', 'invalid');
      });

      expect(response).toEqual({
        success: false,
        message: 'Suscripción no encontrada',
      });
    });
  });

  describe('updateNotifications', () => {
    it('should update notifications successfully', async () => {
      mockRepository.updateNotifications.mockResolvedValue({
        success: true,
        message: 'Notificaciones actualizadas',
      });

      const { result } = renderHook(() => useCardMutations());

      const settings = {
        purchases: true,
        payments: false,
        transactionAlerts: true,
        securityAlerts: true,
      };

      let response;
      await act(async () => {
        response = await result.current.updateNotifications('card-1', settings);
      });

      expect(response).toEqual({
        success: true,
        message: 'Notificaciones actualizadas',
      });
      expect(mockRepository.updateNotifications).toHaveBeenCalledWith('card-1', settings);
    });

    it('should handle updateNotifications error', async () => {
      mockRepository.updateNotifications.mockRejectedValue(new Error('Error al guardar'));

      const { result } = renderHook(() => useCardMutations());

      let response;
      await act(async () => {
        response = await result.current.updateNotifications('card-1', { purchases: true });
      });

      expect(response).toEqual({
        success: false,
        message: 'Error al guardar',
      });
    });
  });

  describe('unblockCard error handling', () => {
    it('should handle unblock card error', async () => {
      mockRepository.unblockCard.mockRejectedValue(new Error('PIN incorrecto'));

      const { result } = renderHook(() => useCardMutations());

      let response;
      await act(async () => {
        response = await result.current.unblockCard('1');
      });

      expect(response).toEqual({
        success: false,
        message: 'PIN incorrecto',
      });
      expect(result.current.error).toBe('PIN incorrecto');
    });
  });

  describe('changePin error handling', () => {
    it('should handle change PIN error', async () => {
      mockRepository.changePin.mockRejectedValue(new Error('PIN actual incorrecto'));

      const { result } = renderHook(() => useCardMutations());

      let response;
      await act(async () => {
        response = await result.current.changePin({
          cardId: '1',
          currentPin: '0000',
          newPin: '1234',
        });
      });

      expect(response).toEqual({
        success: false,
        message: 'PIN actual incorrecto',
      });
    });
  });

  describe('error with non-Error objects', () => {
    it('should handle non-Error throws with default message', async () => {
      mockRepository.blockCard.mockRejectedValue('string error');

      const { result } = renderHook(() => useCardMutations());

      let response;
      await act(async () => {
        response = await result.current.blockCard({
          cardId: '1',
          type: 'permanent',
        });
      });

      expect(response).toEqual({
        success: false,
        message: 'Error al bloquear tarjeta',
      });
    });
  });
});
