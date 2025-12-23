/**
 * BiometricEnableModal Component Tests
 *
 * Tests para el modal de habilitación biométrica.
 */

import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Platform } from 'react-native';
import { BiometricEnableModal } from '../biometric-enable-modal';

// Mock de Platform
const mockPlatform = Platform as { OS: typeof Platform.OS };

// Mock de useAuth
const mockUseAuth = jest.fn();

jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('@/ui/theming', () => ({
  useAppTheme: jest.fn(() => ({
    colors: {
      background: '#fff',
      text: '#000',
      textSecondary: '#666',
      surface: '#f5f5f5',
    },
    tenant: { mainColor: '#007AFF' },
    helpers: {
      getSurface: () => '#fff',
      getText: () => '#000',
    },
  })),
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

// Mock ThemedText
jest.mock('@/ui/primitives/themed-text', () => ({
  ThemedText: (props: { children: React.ReactNode }) => {
    const { Text } = require('react-native');
    return <Text>{props.children}</Text>;
  },
}));

// Mock ThemedView
jest.mock('@/ui/primitives/themed-view', () => ({
  ThemedView: (props: { children: React.ReactNode; style?: unknown }) => {
    const { View } = require('react-native');
    return <View style={props.style}>{props.children}</View>;
  },
}));

// Mock lucide icons
jest.mock('lucide-react-native', () => ({
  ShieldCheck: () => 'ShieldCheckIcon',
  Fingerprint: () => 'FingerprintIcon',
}));

describe('BiometricEnableModal', () => {
  const mockProps = {
    isVisible: true,
    onEnable: jest.fn(),
    onSkip: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      isBiometricAvailable: true,
      biometricType: 'fingerprint',
    });
    mockPlatform.OS = 'android';
  });

  it('should render modal when visible', () => {
    const { getByText } = render(<BiometricEnableModal {...mockProps} />);

    expect(getByText('¿Activar Acceso Rápido?')).toBeTruthy();
  });

  it('should not render content when not visible', () => {
    const { queryByText } = render(<BiometricEnableModal {...mockProps} isVisible={false} />);

    expect(queryByText('¿Activar Acceso Rápido?')).toBeNull();
  });

  it('should show Face ID text on iOS', () => {
    mockPlatform.OS = 'ios';
    const { getByText } = render(<BiometricEnableModal {...mockProps} />);

    expect(getByText(/Face ID/)).toBeTruthy();
  });

  it('should show fingerprint text on Android', () => {
    mockPlatform.OS = 'android';
    const { getByText } = render(<BiometricEnableModal {...mockProps} />);

    expect(getByText(/Huella Digital/)).toBeTruthy();
  });

  it('should return null when biometric is not available', () => {
    mockUseAuth.mockReturnValue({
      isBiometricAvailable: false,
    });
    const { queryByText } = render(<BiometricEnableModal {...mockProps} />);

    expect(queryByText('¿Activar Acceso Rápido?')).toBeNull();
  });

  describe('button interactions', () => {
    it('should call onSkip when skip button is pressed', async () => {
      const { getByText } = render(<BiometricEnableModal {...mockProps} />);
      const skipButton = getByText('Más Tarde');

      await act(async () => {
        fireEvent.press(skipButton);
      });

      expect(mockProps.onSkip).toHaveBeenCalledTimes(1);
    });

    it('should call onEnable when enable button is pressed', async () => {
      mockProps.onEnable.mockResolvedValue(undefined);
      const { getByText } = render(<BiometricEnableModal {...mockProps} />);
      const enableButton = getByText('Activar Ahora');

      await act(async () => {
        fireEvent.press(enableButton);
      });

      expect(mockProps.onEnable).toHaveBeenCalledTimes(1);
    });

    it('should show loading state while enabling', async () => {
      let resolveEnable: (value: void) => void;
      const enablePromise = new Promise<void>((resolve) => {
        resolveEnable = resolve;
      });
      mockProps.onEnable.mockReturnValue(enablePromise);

      const { getByText, queryByText } = render(<BiometricEnableModal {...mockProps} />);
      const enableButton = getByText('Activar Ahora');

      fireEvent.press(enableButton);

      // Wait for loading state - the mock shows "Loading..." when loading=true
      await waitFor(() => {
        expect(queryByText('Loading...')).toBeTruthy();
      });

      await act(async () => {
        resolveEnable!();
      });
    });
  });
});
