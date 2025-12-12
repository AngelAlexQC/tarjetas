import React from 'react';
import { render, renderHook, act } from '@testing-library/react-native';
import { SplashProvider, useSplash } from '../splash-context';
import { Text } from 'react-native';

describe('SplashContext', () => {
  describe('SplashProvider', () => {
    it('should render children correctly', () => {
      const { getByText } = render(
        <SplashProvider>
          <Text>Test Child</Text>
        </SplashProvider>
      );

      expect(getByText('Test Child')).toBeTruthy();
    });

    it('should provide initial splash state as false', () => {
      const { result } = renderHook(() => useSplash(), {
        wrapper: SplashProvider,
      });

      expect(result.current.isSplashComplete).toBe(false);
    });

    it('should update splash state when setSplashComplete is called', () => {
      const { result } = renderHook(() => useSplash(), {
        wrapper: SplashProvider,
      });

      act(() => {
        result.current.setSplashComplete(true);
      });

      expect(result.current.isSplashComplete).toBe(true);
    });

    it('should allow toggling splash state multiple times', () => {
      const { result } = renderHook(() => useSplash(), {
        wrapper: SplashProvider,
      });

      act(() => {
        result.current.setSplashComplete(true);
      });
      expect(result.current.isSplashComplete).toBe(true);

      act(() => {
        result.current.setSplashComplete(false);
      });
      expect(result.current.isSplashComplete).toBe(false);

      act(() => {
        result.current.setSplashComplete(true);
      });
      expect(result.current.isSplashComplete).toBe(true);
    });
  });

  describe('useSplash', () => {
    it('should throw error when used outside SplashProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() => useSplash());
      }).toThrow('useSplash must be used within a SplashProvider');

      consoleSpy.mockRestore();
    });

    it('should not throw error when used inside SplashProvider', () => {
      const { result } = renderHook(() => useSplash(), {
        wrapper: SplashProvider,
      });

      expect(result.current).toBeDefined();
      expect(result.current.isSplashComplete).toBeDefined();
      expect(result.current.setSplashComplete).toBeDefined();
    });
  });
});
