import { renderHook } from '@testing-library/react-native';
import { useFeatures } from '../use-features';

// Mock de hooks
jest.mock('@/contexts/tenant-theme-context', () => ({
  useTenantTheme: jest.fn(() => ({
    currentTheme: 'libelula',
  })),
}));

// Mock de constants
jest.mock('@/constants/tenant-themes', () => ({
  getFeaturesFromTenant: jest.fn(() => ({
    cards: {
      enabled: true,
      allowedTypes: ['credit', 'debit', 'virtual'],
      allowedActions: ['block', 'unblock', 'pay', 'advance', 'defer', 'statements'],
      maxCreditLimit: 10000,
    },
    transfers: { enabled: true },
    loans: { enabled: false },
    insurance: {
      enabled: true,
      allowedTypes: ['life', 'health'],
    },
  })),
}));

describe('useFeatures', () => {
  it('should return correct feature flags', () => {
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

    expect(result.current.allowedCardActions).toContain('block');
    expect(result.current.allowedCardActions).toContain('pay');
  });

  it('should check if action is available', () => {
    const { result } = renderHook(() => useFeatures());

    expect(result.current.isActionAvailable('block')).toBe(true);
    expect(result.current.isActionAvailable('pay')).toBe(true);
  });

  it('should check if card type is available', () => {
    const { result } = renderHook(() => useFeatures());

    expect(result.current.isCardTypeAvailable('credit')).toBe(true);
    expect(result.current.isCardTypeAvailable('debit')).toBe(true);
    expect(result.current.isCardTypeAvailable('virtual')).toBe(true);
  });

  it('should return max card limit', () => {
    const { result } = renderHook(() => useFeatures());

    expect(result.current.maxCardLimit).toBe(10000);
  });

  it('should return allowed insurance types', () => {
    const { result } = renderHook(() => useFeatures());

    expect(result.current.allowedInsuranceTypes).toEqual(['life', 'health']);
  });
});
