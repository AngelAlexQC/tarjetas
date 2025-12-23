import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { useFeatures } from '../use-features';
import { TenantThemeProvider } from '@/contexts/tenant-theme-context';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <TenantThemeProvider>
    {children}
  </TenantThemeProvider>
);

describe('useFeatures', () => {
  it('should return features object', () => {
    const { result } = renderHook(() => useFeatures(), { wrapper });

    expect(result.current).toBeDefined();
    expect(typeof result.current).toBe('object');
  });

  it('should have hasCards property', () => {
    const { result } = renderHook(() => useFeatures(), { wrapper });

    expect(result.current).toHaveProperty('hasCards');
    expect(typeof result.current.hasCards).toBe('boolean');
  });

  it('should have hasTransfers property', () => {
    const { result } = renderHook(() => useFeatures(), { wrapper });

    expect(result.current).toHaveProperty('hasTransfers');
    expect(typeof result.current.hasTransfers).toBe('boolean');
  });

  it('should have hasLoans property', () => {
    const { result } = renderHook(() => useFeatures(), { wrapper });

    expect(result.current).toHaveProperty('hasLoans');
    expect(typeof result.current.hasLoans).toBe('boolean');
  });

  it('should have hasInsurance property', () => {
    const { result } = renderHook(() => useFeatures(), { wrapper });

    expect(result.current).toHaveProperty('hasInsurance');
    expect(typeof result.current.hasInsurance).toBe('boolean');
  });

  it('should have allowedCardTypes array', () => {
    const { result } = renderHook(() => useFeatures(), { wrapper });

    expect(result.current).toHaveProperty('allowedCardTypes');
    expect(Array.isArray(result.current.allowedCardTypes)).toBe(true);
  });

  it('should have allowedCardActions array', () => {
    const { result } = renderHook(() => useFeatures(), { wrapper });

    expect(result.current).toHaveProperty('allowedCardActions');
    expect(Array.isArray(result.current.allowedCardActions)).toBe(true);
  });

  it('should have isActionAvailable function', () => {
    const { result } = renderHook(() => useFeatures(), { wrapper });

    expect(result.current).toHaveProperty('isActionAvailable');
    expect(typeof result.current.isActionAvailable).toBe('function');
  });

  it('should have isCardTypeAvailable function', () => {
    const { result } = renderHook(() => useFeatures(), { wrapper });

    expect(result.current).toHaveProperty('isCardTypeAvailable');
    expect(typeof result.current.isCardTypeAvailable).toBe('function');
  });

  it('should check if action is available', () => {
    const { result } = renderHook(() => useFeatures(), { wrapper });

    const isAvailable = result.current.isActionAvailable('pay' as any);
    expect(typeof isAvailable).toBe('boolean');
  });

  it('should check if card type is available', () => {
    const { result } = renderHook(() => useFeatures(), { wrapper });

    const isAvailable = result.current.isCardTypeAvailable('credit');
    expect(typeof isAvailable).toBe('boolean');
  });

  it('should have maxCardLimit property', () => {
    const { result } = renderHook(() => useFeatures(), { wrapper });

    expect(result.current).toHaveProperty('maxCardLimit');
  });

  it('should have allowedInsuranceTypes array', () => {
    const { result } = renderHook(() => useFeatures(), { wrapper });

    expect(result.current).toHaveProperty('allowedInsuranceTypes');
    expect(Array.isArray(result.current.allowedInsuranceTypes)).toBe(true);
  });
});
