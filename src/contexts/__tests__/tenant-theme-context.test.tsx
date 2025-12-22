/**
 * Tenant Theme Context Tests
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { useColorScheme } from 'react-native';
import { TenantThemeProvider, useTenantTheme, useThemedColors } from '../tenant-theme-context';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock react-native useColorScheme
jest.mock('react-native', () => ({
  useColorScheme: jest.fn(() => 'light'),
}));

// Mock logger
jest.mock('@/utils/logger', () => ({
  loggers: {
    theme: {
      error: jest.fn(),
      info: jest.fn(),
    },
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <TenantThemeProvider>{children}</TenantThemeProvider>
);

describe('TenantThemeContext', () => {
  const mockTenantTheme = {
    slug: 'test-bank',
    name: 'Test Bank',
    logoUrl: 'https://example.com/logo.png',
    mainColor: '#FF0000',
    secondaryColor: '#00FF00',
    accentColor: '#0000FF',
    gradientColors: ['#FF0000', '#00FF00'],
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#000000',
    locale: 'es-EC',
    currency: 'USD',
    currencySymbol: '$',
    country: 'Ecuador',
    countryFlag: '🇪🇨',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  describe('useTenantTheme hook', () => {
    it('should return fallback when used outside provider', () => {
      // useTenantTheme returns a fallback instead of throwing
      const { result } = renderHook(() => useTenantTheme());
      
      // Should return default theme gracefully
      expect(result.current.currentTheme).toBeDefined();
      expect(result.current.currentTheme?.slug).toBe('default');
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('initialization', () => {
    it('should initialize with loading state', () => {
      const { result } = renderHook(() => useTenantTheme(), { wrapper });

      expect(result.current.isLoading).toBe(true);
    });

    it('should load saved theme from storage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockTenantTheme));

      const { result } = renderHook(() => useTenantTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.currentTheme).toEqual(mockTenantTheme);
    });

    it('should use default theme when no saved theme', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useTenantTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should return default theme (not null)
      expect(result.current.currentTheme).toBeDefined();
      expect(result.current.currentTheme?.slug).toBeDefined();
    });

    it('should handle storage error gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const { result } = renderHook(() => useTenantTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should fallback to default theme
      expect(result.current.currentTheme).toBeDefined();
    });

    it('should expose colorScheme', async () => {
      const { result } = renderHook(() => useTenantTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.colorScheme).toBe('light');
    });
  });

  describe('setTenant', () => {
    it('should set tenant and save to storage', async () => {
      const { result } = renderHook(() => useTenantTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.setTenant(mockTenantTheme);
      });

      expect(result.current.currentTheme).toEqual(mockTenantTheme);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@tenant_theme',
        JSON.stringify(mockTenantTheme)
      );
    });

    it('should handle save error gracefully', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Save error'));

      const { result } = renderHook(() => useTenantTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should not throw even when save fails
      await act(async () => {
        await result.current.setTenant(mockTenantTheme);
      });

      // When save fails, the theme is NOT updated in memory (error is caught but state not set)
      // So it should remain as the default theme
      expect(result.current.currentTheme?.slug).toBe('default');
    });
  });

  describe('clearTenant', () => {
    it('should clear tenant and remove from storage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockTenantTheme));

      const { result } = renderHook(() => useTenantTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.clearTenant();
      });

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@tenant_theme');
      // currentTheme will still return default theme (not null)
      expect(result.current.currentTheme).toBeDefined();
    });

    it('should handle clear error gracefully', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(new Error('Remove error'));

      const { result } = renderHook(() => useTenantTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Should not throw
      await act(async () => {
        await result.current.clearTenant();
      });
    });
  });
});

describe('useThemedColors', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <TenantThemeProvider>{children}</TenantThemeProvider>
  );

  it('should return themed colors based on current theme', async () => {
    const mockTheme = {
      slug: 'test-bank',
      name: 'Test Bank',
      mainColor: '#FF0000',
      secondaryColor: '#00FF00',
      accentColor: '#0000FF',
      gradientColors: ['#FF0000', '#00FF00'],
      textOnPrimary: '#FFFFFF',
      textOnSecondary: '#000000',
    };

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockTheme));

    const { result } = renderHook(() => useThemedColors(), { wrapper });

    await waitFor(() => {
      expect(result.current.primary).toBe('#FF0000');
    });

    expect(result.current.secondary).toBe('#00FF00');
    expect(result.current.accent).toBe('#0000FF');
    expect(result.current.textOnPrimary).toBe('#FFFFFF');
    expect(result.current.textOnSecondary).toBe('#000000');
    expect(result.current.gradientColors).toEqual(['#FF0000', '#00FF00']);
  });

  it('should return default colors when no theme', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useThemedColors(), { wrapper });

    await waitFor(() => {
      // Should have default colors
      expect(result.current.primary).toBeDefined();
    });

    expect(result.current.background).toBeDefined();
    expect(result.current.text).toBeDefined();
    expect(result.current.border).toBeDefined();
    expect(result.current.card).toBeDefined();
  });

  it('should use light mode colors', async () => {
    jest.mocked(useColorScheme).mockReturnValue('light');

    const { result } = renderHook(() => useThemedColors(), { wrapper });

    await waitFor(() => {
      expect(result.current.background).toBe('#fff');
    });

    expect(result.current.text).toBe('#11181C');
    expect(result.current.card).toBe('#ffffff');
  });

  it('should use dark mode colors', async () => {
    jest.mocked(useColorScheme).mockReturnValue('dark');

    const { result } = renderHook(() => useThemedColors(), { wrapper });

    await waitFor(() => {
      expect(result.current.background).toBe('#151718');
    });

    expect(result.current.text).toBe('#ECEDEE');
    expect(result.current.card).toBe('#1a1a1a');
  });
});
