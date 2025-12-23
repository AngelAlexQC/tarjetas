import { renderHook, waitFor } from '@testing-library/react-native';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { useColorScheme } from '../use-color-scheme.web';

jest.mock('react-native', () => ({
  useColorScheme: jest.fn(),
}));

describe('useColorScheme (web)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the current color scheme', () => {
    (useRNColorScheme as jest.Mock).mockReturnValue('dark');

    const { result } = renderHook(() => useColorScheme());

    expect(['light', 'dark']).toContain(result.current);
  });

  it('should work consistently', () => {
    (useRNColorScheme as jest.Mock).mockReturnValue('light');

    const { result: result1 } = renderHook(() => useColorScheme());
    const { result: result2 } = renderHook(() => useColorScheme());

    expect(result1.current).toBe(result2.current);
  });

  it('should handle light color scheme', async () => {
    (useRNColorScheme as jest.Mock).mockReturnValue('light');

    const { result } = renderHook(() => useColorScheme());

    await waitFor(() => {
      expect(result.current).toBe('light');
    });
  });

  it('should handle null color scheme', async () => {
    (useRNColorScheme as jest.Mock).mockReturnValue(null);

    const { result } = renderHook(() => useColorScheme());

    await waitFor(() => {
      expect(result.current).toBeNull();
    });
  });
});
