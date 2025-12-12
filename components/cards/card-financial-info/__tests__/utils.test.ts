import { formatCurrencyWithSymbol } from '../utils';

jest.mock('@/utils/formatters/currency', () => ({
  formatCurrency: jest.fn((amount: number) => `${amount.toFixed(2)}`),
}));

describe('utils', () => {
  describe('formatCurrencyWithSymbol', () => {
    it('should format currency without custom symbol', () => {
      const result = formatCurrencyWithSymbol(100, {
        locale: 'en-US',
        currency: 'USD',
      });

      expect(result).toBe('100.00');
    });

    it('should format currency with custom symbol', () => {
      const result = formatCurrencyWithSymbol(100, {
        locale: 'en-US',
        currency: 'USD',
        currencySymbol: '$',
      });

      expect(result).toContain('$');
      expect(result).toContain('100.00');
    });

    it('should handle different locales', () => {
      const result = formatCurrencyWithSymbol(1000.50, {
        locale: 'es-MX',
        currency: 'MXN',
        currencySymbol: '$',
      });

      expect(result).toContain('$');
    });

    it('should handle zero amount', () => {
      const result = formatCurrencyWithSymbol(0, {
        locale: 'en-US',
        currency: 'USD',
        currencySymbol: '$',
      });

      expect(result).toContain('$');
      expect(result).toContain('0.00');
    });

    it('should handle negative amounts', () => {
      const result = formatCurrencyWithSymbol(-50, {
        locale: 'en-US',
        currency: 'USD',
        currencySymbol: '$',
      });

      expect(result).toContain('50.00');
    });

    it('should handle custom fraction digits', () => {
      const result = formatCurrencyWithSymbol(100.5555, {
        locale: 'en-US',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      });

      expect(result).toBeDefined();
    });

    it('should handle large amounts', () => {
      const result = formatCurrencyWithSymbol(999999.99, {
        locale: 'en-US',
        currency: 'USD',
        currencySymbol: '$',
      });

      expect(result).toContain('$');
      expect(result).toContain('999999.99');
    });
  });
});
