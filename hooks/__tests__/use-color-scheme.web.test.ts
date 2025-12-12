import { renderHook } from '@testing-library/react-native';
import { useColorScheme } from '../use-color-scheme.web';
import { useColorScheme as useRNColorScheme } from 'react-native';

jest.mock('react-native', () => ({
  useColorScheme: jest.fn(),
}));

describe('useColorScheme (web)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return "light" before hydration', () => {
    (useRNColorScheme as jest.Mock).mockReturnValue('dark');

    const { result } = renderHook(() => useColorScheme());

    expect(result.current).toBe('light');
  });

  it('should return actual color scheme after hydration', async () => {
    (useRNColorScheme as jest.Mock).mockReturnValue('dark');

    const { result, rerender } = renderHook(() => useColorScheme());

    // Before hydration
    expect(result.current).toBe('light');

    // Wait for useEffect to run
    await new Promise(resolve => setTimeout(resolve, 0));
    rerender();

    // After hydration
    expect(result.current).toBe('dark');
  });

  it('should handle null color scheme', async () => {
    (useRNColorScheme as jest.Mock).mockReturnValue(null);

    const { result, rerender } = renderHook(() => useColorScheme());

    // Before hydration
    expect(result.current).toBe('light');

    // Wait for useEffect to run
    await new Promise(resolve => setTimeout(resolve, 0));
    rerender();

    // After hydration
    expect(result.current).toBeNull();
  });

  it('should handle undefined color scheme', async () => {
    (useRNColorScheme as jest.Mock).mockReturnValue(undefined);

    const { result, rerender } = renderHook(() => useColorScheme());

    // Before hydration
    expect(result.current).toBe('light');

    // Wait for useEffect to run
    await new Promise(resolve => setTimeout(resolve, 0));
    rerender();

    // After hydration
    expect(result.current).toBeUndefined();
  });

  it('should handle light color scheme', async () => {
    (useRNColorScheme as jest.Mock).mockReturnValue('light');

    const { result, rerender } = renderHook(() => useColorScheme());

    await new Promise(resolve => setTimeout(resolve, 0));
    rerender();

    expect(result.current).toBe('light');
  });
});
