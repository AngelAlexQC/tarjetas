/**
 * Card Mutations Hook
 * 
 * Hook especializado para operaciones de escritura de tarjetas.
 * Maneja bloqueo, desbloqueo, actualización de límites, etc.
 */

import { loggers } from '@/core/logging';
import type {
    BlockCardRequest,
    CardActionResult,
    CardLimits,
    ChangePinRequest,
    NotificationSettings,
    ReplaceCardRequest,
    TravelNotice,
} from '@/repositories';
import { cardRepository$ } from '@/repositories';
import { useCallback, useState } from 'react';

const log = loggers.cards;

interface UseMutationState {
  isLoading: boolean;
  error: string | null;
}

/**
 * Resultado de una mutación con información adicional.
 */
export interface MutationResult<T = unknown> extends CardActionResult<T> {
  /** Indica si la operación está en progreso */
  isLoading?: boolean;
}

/**
 * Hook para operaciones de escritura de tarjetas.
 * No incluye lógica de UI (alerts, navegación).
 */
export function useCardMutations() {
  const [state, setState] = useState<UseMutationState>({
    isLoading: false,
    error: null,
  });

  const repository = cardRepository$();

  const setLoading = (isLoading: boolean) => 
    setState(prev => ({ ...prev, isLoading, error: null }));

  const setError = (error: string) => 
    setState(prev => ({ ...prev, error, isLoading: false }));

  // Bloquear tarjeta
  const blockCard = useCallback(async (request: BlockCardRequest): Promise<CardActionResult> => {
    setLoading(true);
    try {
      const result = await repository.blockCard(request);
      setState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al bloquear tarjeta';
      setError(message);
      log.error('Error blocking card:', error);
      return { success: false, message };
    }
  }, [repository]);

  // Desbloquear tarjeta
  const unblockCard = useCallback(async (cardId: string): Promise<CardActionResult> => {
    setLoading(true);
    try {
      const result = await repository.unblockCard(cardId);
      setState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al desbloquear tarjeta';
      setError(message);
      log.error('Error unblocking card:', error);
      return { success: false, message };
    }
  }, [repository]);

  // Actualizar límites
  const updateLimits = useCallback(async (
    cardId: string, 
    limits: Partial<CardLimits>
  ): Promise<CardActionResult> => {
    setLoading(true);
    try {
      const result = await repository.updateLimits(cardId, limits);
      setState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al actualizar límites';
      setError(message);
      log.error('Error updating limits:', error);
      return { success: false, message };
    }
  }, [repository]);

  // Cambiar PIN
  const changePin = useCallback(async (request: ChangePinRequest): Promise<CardActionResult> => {
    setLoading(true);
    try {
      const result = await repository.changePin(request);
      setState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al cambiar PIN';
      setError(message);
      log.error('Error changing PIN:', error);
      return { success: false, message };
    }
  }, [repository]);

  // Crear aviso de viaje
  const createTravelNotice = useCallback(async (notice: TravelNotice): Promise<CardActionResult> => {
    setLoading(true);
    try {
      const result = await repository.createTravelNotice(notice);
      setState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al crear aviso de viaje';
      setError(message);
      log.error('Error creating travel notice:', error);
      return { success: false, message };
    }
  }, [repository]);

  // Solicitar reemplazo de tarjeta
  const requestReplacement = useCallback(async (request: ReplaceCardRequest): Promise<CardActionResult> => {
    setLoading(true);
    try {
      const result = await repository.requestReplacement(request);
      setState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al solicitar reemplazo';
      setError(message);
      log.error('Error requesting replacement:', error);
      return { success: false, message };
    }
  }, [repository]);

  // Toggle suscripción
  const toggleSubscription = useCallback(async (
    cardId: string, 
    subscriptionId: string
  ): Promise<CardActionResult> => {
    try {
      return await repository.toggleSubscription(cardId, subscriptionId);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al modificar suscripción';
      log.error('Error toggling subscription:', error);
      return { success: false, message };
    }
  }, [repository]);

  // Actualizar notificaciones
  const updateNotifications = useCallback(async (
    cardId: string, 
    settings: NotificationSettings
  ): Promise<CardActionResult> => {
    try {
      return await repository.updateNotifications(cardId, settings);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Error al actualizar notificaciones';
      log.error('Error updating notifications:', error);
      return { success: false, message };
    }
  }, [repository]);

  return {
    // Estado
    ...state,
    
    // Mutations
    blockCard,
    unblockCard,
    updateLimits,
    changePin,
    createTravelNotice,
    requestReplacement,
    toggleSubscription,
    updateNotifications,
  };
}
