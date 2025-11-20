/**
 * Utilidades para formateo de monedas
 * Usa Intl.NumberFormat nativo para soporte internacional
 */

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
  } catch (error) {
    // Fallback en caso de error
    console.warn('Error formateando moneda:', error);
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
  } catch (error) {
    console.warn('Error formateando cantidad:', error);
    return amount.toFixed(2);
  }
};

/**
 * Formatea un número compacto (ej: 1.2K, 1.5M)
 * @param amount - Cantidad a formatear
 * @param locale - Locale a usar
 * @returns String compacto (ej: "1.2K")
 */
export const formatCompactCurrency = (
  amount: number,
  locale: string = 'en-US'
): string => {
  try {
    const formatter = new Intl.NumberFormat(locale, {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1,
    });

    return formatter.format(amount);
  } catch (error) {
    console.warn('Error formateando moneda compacta:', error);
    
    // Fallback manual
    if (amount >= 1_000_000) {
      return `${(amount / 1_000_000).toFixed(1)}M`;
    } else if (amount >= 1_000) {
      return `${(amount / 1_000).toFixed(1)}K`;
    }
    return amount.toString();
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
  } catch (error) {
    console.warn('Error obteniendo símbolo de moneda:', error);
    return currency;
  }
};
