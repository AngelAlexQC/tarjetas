/**
 * Card Queries Hook
 * 
 * Hook especializado para operaciones de lectura de tarjetas.
 * Sigue el principio de separación de responsabilidades.
 */

import { useTenantTheme } from '@/contexts/tenant-theme-context';
import type {
    Account,
    Card,
    CardLimits,
    DynamicCvv,
    Rewards,
    Statement,
    Subscription,
    Transaction
} from '@/repositories';
import { cardRepository$ } from '@/repositories';
import { loggers } from '@/utils/logger';
import { useCallback, useEffect, useRef, useState } from 'react';

const log = loggers.cards;

interface UseCardQueriesState {
  cards: Card[];
  isLoading: boolean;
  error: string | null;
}

interface UseCardQueriesOptions {
  /** Si es true, carga las tarjetas automáticamente al montar */
  autoFetch?: boolean;
}

/**
 * Hook para operaciones de lectura de tarjetas.
 * No modifica estado, solo consulta datos.
 */
export function useCardQueries(options: UseCardQueriesOptions = {}) {
  const { autoFetch = false } = options;
  const { currentTheme } = useTenantTheme();
  
  const [state, setState] = useState<UseCardQueriesState>({
    cards: [],
    isLoading: true,
    error: null,
  });

  const repository = cardRepository$();
  const hasFetched = useRef(false);
  const previousTenantSlug = useRef<string | null>(null);

  // Obtener todas las tarjetas
  const fetchCards = useCallback(async (): Promise<Card[]> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const cards = await repository.getCards();
      setState({ cards, isLoading: false, error: null });
      return cards;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al obtener tarjetas';
      setState(prev => ({ ...prev, error: message, isLoading: false }));
      log.error('Error fetching cards:', error);
      return [];
    }
  }, [repository]);

  // Auto-fetch al montar si está habilitado (solo una vez)
  useEffect(() => {
    if (autoFetch && !hasFetched.current) {
      hasFetched.current = true;
      fetchCards();
    }
  }, [autoFetch, fetchCards]);

  // Re-fetch cuando cambia el tenant (institución)
  useEffect(() => {
    const currentSlug = currentTheme?.slug || null;
    
    if (previousTenantSlug.current !== null && previousTenantSlug.current !== currentSlug) {
      log.info('Tenant changed, refreshing cards...');
      setState({ cards: [], isLoading: true, error: null });
      fetchCards();
    }
    
    previousTenantSlug.current = currentSlug;
  }, [currentTheme?.slug, fetchCards]);

  // Obtener tarjeta por ID
  const getCardById = useCallback(async (id: string): Promise<Card | undefined> => {
    try {
      return await repository.getCardById(id);
    } catch (error) {
      log.error('Error getting card:', error);
      return undefined;
    }
  }, [repository]);

  // Obtener límites de tarjeta
  const getLimits = useCallback(async (cardId: string): Promise<CardLimits | null> => {
    try {
      return await repository.getLimits(cardId);
    } catch (error) {
      log.error('Error getting limits:', error);
      return null;
    }
  }, [repository]);

  // Obtener estado de cuenta
  const getStatement = useCallback(async (
    cardId: string, 
    month?: number, 
    year?: number
  ): Promise<Statement | null> => {
    try {
      return await repository.getStatement(cardId, month, year);
    } catch (error) {
      log.error('Error getting statement:', error);
      return null;
    }
  }, [repository]);

  // Obtener suscripciones
  const getSubscriptions = useCallback(async (cardId: string): Promise<Subscription[]> => {
    try {
      return await repository.getSubscriptions(cardId);
    } catch (error) {
      log.error('Error getting subscriptions:', error);
      return [];
    }
  }, [repository]);

  // Obtener recompensas
  const getRewards = useCallback(async (cardId: string): Promise<Rewards | null> => {
    try {
      return await repository.getRewards(cardId);
    } catch (error) {
      log.error('Error getting rewards:', error);
      return null;
    }
  }, [repository]);

  // Generar CVV dinámico
  const generateDynamicCvv = useCallback(async (cardId: string): Promise<DynamicCvv | null> => {
    try {
      return await repository.generateDynamicCvv(cardId);
    } catch (error) {
      log.error('Error generating CVV:', error);
      return null;
    }
  }, [repository]);

  // Obtener transacciones diferibles
  const getDeferrableTransactions = useCallback(async (cardId: string): Promise<Transaction[]> => {
    try {
      return await repository.getDeferrableTransactions(cardId);
    } catch (error) {
      log.error('Error getting deferrable transactions:', error);
      return [];
    }
  }, [repository]);

  // Obtener cuentas para avance de efectivo
  const getAccounts = useCallback(async (): Promise<Account[]> => {
    try {
      return await repository.getAccounts();
    } catch (error) {
      log.error('Error getting accounts:', error);
      return [];
    }
  }, [repository]);

  return {
    // Estado
    ...state,
    
    // Queries
    fetchCards,
    getCardById,
    getLimits,
    getStatement,
    getSubscriptions,
    getRewards,
    generateDynamicCvv,
    getDeferrableTransactions,
    getAccounts,
  };
}
