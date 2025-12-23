/**
 * BiometricAccessScreen Component Tests
 *
 * Tests para el componente de acceso biométrico.
 * Se enfocan en el flujo de autenticación, éxito, error y reintento.
 */

import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { BiometricAccessScreen } from '../biometric-access-screen';

// Mock de useAuth
const mockAuthenticateWithBiometric = jest.fn();

jest.mock('@/contexts/auth-context', () => ({
  useAuth: jest.fn(() => ({
    authenticateWithBiometric: mockAuthenticateWithBiometric,
  })),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}));

jest.mock('@/core/logging', () => ({
  loggers: {
    biometric: {
      info: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
    },
  },
}));

// Mock de ThemedText
jest.mock('@/ui/primitives/themed-text', () => ({
  ThemedText: (props: { testID?: string; children: React.ReactNode }) => {
    const { Text } = require('react-native');
    return <Text testID={props.testID}>{props.children}</Text>;
  },
}));

// Mock de lucide icons
jest.mock('lucide-react-native', () => ({
  Fingerprint: () => 'FingerprintIcon',
  ShieldCheck: () => 'ShieldCheckIcon',
}));

// Mock de componentes UI
jest.mock('@/ui/primitives/themed-button', () => ({
  ThemedButton: ({
    title,
    onPress,
    disabled,
    loading,
  }: {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
  }) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable onPress={onPress} disabled={disabled || loading} testID={`button-${title}`}>
        <Text>{loading ? 'Loading...' : title}</Text>
      </Pressable>
    );
  },
}));

// Mock de useAppTheme
jest.mock('@/ui/theming', () => ({
  useAppTheme: jest.fn(() => ({
    colors: {
      background: '#fff',
      text: '#000',
      textSecondary: '#666',
      surface: '#f5f5f5',
    },
    tenant: { mainColor: '#007AFF' },
    mode: 'light',
    isDark: false,
    components: {},
    helpers: {},
  })),
}));

describe('BiometricAccessScreen', () => {
  const mockProps = {
    onSuccess: jest.fn(),
    onUsePassword: jest.fn(),
    userName: 'Juan',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should attempt authentication on mount', async () => {
    mockAuthenticateWithBiometric.mockResolvedValue({ success: false });
    render(<BiometricAccessScreen {...mockProps} />);

    // Fast-forward timer for auto-start (500ms in component)
    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(mockAuthenticateWithBiometric).toHaveBeenCalled();
    });
  });

  it('should call onSuccess after successful authentication', async () => {
    mockAuthenticateWithBiometric.mockResolvedValue({ success: true });
    render(<BiometricAccessScreen {...mockProps} />);

    // Fast-forward start timer
    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(mockAuthenticateWithBiometric).toHaveBeenCalled();
    });

    // Fast-forward success delay (500ms in component)
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockProps.onSuccess).toHaveBeenCalled();
  });

  it('should show error and retry button on failed authentication', async () => {
    mockAuthenticateWithBiometric.mockResolvedValue({ success: false, error: 'No reconocido' });
    const { getByText } = render(<BiometricAccessScreen {...mockProps} />);

    // Fast-forward start timer and flush promises
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(mockAuthenticateWithBiometric).toHaveBeenCalled();
    });

    // Flush pending promises
    await act(async () => {
      await Promise.resolve();
    });

    // Should display error
    await waitFor(() => {
      expect(getByText('No reconocido')).toBeTruthy();
    });

    // Should show buttons
    expect(getByText('Intentar de nuevo')).toBeTruthy();
  });

  it('should retry authentication when retry button is pressed', async () => {
    mockAuthenticateWithBiometric.mockResolvedValueOnce({ success: false, error: 'Error 1' });
    const { getByText } = render(<BiometricAccessScreen {...mockProps} />);

    // Fast-forward start timer and flush promises
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(mockAuthenticateWithBiometric).toHaveBeenCalledTimes(1);
    });

    // Flush pending promises
    await act(async () => {
      await Promise.resolve();
    });

    // Wait for retry button to appear after failed auth
    await waitFor(() => {
      expect(getByText('Intentar de nuevo')).toBeTruthy();
    });

    const retryButton = getByText('Intentar de nuevo');

    mockAuthenticateWithBiometric.mockResolvedValueOnce({ success: true });
    fireEvent.press(retryButton);

    await waitFor(() => {
      expect(mockAuthenticateWithBiometric).toHaveBeenCalledTimes(2);
    });
  });

  it('should call onUsePassword when password button is pressed', async () => {
    // We need to wait for auth to fail/finish so buttons appear
    mockAuthenticateWithBiometric.mockResolvedValue({ success: false });
    const { getByText } = render(<BiometricAccessScreen {...mockProps} />);

    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      // Wait for buttons
      expect(getByText('Usar contraseña')).toBeTruthy();
    });

    const passwordButton = getByText('Usar contraseña');
    fireEvent.press(passwordButton);

    expect(mockProps.onUsePassword).toHaveBeenCalled();
  });

  it('should handle authentication exception', async () => {
    mockAuthenticateWithBiometric.mockRejectedValueOnce(new Error('System error'));

    const { getByText } = render(<BiometricAccessScreen {...mockProps} />);

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(getByText('Error inesperado')).toBeTruthy();
    });
  });
});
