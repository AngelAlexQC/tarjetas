/**
 * useFeatures Hook - LibelulaSoft
 * 
 * Hook para acceder a las features habilitadas según el tenant actual.
 * Permite feature flags dinámicos basados en la configuración del backend.
 */

import { useTenantTheme } from '@/contexts/tenant-theme-context';
import type { CardActionType } from '@/constants/card-actions';

interface UseFeatures {
  // Features principales
  hasCards: boolean;
  hasTransfers: boolean;
  hasLoans: boolean;
  hasInsurance: boolean;

  // Configuración de tarjetas
  allowedCardTypes: Array<'credit' | 'debit' | 'virtual'>;
  allowedCardActions: string[];
  maxCardLimit: number | undefined;

  // Seguros
  allowedInsuranceTypes: string[];

  // Helpers
  isActionAvailable: (action: CardActionType) => boolean;
  isCardTypeAvailable: (type: 'credit' | 'debit' | 'virtual') => boolean;
}

/**
 * Hook para verificar features disponibles según el tenant
 */
export function useFeatures(): UseFeatures {
  const { currentTheme } = useTenantTheme();

  // Si no hay tenant, retornar features vacías
  if (!currentTheme || !('features' in currentTheme)) {
    return {
      hasCards: false,
      hasTransfers: false,
      hasLoans: false,
      hasInsurance: false,
      allowedCardTypes: [],
      allowedCardActions: [],
      maxCardLimit: undefined,
      allowedInsuranceTypes: [],
      isActionAvailable: () => false,
      isCardTypeAvailable: () => false,
    };
  }

  const features = (currentTheme as any).features;

  return {
    // Features principales
    hasCards: features?.cards?.enabled ?? true,
    hasTransfers: features?.transfers?.enabled ?? false,
    hasLoans: features?.loans?.enabled ?? false,
    hasInsurance: features?.insurance?.enabled ?? false,

    // Configuración de tarjetas
    allowedCardTypes: features?.cards?.allowedTypes ?? ['credit', 'debit', 'virtual'],
    allowedCardActions: features?.cards?.allowedActions ?? [],
    maxCardLimit: features?.cards?.maxCreditLimit,

    // Seguros
    allowedInsuranceTypes: features?.insurance?.allowedTypes ?? [],

    // Helpers
    isActionAvailable: (action: CardActionType) => {
      const actions = features?.cards?.allowedActions ?? [];
      return actions.length === 0 || actions.includes(action);
    },

    isCardTypeAvailable: (type: 'credit' | 'debit' | 'virtual') => {
      const types = features?.cards?.allowedTypes ?? [];
      return types.length === 0 || types.includes(type);
    },
  };
}
