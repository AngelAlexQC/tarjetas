import { formatCurrency } from '@/utils/formatters/currency';

export function formatCurrencyWithSymbol(
  amount: number,
  options: {
    locale: string;
    currency: string;
    currencySymbol?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
) {
  const { currencySymbol, locale, currency, minimumFractionDigits, maximumFractionDigits } = options;
  const value = formatCurrency(amount, { locale, currency, minimumFractionDigits, maximumFractionDigits });
  return currencySymbol ? `${currencySymbol} ${value.replace(/[^\d.,-]+/, '').trim()}` : value;
}
