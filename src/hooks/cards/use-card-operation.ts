/**
 * Card Operation Hook
 * 
 * Hook reutilizable para pantallas de operaciones de tarjetas.
 * Elimina código duplicado de carga de tarjeta y manejo de estados.
 */

import type { Card, OperationResult } from '@/repositories';
import { cardRepository$ } from '@/repositories';
import { loggers } from '@/utils/logger';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

const log = loggers.cards;

interface UseCardOperationState {
  card: Card | undefined;
  isLoadingCard: boolean;
  isProcessing: boolean;
  result: OperationResult | null;
  error: string | null;
}

interface UseCardOperationOptions {
  /** Si es false, no carga la tarjeta automáticamente */
  autoLoad?: boolean;
}

interface ExecuteOperationOptions<T> {
  receiptPrefix?: string;
  successMessage?: string;
  onSuccess?: (data?: T) => void;
  onError?: (message: string) => void;
}

/**
 * Hook para operaciones de tarjetas individuales.
 * Maneja la carga de tarjeta, estados de procesamiento y resultados.
 */
export function useCardOperation(options: UseCardOperationOptions = {}) {
  const { autoLoad = true } = options;
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [state, setState] = useState<UseCardOperationState>({
    card: undefined,
    isLoadingCard: autoLoad,
    isProcessing: false,
    result: null,
    error: null,
  });

  const repository = cardRepository$();

  // Cargar tarjeta
  const loadCard = useCallback(async (cardId?: string) => {
    const targetId = cardId || id;
    if (!targetId) {
      setState(prev => ({ 
        ...prev, 
        isLoadingCard: false, 
        error: 'ID de tarjeta no proporcionado' 
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoadingCard: true, error: null }));
    
    try {
      const card = await repository.getCardById(targetId);
      setState(prev => ({ ...prev, card, isLoadingCard: false }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cargar tarjeta';
      setState(prev => ({ ...prev, isLoadingCard: false, error: message }));
      log.error('Error loading card:', error);
    }
  }, [id, repository]);

  // Auto-cargar tarjeta
  useEffect(() => {
    if (autoLoad && id) {
      loadCard();
    }
  }, [autoLoad, id, loadCard]);

  // Iniciar procesamiento
  const startProcessing = useCallback(() => {
    setState(prev => ({ ...prev, isProcessing: true, error: null }));
  }, []);

  // Finalizar con resultado
  const finishWithResult = useCallback((result: OperationResult) => {
    setState(prev => ({ ...prev, isProcessing: false, result }));
  }, []);

  // Finalizar con error
  const finishWithError = useCallback((message: string) => {
    setState(prev => ({ 
      ...prev, 
      isProcessing: false, 
      result: {
        success: false,
        title: 'Error',
        message,
      }
    }));
  }, []);

  // Reset del resultado
  const resetResult = useCallback(() => {
    setState(prev => ({ ...prev, result: null }));
  }, []);

  // Ejecutar operación con manejo automático de estados
  const executeOperation = useCallback(async <T>(
    operation: () => Promise<{ success: boolean; message: string; data?: T }>,
    successTitle: string,
    executeOptions?: ExecuteOperationOptions<T>
  ) => {
    startProcessing();
    
    try {
      const response = await operation();
      
      const operationResult: OperationResult = {
        success: response.success,
        title: response.success ? successTitle : 'Error',
        message: response.success && executeOptions?.successMessage 
          ? executeOptions.successMessage 
          : response.message,
        receiptId: response.success && executeOptions?.receiptPrefix 
          ? `${executeOptions.receiptPrefix}-${Math.floor(Math.random() * 10000)}`
          : undefined,
      };
      
      finishWithResult(operationResult);
      
      if (response.success) {
        executeOptions?.onSuccess?.(response.data);
      } else {
        executeOptions?.onError?.(response.message);
      }
      
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      finishWithError(message);
      executeOptions?.onError?.(message);
      return { success: false, message };
    }
  }, [startProcessing, finishWithResult, finishWithError]);

  return {
    // Estado
    ...state,
    cardId: id,
    router,
    
    // Acciones
    loadCard,
    startProcessing,
    finishWithResult,
    finishWithError,
    resetResult,
    executeOperation,
  };
}
