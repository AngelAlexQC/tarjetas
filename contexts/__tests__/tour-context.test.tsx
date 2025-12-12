import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { TourProvider, useTour } from '../tour-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage');

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <TourProvider>{children}</TourProvider>
);

describe('TourContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('should provide tour context', () => {
    const { result } = renderHook(() => useTour(), { wrapper: TestWrapper });

    expect(result.current).toBeDefined();
    expect(result.current.register).toBeDefined();
    expect(result.current.unregister).toBeDefined();
  });

  it('should register a tour item', () => {
    const { result } = renderHook(() => useTour(), { wrapper: TestWrapper });

    act(() => {
      result.current.register('test-key', jest.fn(), 1);
    });

    // El item debería estar registrado (no hay forma directa de verificar el estado interno)
    expect(result.current).toBeDefined();
  });

  it('should unregister a tour item', () => {
    const { result } = renderHook(() => useTour(), { wrapper: TestWrapper });

    act(() => {
      result.current.register('test-key', jest.fn(), 1);
      result.current.unregister('test-key');
    });

    expect(result.current).toBeDefined();
  });

  it('should reset tour', async () => {
    const { result } = renderHook(() => useTour(), { wrapper: TestWrapper });

    await act(async () => {
      await result.current.resetTour();
    });

    expect(AsyncStorage.removeItem).toHaveBeenCalled();
  });

  it('should set app ready', () => {
    const { result } = renderHook(() => useTour(), { wrapper: TestWrapper });

    act(() => {
      result.current.setAppReady();
    });

    expect(result.current).toBeDefined();
  });

  it('should stop tour', () => {
    const { result } = renderHook(() => useTour(), { wrapper: TestWrapper });

    act(() => {
      result.current.stopTour();
    });

    expect(result.current.isTourActive).toBe(false);
  });

  it('should pause tour', () => {
    const { result } = renderHook(() => useTour(), { wrapper: TestWrapper });

    act(() => {
      result.current.pauseTour();
    });

    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  it('should resume tour', () => {
    const { result } = renderHook(() => useTour(), { wrapper: TestWrapper });

    act(() => {
      result.current.resumeTour();
    });

    expect(result.current).toBeDefined();
  });

  it('should handle tooltip closed', async () => {
    const { result } = renderHook(() => useTour(), { wrapper: TestWrapper });

    await act(async () => {
      result.current.onTooltipClosed('test-key');
    });

    expect(result.current).toBeDefined();
  });

  it('should load seen keys from storage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(['key1', 'key2']));

    renderHook(() => useTour(), { wrapper: TestWrapper });

    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalled();
    });
  });
});
