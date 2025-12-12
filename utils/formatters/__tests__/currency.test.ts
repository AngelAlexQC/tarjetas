/**
 * Currency Formatter Tests
 */

import { formatCurrency, formatAmount, formatCompactCurrency } from '../currency';

// Mock logger
jest.mock('@/utils/logger', () => ({
  loggers: {
    formatter: {
      warn: jest.fn(),
    },
  },
}));

describe('Currency Formatters', () => {
  describe('formatCurrency', () => {
    it('should format currency with default options (USD, en-US)', () => {
      const result = formatCurrency(1234.56);

      expect(result).toBe('$1,234.56');
    });

    it('should format currency with custom locale and currency', () => {
      const result = formatCurrency(1234.56, {
        locale: 'es-EC',
        currency: 'USD',
      });

      // Format varies by environment, just check it contains the number
      expect(result).toContain('1');
      expect(result).toContain('234');
    });

    it('should format currency with EUR', () => {
      const result = formatCurrency(1234.56, {
        locale: 'de-DE',
        currency: 'EUR',
      });

      expect(result).toContain('1.234,56');
      expect(result).toContain('€');
    });

    it('should handle zero', () => {
      const result = formatCurrency(0);

      expect(result).toBe('$0.00');
    });

    it('should handle negative numbers', () => {
      const result = formatCurrency(-1234.56);

      expect(result).toContain('1,234.56');
      expect(result).toMatch(/-|\(/); // Either - or () for negative
    });

    it('should handle large numbers', () => {
      const result = formatCurrency(1234567890.12);

      expect(result).toBe('$1,234,567,890.12');
    });

    it('should handle small numbers', () => {
      const result = formatCurrency(0.01);

      expect(result).toBe('$0.01');
    });

    it('should respect minimumFractionDigits', () => {
      const result = formatCurrency(1234, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });

      expect(result).toBe('$1,234');
    });

    it('should respect maximumFractionDigits', () => {
      const result = formatCurrency(1234.5678, {
        maximumFractionDigits: 4,
      });

      // Should contain the value with 4 decimal places and currency symbol
      expect(result).toMatch(/\$1,234\.5678|1,234\.5678/);
    });

    it('should handle invalid locale gracefully', () => {
      // En Node.js, los locales inválidos pueden ser manejados de forma diferente
      // Este test verifica que no lance error y retorne algo válido
      const result = formatCurrency(1234.56, {
        locale: 'invalid-locale',
        currency: 'USD',
      });

      // Should not throw and return some formatted value
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });
  });

  describe('formatAmount', () => {
    it('should format amount without currency symbol', () => {
      const result = formatAmount(1234.56);

      expect(result).toBe('1,234.56');
    });

    it('should format amount with custom locale', () => {
      const result = formatAmount(1234.56, {
        locale: 'de-DE',
      });

      expect(result).toBe('1.234,56');
    });

    it('should handle zero', () => {
      const result = formatAmount(0);

      expect(result).toBe('0.00');
    });

    it('should handle negative numbers', () => {
      const result = formatAmount(-1234.56);

      expect(result).toContain('1,234.56');
    });

    it('should respect fraction digits', () => {
      const result = formatAmount(1234.5, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });

      expect(result).toBe('1,235'); // Rounded
    });
  });

  describe('formatCompactCurrency', () => {
    it('should format thousands as K', () => {
      const result = formatCompactCurrency(1500);

      expect(result).toBe('1.5K');
    });

    it('should format millions as M', () => {
      const result = formatCompactCurrency(2500000);

      expect(result).toBe('2.5M');
    });

    it('should format billions as B', () => {
      const result = formatCompactCurrency(3500000000);

      expect(result).toBe('3.5B');
    });

    it('should format trillions as T', () => {
      const result = formatCompactCurrency(1200000000000);

      expect(result).toBe('1.2T');
    });

    it('should not abbreviate small numbers', () => {
      const result = formatCompactCurrency(500);

      expect(result).toBe('500');
    });

    it('should handle negative numbers', () => {
      const result = formatCompactCurrency(-1500);

      expect(result).toBe('-1.5K');
    });

    it('should show currency symbol when requested', () => {
      const result = formatCompactCurrency(1500, {
        showCurrencySymbol: true,
        currency: 'USD',
      });

      expect(result).toContain('$');
      expect(result).toContain('1.5K');
    });

    it('should respect maximumFractionDigits', () => {
      const result = formatCompactCurrency(1234, {
        maximumFractionDigits: 2,
      });

      expect(result).toBe('1.23K');
    });

    it('should handle zero', () => {
      const result = formatCompactCurrency(0);

      expect(result).toBe('0');
    });

    it('should handle exact thousands', () => {
      const result = formatCompactCurrency(1000);

      expect(result).toBe('1K');
    });

    it('should handle exact millions', () => {
      const result = formatCompactCurrency(1000000);

      expect(result).toBe('1M');
    });
  });
});
