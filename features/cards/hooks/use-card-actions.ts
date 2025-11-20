/**
 * Hook personalizado para gestionar acciones de tarjetas
 */

import { useState } from 'react';
import { Alert } from 'react-native';
import { cardService, CardActionResult } from '../services/card-service';
import { CardActionType } from '@/constants/card-actions';

export function useCardActions(cardId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeAction = async (
    actionType: CardActionType,
    params?: any
  ): Promise<CardActionResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await cardService.executeAction(cardId, actionType, params);
      
      if (result.success) {
        Alert.alert('Éxito', result.message);
      } else {
        Alert.alert('Error', result.message);
        setError(result.message);
      }
      
      return result;
    } catch {
      const errorMessage = 'Error al ejecutar la acción';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const blockCard = () => executeAction('block');
  const unblockCard = () => executeAction('unblock');
  const getLimits = () => executeAction('limits');
  const getStatement = () => executeAction('statement');

  const deferPayment = (amount: number, months: number) =>
    executeAction('defer', { amount, months });

  const requestAdvance = (amount: number) =>
    executeAction('advances', { amount });

  const changePin = (oldPin: string, newPin: string) =>
    executeAction('pin', { oldPin, newPin });

  const updateNotifications = (settings: any) =>
    executeAction('notifications', { settings });

  return {
    isLoading,
    error,
    executeAction,
    blockCard,
    unblockCard,
    getLimits,
    getStatement,
    deferPayment,
    requestAdvance,
    changePin,
    updateNotifications,
  };
}
