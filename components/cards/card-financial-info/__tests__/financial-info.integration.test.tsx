/**
 * Tests for card-financial-info subcomponents
 */

// Mock dependencies
// Import after mocks
import { formatCurrencyWithSymbol } from '../utils';

jest.mock('@/hooks/use-app-theme', () => ({
  useAppTheme: () => ({
    isDark: false,
    colors: { text: '#000', textSecondary: '#666' },
    tenant: { mainColor: '#007AFF' },
  }),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/components/ui/animated-number', () => ({
  AnimatedNumber: () => null,
}));

jest.mock('@/components/ui/info-icon', () => ({
  InfoIcon: () => null,
}));

jest.mock('@/components/ui/info-tooltip', () => ({
  InfoTooltip: ({ children }: any) => children,
}));

jest.mock('@/components/ui/circular-progress', () => ({
  CircularProgress: () => null,
}));

jest.mock('@/components/ui/tab-icons', () => ({
  SettingsIcon: () => null,
}));

describe('CardFinancialInfo Subcomponents', () => {
  describe('formatCurrencyWithSymbol', () => {
    it('formats currency correctly', () => {
      const result = formatCurrencyWithSymbol(1000, {
        locale: 'en-US',
        currency: 'USD',
        currencySymbol: '$',
      });
      expect(result).toContain('$');
      expect(result).toContain('1');
    });

    it('handles zero amount', () => {
      const result = formatCurrencyWithSymbol(0, {
        locale: 'en-US',
        currency: 'USD',
        currencySymbol: '$',
      });
      expect(result).toContain('$');
      expect(result).toContain('0');
    });

    it('handles negative amounts', () => {
      const result = formatCurrencyWithSymbol(-500, {
        locale: 'en-US',
        currency: 'USD',
        currencySymbol: '$',
      });
      expect(result).toContain('$');
    });

    it('handles large amounts', () => {
      const result = formatCurrencyWithSymbol(1000000, {
        locale: 'en-US',
        currency: 'USD',
        currencySymbol: '$',
      });
      expect(result).toContain('$');
      expect(result).toContain('1');
    });

    it('works with different currencies', () => {
      const result = formatCurrencyWithSymbol(1000, {
        locale: 'es-MX',
        currency: 'MXN',
        currencySymbol: '$',
      });
      expect(result).toContain('$');
    });
  });
});
