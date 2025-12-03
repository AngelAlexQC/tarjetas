/**
 * Card Defer Hook
 * 
 * Hook especializado para operaciones de diferimiento de pagos.
 */

import type { CardActionResult, DeferRequest, DeferSimulation } from '@/repositories';
import { cardRepository$ } from '@/repositories';
import { loggers } from '@/utils/logger';
import { useCallback, useState } from 'react';

const log = loggers.cards;

interface UseDeferState {
  simulation: DeferSimulation | null;
  isLoading: boolean;
  isSimulating: boolean;
  error: string | null;
}

/**
 * Hook para operaciones de diferimiento de pagos.
 */
export function useCardDefer() {
  const [state, setState] = useState<UseDeferState>({
    simulation: null,
    isLoading: false,
    isSimulating: false,
    error: null,
  });

  const repository = cardRepository$();

  // Simular diferimiento
  const simulateDefer = useCallback(async (
    cardId: string, 
    amount: number, 
    months: number
  ): Promise<DeferSimulation | null> => {
    setState(prev => ({ ...prev, isSimulating: true, error: null }));
    try {
      const simulation = await repository.simulateDefer(cardId, amount, months);
      setState(prev => ({ ...prev, simulation, isSimulating: false }));
      return simulation;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al simular diferimiento';
      setState(prev => ({ ...prev, error: message, isSimulating: false }));
      log.error('Error simulating defer:', error);
      return null;
    }
  }, [repository]);

  // Confirmar diferimiento
  const confirmDefer = useCallback(async (request: DeferRequest): Promise<CardActionResult> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await repository.deferPayment(request);
      setState(prev => ({ ...prev, isLoading: false, simulation: null }));
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al diferir pago';
      setState(prev => ({ ...prev, error: message, isLoading: false }));
      log.error('Error deferring payment:', error);
      return { success: false, message };
    }
  }, [repository]);

  // Limpiar simulación
  const clearSimulation = useCallback(() => {
    setState(prev => ({ ...prev, simulation: null }));
  }, []);

  return {
    ...state,
    simulateDefer,
    confirmDefer,
    clearSimulation,
  };
}
