/**
 * Utilidades para formateo de monedas
 * Usa Intl.NumberFormat nativo para soporte internacional
 */

import { loggers } from '@/core/logging';

const log = loggers.formatter;

export interface CurrencyFormatOptions {
  locale?: string;
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Formatea un número como moneda
 * @param amount - Cantidad a formatear
 * @param options - Opciones de formateo
 * @returns String formateado (ej: "$2,500.50")
 */
export const formatCurrency = (
  amount: number,
  options: CurrencyFormatOptions = {}
): string => {
  const {
    locale = 'en-US',
    currency = 'USD',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options;

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
    });

    return formatter.format(amount);
  } catch (error: any) {
    // Fallback en caso de error
    log.warn('Error formateando moneda:', error);
    return `${currency} ${amount.toFixed(2)}`;
  }
};

/**
 * Formatea un número sin símbolo de moneda
 * @param amount - Cantidad a formatear
 * @param options - Opciones de formateo
 * @returns String formateado (ej: "2,500.50")
 */
export const formatAmount = (
  amount: number,
  options: Omit<CurrencyFormatOptions, 'currency'> = {}
): string => {
  const {
    locale = 'en-US',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options;

  try {
    const formatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits,
      maximumFractionDigits,
    });

    return formatter.format(amount);
  } catch (error: any) {
    log.warn('Error formateando cantidad:', error);
    return amount.toFixed(2);
  }
};

/**
 * Formatea un número compacto (ej: 1.2K, 1.5M)
 * Compatible con React Native/Hermes que no soporta notation: 'compact'
 * @param amount - Cantidad a formatear
 * @param options - Opciones de formateo
 * @returns String compacto (ej: "1.2K", "$1.5M")
 */
export const formatCompactCurrency = (
  amount: number,
  options: {
    locale?: string;
    currency?: string;
    showCurrencySymbol?: boolean;
    maximumFractionDigits?: number;
  } = {}
): string => {
  const {
    locale = 'en-US',
    currency = 'USD',
    showCurrencySymbol = false,
    maximumFractionDigits = 1,
  } = options;

  try {
    const absAmount = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';
    let value: number;
    let suffix: string;

    // Determinar el divisor y sufijo
    if (absAmount >= 1_000_000_000_000) {
      value = absAmount / 1_000_000_000_000;
      suffix = 'T';
    } else if (absAmount >= 1_000_000_000) {
      value = absAmount / 1_000_000_000;
      suffix = 'B';
    } else if (absAmount >= 1_000_000) {
      value = absAmount / 1_000_000;
      suffix = 'M';
    } else if (absAmount >= 1_000) {
      value = absAmount / 1_000;
      suffix = 'K';
    } else {
      // Números menores a 1000
      if (showCurrencySymbol) {
        return formatCurrency(amount, { locale, currency, maximumFractionDigits });
      }
      return amount.toLocaleString(locale, { 
        minimumFractionDigits: 0,
        maximumFractionDigits 
      });
    }

    // Formatear el número con decimales
    const formattedValue = value.toLocaleString(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits,
    });

    // Agregar símbolo de moneda si se requiere
    if (showCurrencySymbol) {
      const symbol = getCurrencySymbol(currency, locale);
      return `${sign}${symbol}${formattedValue}${suffix}`;
    }

    return `${sign}${formattedValue}${suffix}`;
  } catch (error: any) {
    log.warn('Error formateando moneda compacta:', error);
    
    // Fallback simple
    const absAmount = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';
    
    if (absAmount >= 1_000_000) {
      return `${sign}${(absAmount / 1_000_000).toFixed(1)}M`;
    } else if (absAmount >= 1_000) {
      return `${sign}${(absAmount / 1_000).toFixed(1)}K`;
    }
    return `${sign}${absAmount}`;
  }
};

/**
 * Obtiene el símbolo de moneda
 * @param currency - Código de moneda (USD, EUR, etc.)
 * @param locale - Locale a usar
 * @returns Símbolo de moneda
 */
export const getCurrencySymbol = (
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(0)
      .replace(/\d/g, '')
      .trim();
  } catch (error: any) {
    log.warn('Error obteniendo símbolo de moneda:', error);
    return currency;
  }
};
