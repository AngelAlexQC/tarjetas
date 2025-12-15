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

// Mock de tenant theme context
jest.mock('@/contexts/tenant-theme-context', () => ({
  useTenantTheme: jest.fn(() => ({
    currentTheme: {
      slug: 'test-bank',
      name: 'Test Bank',
      locale: 'es-EC',
      currency: 'USD',
      currencySymbol: '$',
      branding: { logoUrl: null, primaryColor: '#007AFF', secondaryColor: '#5AC8FA' },
    },
  })),
}));

jest.mock('@/hooks/use-app-theme', () => ({
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

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}));

// react-native-reanimated está mockeado globalmente en jest.setup.ts

jest.mock('@/utils/logger', () => ({
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
jest.mock('@/components/themed-text', () => ({
  ThemedText: ({ children, testID }: { children: React.ReactNode, testID?: string }) => {
    const { Text } = require('react-native');
    return <Text testID={testID}>{children}</Text>;
  },
}));

// Mock de lucide icons
jest.mock('lucide-react-native', () => ({
  Fingerprint: () => 'FingerprintIcon',
  ShieldCheck: () => 'ShieldCheckIcon',
}));

// Mock de componentes UI
jest.mock('@/components/ui/themed-button', () => ({
  ThemedButton: ({ title, onPress, disabled, loading }: { 
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

    // Fast-forward start timer
    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(mockAuthenticateWithBiometric).toHaveBeenCalled();
    });

    // Should display error
    expect(getByText('No reconocido')).toBeTruthy();

    // Should show buttons
    expect(getByText('Intentar de nuevo')).toBeTruthy();
  });

  it('should retry authentication when retry button is pressed', async () => {
    mockAuthenticateWithBiometric.mockResolvedValueOnce({ success: false, error: 'Error 1' });
    const { getByText } = render(<BiometricAccessScreen {...mockProps} />);

    // Fast-forward start timer
    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(mockAuthenticateWithBiometric).toHaveBeenCalledTimes(1);
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
