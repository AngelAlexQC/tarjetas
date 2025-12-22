// Core Formatters Module
import { formatCurrency } from './currency';
import { formatCardExpiry, formatDate, formatDateTime, formatRelativeDate } from './date';

export * from './currency';
export * from './date';

export function createFormatters(locale: string, currency: string) {
  return {
    currency: (amount: number) => formatCurrency(amount, { locale, currency }),
    date: (date: Date | string) => formatDate(date, { locale }),
    dateTime: (date: Date | string) => formatDateTime(date, { locale }),
    relative: (date: Date | string) => formatRelativeDate(date, locale),
    cardExpiry: (date: Date | string) => formatCardExpiry(date, locale),
  };
}
