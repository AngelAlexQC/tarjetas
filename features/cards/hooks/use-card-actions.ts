/**
 * useCardActions Hook
 * 
 * Hook legacy para mantener compatibilidad con el código existente.
 * Para nuevas funcionalidades, usar el hook `useCards` de @/hooks/use-cards.
 * 
 * @deprecated Usa `useCards` de @/hooks/use-cards para nuevas funcionalidades
 */

import { CardActionType } from '@/constants/card-actions';
import { useState } from 'react';
import { Alert } from 'react-native';
import { cardRepository$, CardActionResult } from '@/repositories';

// Tipo extendido para incluir acciones adicionales no definidas en CardActionType
type ExtendedActionType = CardActionType | 'notifications';

export function useCardActions(cardId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const repository = cardRepository$();

  const executeAction = async (
    actionType: ExtendedActionType,
    params?: any
  ): Promise<CardActionResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      let result: CardActionResult;

      switch (actionType) {
        case 'block':
          result = await repository.blockCard({ cardId, type: 'temporary' });
          break;
        case 'unblock':
          result = await repository.unblockCard(cardId);
          break;
        case 'limits':
          const limits = await repository.getLimits(cardId);
          result = { success: true, message: 'Límites obtenidos', data: limits };
          break;
        case 'statement':
          const statement = await repository.getStatement(cardId, params?.month, params?.year);
          result = { success: true, message: 'Estado de cuenta generado', data: statement };
          break;
        case 'defer':
          result = await repository.deferPayment({ cardId, transactionIds: [], months: params?.months || 3 });
          break;
        case 'advances':
          result = await repository.requestAdvance({ cardId, amount: params?.amount, months: 1, destinationAccountId: '' });
          break;
        case 'pin':
          result = await repository.changePin({ cardId, newPin: params?.newPin, currentPin: params?.oldPin });
          break;
        case 'notifications':
          result = await repository.updateNotifications(cardId, params?.settings);
          break;
        default:
          result = { success: false, message: 'Acción no soportada' };
      }
      
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
