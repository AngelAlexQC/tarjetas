import { renderHook } from '@testing-library/react-native';
import { useFeatures } from '../use-features';
import { useTenantTheme } from '@/contexts/tenant-theme-context';
import { getFeaturesFromTenant } from '@/constants/tenant-themes';
import type { TenantFeatures } from '@/constants/tenant-themes';

jest.mock('@/contexts/tenant-theme-context');
jest.mock('@/constants/tenant-themes');

describe('useFeatures', () => {
  const mockCurrentTheme = {
    tenant: {
      id: 'test-tenant',
      name: 'Test Bank',
      mainColor: '#FF0000',
      subdomains: ['test'],
    },
    colors: {} as any,
    isDark: false,
  };

  const mockFeatures: TenantFeatures = {
    cards: {
      enabled: true,
      allowedTypes: ['credit', 'debit', 'virtual'],
      allowedActions: ['pay', 'defer', 'advance', 'statements', 'insurance', 'settings'],
      maxCardLimit: 5,
    },
    transfers: {
      enabled: true,
    },
    loans: {
      enabled: false,
    },
    insurance: {
      enabled: true,
      allowedTypes: ['theft', 'fraud', 'damage'],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTenantTheme as jest.Mock).mockReturnValue({
      currentTheme: mockCurrentTheme,
    });
    (getFeaturesFromTenant as jest.Mock).mockReturnValue(mockFeatures);
  });

  it('should return features from current theme', () => {
    const { result } = renderHook(() => useFeatures());

    expect(result.current.hasCards).toBe(true);
    expect(result.current.hasTransfers).toBe(true);
    expect(result.current.hasLoans).toBe(false);
    expect(result.current.hasInsurance).toBe(true);
  });

  it('should return allowed card types', () => {
    const { result } = renderHook(() => useFeatures());

    expect(result.current.allowedCardTypes).toEqual(['credit', 'debit', 'virtual']);
  });

  it('should return allowed card actions', () => {
    const { result } = renderHook(() => useFeatures());

    expect(result.current.allowedCardActions).toEqual(['pay', 'defer', 'advance', 'statements', 'insurance', 'settings']);
  });

  it('should return max card limit', () => {
    const { result } = renderHook(() => useFeatures());

    expect(result.current.maxCardLimit).toBe(5);
  });

  it('should return allowed insurance types', () => {
    const { result } = renderHook(() => useFeatures());

    expect(result.current.allowedInsuranceTypes).toEqual(['theft', 'fraud', 'damage']);
  });

  describe('isActionAvailable', () => {
    it('should return true for available actions', () => {
      const { result } = renderHook(() => useFeatures());

      expect(result.current.isActionAvailable('pay')).toBe(true);
      expect(result.current.isActionAvailable('defer')).toBe(true);
      expect(result.current.isActionAvailable('advance')).toBe(true);
    });

    it('should return false for unavailable actions', () => {
      const { result } = renderHook(() => useFeatures());

      expect(result.current.isActionAvailable('block' as any)).toBe(false);
      expect(result.current.isActionAvailable('unblock' as any)).toBe(false);
    });
  });

  describe('isCardTypeAvailable', () => {
    it('should return true for available card types', () => {
      const { result } = renderHook(() => useFeatures());

      expect(result.current.isCardTypeAvailable('credit')).toBe(true);
      expect(result.current.isCardTypeAvailable('debit')).toBe(true);
      expect(result.current.isCardTypeAvailable('virtual')).toBe(true);
    });

    it('should return false for unavailable card types', () => {
      (getFeaturesFromTenant as jest.Mock).mockReturnValue({
        ...mockFeatures,
        cards: {
          ...mockFeatures.cards,
          allowedTypes: ['credit'],
        },
      });

      const { result } = renderHook(() => useFeatures());

      expect(result.current.isCardTypeAvailable('credit')).toBe(true);
      expect(result.current.isCardTypeAvailable('debit')).toBe(false);
      expect(result.current.isCardTypeAvailable('virtual')).toBe(false);
    });
  });

  it('should handle features without insurance', () => {
    (getFeaturesFromTenant as jest.Mock).mockReturnValue({
      ...mockFeatures,
      insurance: {
        enabled: false,
        allowedTypes: [],
      },
    });

    const { result } = renderHook(() => useFeatures());

    expect(result.current.hasInsurance).toBe(false);
    expect(result.current.allowedInsuranceTypes).toEqual([]);
  });

  it('should handle features without max card limit', () => {
    (getFeaturesFromTenant as jest.Mock).mockReturnValue({
      ...mockFeatures,
      cards: {
        ...mockFeatures.cards,
        maxCardLimit: undefined,
      },
    });

    const { result } = renderHook(() => useFeatures());

    expect(result.current.maxCardLimit).toBeUndefined();
  });

  it('should memoize functions to avoid unnecessary re-renders', () => {
    const { result, rerender } = renderHook(() => useFeatures());

    const firstIsActionAvailable = result.current.isActionAvailable;
    const firstIsCardTypeAvailable = result.current.isCardTypeAvailable;

    rerender();

    expect(result.current.isActionAvailable).toBe(firstIsActionAvailable);
    expect(result.current.isCardTypeAvailable).toBe(firstIsCardTypeAvailable);
  });
});
