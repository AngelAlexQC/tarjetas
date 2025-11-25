/**
 * useCards Hook
 * 
 * Hook para acceder a las operaciones de tarjetas usando el repositorio.
 */

import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { cardRepository$ } from '@/repositories';
import type { 
  Card, 
  CardActionResult, 
  BlockCardRequest, 
  CardLimits,
  DeferRequest,
  DeferSimulation,
  CashAdvanceRequest,
  TravelNotice,
  ReplaceCardRequest,
  Subscription,
  Rewards,
  DynamicCvv,
  NotificationSettings,
  Transaction,
  Account,
  Statement,
  ChangePinRequest,
} from '@/repositories';

interface UseCardsState {
  cards: Card[];
  isLoading: boolean;
  error: string | null;
}

export function useCards() {
  const [state, setState] = useState<UseCardsState>({
    cards: [],
    isLoading: false,
    error: null,
  });

  const repository = cardRepository$();

  const setLoading = (isLoading: boolean) => 
    setState(prev => ({ ...prev, isLoading, error: null }));

  const setError = (error: string) => 
    setState(prev => ({ ...prev, error, isLoading: false }));

  // Obtener todas las tarjetas
  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const cards = await repository.getCards();
      setState({ cards, isLoading: false, error: null });
      return cards;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al obtener tarjetas';
      setError(message);
      return [];
    }
  }, [repository]);

  // Obtener tarjeta por ID
  const getCardById = useCallback(async (id: string): Promise<Card | undefined> => {
    try {
      return await repository.getCardById(id);
    } catch (error) {
      console.error('Error getting card:', error);
      return undefined;
    }
  }, [repository]);

  // Bloquear tarjeta
  const blockCard = useCallback(async (request: BlockCardRequest): Promise<CardActionResult> => {
    setLoading(true);
    try {
      const result = await repository.blockCard(request);
      setState(prev => ({ ...prev, isLoading: false }));
      if (!result.success) {
        Alert.alert('Error', result.message);
      }
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al bloquear tarjeta';
      setError(message);
      Alert.alert('Error', message);
      return { success: false, message };
    }
  }, [repository]);

  // Desbloquear tarjeta
  const unblockCard = useCallback(async (cardId: string): Promise<CardActionResult> => {
    setLoading(true);
    try {
      const result = await repository.unblockCard(cardId);
      setState(prev => ({ ...prev, isLoading: false }));
      if (!result.success) {
        Alert.alert('Error', result.message);
      }
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al desbloquear tarjeta';
      setError(message);
      Alert.alert('Error', message);
      return { success: false, message };
    }
  }, [repository]);

  // Obtener límites
  const getLimits = useCallback(async (cardId: string): Promise<CardLimits | null> => {
    try {
      return await repository.getLimits(cardId);
    } catch (error) {
      console.error('Error getting limits:', error);
      return null;
    }
  }, [repository]);

  // Actualizar límites
  const updateLimits = useCallback(async (cardId: string, limits: Partial<CardLimits>): Promise<CardActionResult> => {
    setLoading(true);
    try {
      const result = await repository.updateLimits(cardId, limits);
      setState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar límites';
      setError(message);
      return { success: false, message };
    }
  }, [repository]);

  // Obtener transacciones diferibles
  const getDeferrableTransactions = useCallback(async (cardId: string): Promise<Transaction[]> => {
    try {
      return await repository.getDeferrableTransactions(cardId);
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }, [repository]);

  // Simular diferimiento
  const simulateDefer = useCallback(async (cardId: string, amount: number, months: number): Promise<DeferSimulation | null> => {
    try {
      return await repository.simulateDefer(cardId, amount, months);
    } catch (error) {
      console.error('Error simulating defer:', error);
      return null;
    }
  }, [repository]);

  // Diferir pago
  const deferPayment = useCallback(async (request: DeferRequest): Promise<CardActionResult> => {
    setLoading(true);
    try {
      const result = await repository.deferPayment(request);
      setState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al diferir pago';
      setError(message);
      return { success: false, message };
    }
  }, [repository]);

  // Obtener cuentas para avance
  const getAccounts = useCallback(async (): Promise<Account[]> => {
    try {
      return await repository.getAccounts();
    } catch (error) {
      console.error('Error getting accounts:', error);
      return [];
    }
  }, [repository]);

  // Solicitar avance de efectivo
  const requestAdvance = useCallback(async (request: CashAdvanceRequest): Promise<CardActionResult> => {
    setLoading(true);
    try {
      const result = await repository.requestAdvance(request);
      setState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al solicitar avance';
      setError(message);
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
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cambiar PIN';
      setError(message);
      return { success: false, message };
    }
  }, [repository]);

  // Obtener estado de cuenta
  const getStatement = useCallback(async (cardId: string, month?: number, year?: number): Promise<Statement | null> => {
    try {
      return await repository.getStatement(cardId, month, year);
    } catch (error) {
      console.error('Error getting statement:', error);
      return null;
    }
  }, [repository]);

  // Crear aviso de viaje
  const createTravelNotice = useCallback(async (notice: TravelNotice): Promise<CardActionResult> => {
    setLoading(true);
    try {
      const result = await repository.createTravelNotice(notice);
      setState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al crear aviso de viaje';
      setError(message);
      return { success: false, message };
    }
  }, [repository]);

  // Solicitar reemplazo
  const requestReplacement = useCallback(async (request: ReplaceCardRequest): Promise<CardActionResult> => {
    setLoading(true);
    try {
      const result = await repository.requestReplacement(request);
      setState(prev => ({ ...prev, isLoading: false }));
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al solicitar reemplazo';
      setError(message);
      return { success: false, message };
    }
  }, [repository]);

  // Obtener suscripciones
  const getSubscriptions = useCallback(async (cardId: string): Promise<Subscription[]> => {
    try {
      return await repository.getSubscriptions(cardId);
    } catch (error) {
      console.error('Error getting subscriptions:', error);
      return [];
    }
  }, [repository]);

  // Toggle suscripción
  const toggleSubscription = useCallback(async (cardId: string, subscriptionId: string): Promise<CardActionResult> => {
    try {
      return await repository.toggleSubscription(cardId, subscriptionId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al modificar suscripción';
      return { success: false, message };
    }
  }, [repository]);

  // Obtener recompensas
  const getRewards = useCallback(async (cardId: string): Promise<Rewards | null> => {
    try {
      return await repository.getRewards(cardId);
    } catch (error) {
      console.error('Error getting rewards:', error);
      return null;
    }
  }, [repository]);

  // Generar CVV dinámico
  const generateDynamicCvv = useCallback(async (cardId: string): Promise<DynamicCvv | null> => {
    try {
      return await repository.generateDynamicCvv(cardId);
    } catch (error) {
      console.error('Error generating CVV:', error);
      return null;
    }
  }, [repository]);

  // Actualizar notificaciones
  const updateNotifications = useCallback(async (cardId: string, settings: NotificationSettings): Promise<CardActionResult> => {
    try {
      return await repository.updateNotifications(cardId, settings);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar notificaciones';
      return { success: false, message };
    }
  }, [repository]);

  return {
    // Estado
    ...state,
    
    // Acciones principales
    fetchCards,
    getCardById,
    
    // Bloqueo
    blockCard,
    unblockCard,
    
    // Límites
    getLimits,
    updateLimits,
    
    // Diferir
    getDeferrableTransactions,
    simulateDefer,
    deferPayment,
    
    // Avance de efectivo
    getAccounts,
    requestAdvance,
    
    // PIN
    changePin,
    
    // Estado de cuenta
    getStatement,
    
    // Viaje
    createTravelNotice,
    
    // Reemplazo
    requestReplacement,
    
    // Suscripciones
    getSubscriptions,
    toggleSubscription,
    
    // Recompensas
    getRewards,
    
    // CVV
    generateDynamicCvv,
    
    // Notificaciones
    updateNotifications,
  };
}
