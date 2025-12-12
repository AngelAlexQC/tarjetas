import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { useColorScheme } from 'react-native';
import { TenantThemeProvider, useTenantTheme, useThemedColors } from '../tenant-theme-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Tenant } from '@/repositories/schemas/tenant.schema';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('react-native', () => ({
  useColorScheme: jest.fn(() => 'light'),
}));

jest.mock('@/utils/logger', () => ({
  loggers: {
    theme: {
      error: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
    },
  },
}));

jest.mock('@/repositories', () => ({
  RepositoryContainer: {
    getTenantRepository: () => ({
      getTenantById: jest.fn().mockResolvedValue(null),
    }),
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <TenantThemeProvider>{children}</TenantThemeProvider>
);

const mockTenant: Tenant = {
  id: 'test-bank-id',
  slug: 'test-bank',
  name: 'Test Bank',
  country: 'Ecuador',
  countryCode: 'EC',
  countryFlag: '🇪🇨',
  locale: 'es-EC',
  currency: 'USD',
  currencySymbol: '$',
  timezone: 'America/Guayaquil',
  branding: {
    logoUrl: 'https://example.com/logo.png',
    primaryColor: '#FF0000',
    secondaryColor: '#00FF00',
    accentColor: '#0000FF',
    gradientColors: ['#FF0000', '#00FF00'],
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#000000',
  },
  features: {
    cards: {
      enabled: true,
      allowedTypes: ['credit', 'debit'],
      allowedActions: ['view', 'block'],
    },
    transfers: { enabled: false },
    loans: { enabled: false },
    insurance: { enabled: false, allowedTypes: [] },
  },
};

describe('TenantThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  describe('useTenantTheme hook', () => {
    it('should throw error when used outside provider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useTenantTheme());
      }).toThrow('useTenantTheme must be used within a TenantThemeProvider');
      
      consoleSpy.mockRestore();
    });
  });

  describe('initialization', () => {
    it('should initialize with loading state', () => {
      const { result } = renderHook(() => useTenantTheme(), { wrapper });
      expect(result.current.isLoading).toBe(true);
    });

    it('should use default theme when no saved theme', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const { result } = renderHook(() => useTenantTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.currentTheme).toBeDefined();
      expect(result.current.currentTheme.slug).toBe('default');
    });

    it('should handle storage error gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const { result } = renderHook(() => useTenantTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

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
        await result.current.setTenant(mockTenant);
      });

      expect(result.current.currentTheme).toEqual(mockTenant);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@tenant_theme',
        JSON.stringify(mockTenant)
      );
    });

    it('should handle save error gracefully', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Save error'));

      const { result } = renderHook(() => useTenantTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.setTenant(mockTenant);
      });

      expect(result.current.currentTheme.slug).toBe('default');
    });
  });

  describe('clearTenant', () => {
    it('should clear tenant and reset to default', async () => {
      const { result } = renderHook(() => useTenantTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.clearTenant();
      });

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@tenant_theme');
      expect(result.current.currentTheme.slug).toBe('default');
    });

    it('should handle clear error gracefully', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(new Error('Remove error'));

      const { result } = renderHook(() => useTenantTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

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

  it('should return default colors when no theme', async () => {
    const { result } = renderHook(() => useThemedColors(), { wrapper });

    await waitFor(() => {
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
