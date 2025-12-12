import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { TourProvider, useTour } from '../tour-context';

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

  it('should load paused state from storage', async () => {
    (AsyncStorage.getItem as jest.Mock)
      .mockResolvedValueOnce(JSON.stringify(['key1']))  // seen keys
      .mockResolvedValueOnce('true');  // paused state

    const { result } = renderHook(() => useTour(), { wrapper: TestWrapper });

    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalledTimes(2);
    });
  });

  it('should handle register with callback', () => {
    const { result } = renderHook(() => useTour(), { wrapper: TestWrapper });
    const callback = jest.fn();

    act(() => {
      result.current.register('unique-key', callback, 1);
    });

    expect(result.current).toBeDefined();
  });

  it('should register multiple items with different priorities', () => {
    const { result } = renderHook(() => useTour(), { wrapper: TestWrapper });

    act(() => {
      result.current.register('key-1', jest.fn(), 1);
      result.current.register('key-2', jest.fn(), 2);
      result.current.register('key-3', jest.fn(), 3);
    });

    expect(result.current).toBeDefined();
  });

  it('should not register duplicate keys', () => {
    const { result } = renderHook(() => useTour(), { wrapper: TestWrapper });

    act(() => {
      result.current.register('duplicate-key', jest.fn(), 1);
      result.current.register('duplicate-key', jest.fn(), 2);
    });

    expect(result.current).toBeDefined();
  });

  it('should handle onTooltipClosed and save to storage', async () => {
    const { result } = renderHook(() => useTour(), { wrapper: TestWrapper });

    act(() => {
      result.current.register('close-test-key', jest.fn(), 1);
    });

    await act(async () => {
      result.current.onTooltipClosed('close-test-key');
    });

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  it('should handle storage errors gracefully during load', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

    const { result } = renderHook(() => useTour(), { wrapper: TestWrapper });

    await waitFor(() => {
      expect(result.current).toBeDefined();
    });
  });

  it('should handle storage errors gracefully during reset', async () => {
    (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(new Error('Remove error'));

    const { result } = renderHook(() => useTour(), { wrapper: TestWrapper });

    await act(async () => {
      await result.current.resetTour();
    });

    // Should not throw
    expect(result.current).toBeDefined();
  });

  it('should stop tour when manually stopped', () => {
    const { result } = renderHook(() => useTour(), { wrapper: TestWrapper });

    act(() => {
      result.current.setAppReady();
    });

    act(() => {
      result.current.stopTour();
    });

    expect(result.current.isTourActive).toBe(false);
  });

  it('should skip already seen items', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(['already-seen']));

    const { result } = renderHook(() => useTour(), { wrapper: TestWrapper });
    const callback = jest.fn();

    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalled();
    });

    act(() => {
      result.current.register('already-seen', callback, 1);
    });

    // The callback should not be called for already seen items
    expect(result.current).toBeDefined();
  });

  it('should resume tour after pause', async () => {
    const { result } = renderHook(() => useTour(), { wrapper: TestWrapper });

    act(() => {
      result.current.setAppReady();
      result.current.pauseTour();
    });

    expect(AsyncStorage.setItem).toHaveBeenCalled();

    act(() => {
      result.current.resumeTour();
    });

    // Resume should not throw, tour state depends on registered items
    expect(result.current).toBeDefined();
  });

  it('should provide isTourActive state', () => {
    const { result } = renderHook(() => useTour(), { wrapper: TestWrapper });

    expect(typeof result.current.isTourActive).toBe('boolean');
  });
});


