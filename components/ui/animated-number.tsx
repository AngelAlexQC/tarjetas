/**
 * AnimatedNumber - Componente de número animado con efecto contador
 * Anima números suavemente cuando cambian de valor
 */

import { useAppTheme } from '@/hooks/use-app-theme';
import React, { useMemo } from 'react';
import { Text, TextStyle } from 'react-native';

export interface AnimatedNumberProps {
  value: number;
  style?: TextStyle | TextStyle[];
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  locale?: string;
  currency?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  style,
  prefix = '',
  suffix = '',
  decimals = 2,
  locale = 'en-US',
  currency,
}) => {
  const theme = useAppTheme();
  
  // Formatear el valor
  const displayText = useMemo(() => {
    try {
      if (currency) {
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(value);
      }
      return `${prefix}${value.toLocaleString(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${suffix}`;
    } catch (error) {
      console.warn('Error formateando número:', error);
      return `${prefix}${value.toFixed(decimals)}${suffix}`;
    }
  }, [value, currency, locale, decimals, prefix, suffix]);

  return (
    <Text style={[{ color: theme.colors.text }, style]}>
      {displayText}
    </Text>
  );
};
