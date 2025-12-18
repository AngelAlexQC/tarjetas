/**
 * useAppTheme Hook Tests
 */

import { TenantThemeProvider } from '@/contexts/tenant-theme-context';
import { renderHook } from '@testing-library/react-native';
import React from 'react';
import { useAppTheme } from '../use-app-theme';

// Mock useColorScheme
jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: jest.fn(() => 'light'),
}));

// Mock AsyncStorage (required by TenantThemeContext)
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock useColorScheme from react-native
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

// Import mock at top level
const mockUseColorScheme = jest.fn();
jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: mockUseColorScheme,
}));

describe('useAppTheme', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseColorScheme.mockReturnValue('light');
  });

  describe('initialization', () => {
    it('should return theme object', () => {
      const { result } = renderHook(() => useAppTheme(), { wrapper });

      expect(result.current).toBeDefined();
    });

    it('should return mode', () => {
      const { result } = renderHook(() => useAppTheme(), { wrapper });

      expect(result.current.mode).toBe('light');
    });

    it('should return tenant information', () => {
      const { result } = renderHook(() => useAppTheme(), { wrapper });

      expect(result.current.tenant).toBeDefined();
      expect(result.current.tenant.slug).toBeDefined();
      expect(result.current.tenant.mainColor).toBeDefined();
    });

    it('should return colors object', () => {
      const { result } = renderHook(() => useAppTheme(), { wrapper });

      expect(result.current.colors).toBeDefined();
      expect(result.current.colors.background).toBeDefined();
      expect(result.current.colors.text).toBeDefined();
    });

    it('should return isDark flag', () => {
      const { result } = renderHook(() => useAppTheme(), { wrapper });

      expect(result.current.isDark).toBe(false);
    });

    it('should return components tokens', () => {
      const { result } = renderHook(() => useAppTheme(), { wrapper });

      expect(result.current.components).toBeDefined();
    });
  });

  describe('helpers', () => {
    it('should provide getThemeGradient helper', () => {
      const { result } = renderHook(() => useAppTheme(), { wrapper });

      expect(result.current.helpers.getThemeGradient).toBeDefined();
      expect(typeof result.current.helpers.getThemeGradient).toBe('function');
    });

    it('should provide getOverlay helper', () => {
      const { result } = renderHook(() => useAppTheme(), { wrapper });

      expect(result.current.helpers.getOverlay).toBeDefined();
      const overlay = result.current.helpers.getOverlay('medium');
      expect(overlay).toBeDefined();
    });

    it('should provide getSurface helper', () => {
      const { result } = renderHook(() => useAppTheme(), { wrapper });

      expect(result.current.helpers.getSurface).toBeDefined();
      const surface = result.current.helpers.getSurface(0);
      expect(surface).toBeDefined();
    });

    it('should provide getText helper', () => {
      const { result } = renderHook(() => useAppTheme(), { wrapper });

      expect(result.current.helpers.getText).toBeDefined();
      const text = result.current.helpers.getText('primary');
      expect(text).toBeDefined();
    });

    it('should provide getGlassTokens helper', () => {
      const { result } = renderHook(() => useAppTheme(), { wrapper });

      expect(result.current.helpers.getGlassTokens).toBeDefined();
      const tokens = result.current.helpers.getGlassTokens();
      expect(tokens).toBeDefined();
    });

    it('should provide getCardTokens helper', () => {
      const { result } = renderHook(() => useAppTheme(), { wrapper });

      expect(result.current.helpers.getCardTokens).toBeDefined();
      const tokens = result.current.helpers.getCardTokens();
      expect(tokens).toBeDefined();
    });

    it('should provide getButtonTokens helper', () => {
      const { result } = renderHook(() => useAppTheme(), { wrapper });

      expect(result.current.helpers.getButtonTokens).toBeDefined();
      const tokens = result.current.helpers.getButtonTokens();
      expect(tokens).toBeDefined();
    });
  });

  describe('dark mode', () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue('dark');
    });

    it('should return dark mode', () => {
      const { result } = renderHook(() => useAppTheme(), { wrapper });

      expect(result.current.mode).toBe('dark');
    });

    it('should return dark colors', () => {
      const { result } = renderHook(() => useAppTheme(), { wrapper });

      // Dark mode should have different colors
      expect(result.current.colors).toBeDefined();
      expect(result.current.isDark).toBe(true);
    });
  });

  describe('tenant defaults', () => {
    it('should have default mainColor', () => {
      const { result } = renderHook(() => useAppTheme(), { wrapper });

      expect(result.current.tenant.mainColor).toBeTruthy();
    });

    it('should have default currency', () => {
      const { result } = renderHook(() => useAppTheme(), { wrapper });

      expect(result.current.tenant.currency).toBeDefined();
    });

    it('should have default locale', () => {
      const { result } = renderHook(() => useAppTheme(), { wrapper });

      expect(result.current.tenant.locale).toBeDefined();
    });

    it('should have gradient colors', () => {
      const { result } = renderHook(() => useAppTheme(), { wrapper });

      expect(result.current.tenant.gradientColors).toBeDefined();
      expect(Array.isArray(result.current.tenant.gradientColors)).toBe(true);
    });
  });
});
