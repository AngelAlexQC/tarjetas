/**
 * useFeatures Hook
 * 
 * Hook para acceder a las features habilitadas según el tenant actual.
 * Permite feature flags dinámicos basados en la configuración del backend.
 */

import { getFeaturesFromTenant } from '@/constants/tenant-themes';
import { useTenantTheme } from '@/contexts/tenant-theme-context';
import type { CardActionType } from '@/constants/card-actions';
import { useCallback, useMemo } from 'react';

interface UseFeatures {
  hasCards: boolean;
  hasTransfers: boolean;
  hasLoans: boolean;
  hasInsurance: boolean;
  allowedCardTypes: ('credit' | 'debit' | 'virtual')[];
  allowedCardActions: string[];
  maxCardLimit: number | undefined;
  allowedInsuranceTypes: string[];
  isActionAvailable: (action: CardActionType) => boolean;
  isCardTypeAvailable: (type: 'credit' | 'debit' | 'virtual') => boolean;
}

export function useFeatures(): UseFeatures {
  const { currentTheme } = useTenantTheme();
  const features = getFeaturesFromTenant(currentTheme);

  // Memoizar las funciones de verificación para evitar re-renders innecesarios
  const isActionAvailable = useCallback(
    (action: CardActionType) => features.cards.allowedActions.includes(action),
    [features.cards.allowedActions]
  );

  const isCardTypeAvailable = useCallback(
    (type: 'credit' | 'debit' | 'virtual') => features.cards.allowedTypes.includes(type),
    [features.cards.allowedTypes]
  );

  // Memoizar el objeto de retorno
  return useMemo(() => ({
    hasCards: features.cards.enabled,
    hasTransfers: features.transfers.enabled,
    hasLoans: features.loans.enabled,
    hasInsurance: features.insurance.enabled,
    allowedCardTypes: features.cards.allowedTypes,
    allowedCardActions: features.cards.allowedActions,
    maxCardLimit: features.cards.maxCreditLimit,
    allowedInsuranceTypes: features.insurance.allowedTypes,
    isActionAvailable,
    isCardTypeAvailable,
  }), [features, isActionAvailable, isCardTypeAvailable]);
}
