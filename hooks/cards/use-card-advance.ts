/**
 * Card Advance Hook
 * 
 * Hook especializado para operaciones de avance de efectivo.
 */

import type { Account, CardActionResult, CashAdvanceRequest } from '@/repositories';
import { cardRepository$ } from '@/repositories';
import { loggers } from '@/utils/logger';
import { useCallback, useState } from 'react';

const log = loggers.cards;

interface UseAdvanceState {
  accounts: Account[];
  isLoading: boolean;
  isLoadingAccounts: boolean;
  error: string | null;
}

/**
 * Hook para operaciones de avance de efectivo.
 */
export function useCardAdvance() {
  const [state, setState] = useState<UseAdvanceState>({
    accounts: [],
    isLoading: false,
    isLoadingAccounts: false,
    error: null,
  });

  const repository = cardRepository$();

  // Cargar cuentas disponibles para avance
  const loadAccounts = useCallback(async (): Promise<Account[]> => {
    setState(prev => ({ ...prev, isLoadingAccounts: true, error: null }));
    try {
      const accounts = await repository.getAccounts();
      setState(prev => ({ ...prev, accounts, isLoadingAccounts: false }));
      return accounts;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar cuentas';
      setState(prev => ({ ...prev, error: message, isLoadingAccounts: false }));
      log.error('Error loading accounts:', error);
      return [];
    }
  }, [repository]);

  // Solicitar avance de efectivo
  const requestAdvance = useCallback(async (request: CashAdvanceRequest): Promise<CardActionResult> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await repository.requestAdvance(request);
      setState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al solicitar avance';
      setState(prev => ({ ...prev, error: message, isLoading: false }));
      log.error('Error requesting advance:', error);
      return { success: false, message };
    }
  }, [repository]);

  return {
    ...state,
    loadAccounts,
    requestAdvance,
  };
}
