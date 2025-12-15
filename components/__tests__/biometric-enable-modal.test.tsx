/**
 * BiometricEnableModal Component Tests
 * 
 * Tests para el modal de habilitación biométrica.
 */

import { act, fireEvent, render } from '@testing-library/react-native';
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
    helpers: {
      getSurface: () => '#fff',
      getText: () => '#000',
    },
  })),
}));

// react-native-reanimated está mockeado globalmente en jest.setup.ts

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

// Mock ThemedText
jest.mock('@/components/themed-text', () => ({
  ThemedText: ({ children }: { children: React.ReactNode }) => {
    const { Text } = require('react-native');
    return <Text>{children}</Text>;
  },
}));

// Mock ThemedView
jest.mock('@/components/themed-view', () => ({
  ThemedView: ({ children, style }: { children: React.ReactNode, style: any }) => {
    const { View } = require('react-native');
    return <View style={style}>{children}</View>;
  },
}));

// Mock Icons
jest.mock('lucide-react-native', () => ({
  Fingerprint: () => 'FingerprintIcon',
  ShieldCheck: () => 'ShieldCheckIcon',
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
    });
  });

  describe('Renderizado', () => {
    it('should render correctly when visible and biometric available', () => {
      const { root } = render(<BiometricEnableModal {...mockProps} />);
      expect(root).toBeTruthy();
    });

    it('should return null if biometric is not available', () => {
      mockUseAuth.mockReturnValue({ isBiometricAvailable: false });
      const { toJSON } = render(<BiometricEnableModal {...mockProps} />);
      expect(toJSON()).toBeNull();
    });

    it('should render correct text based on Platform', () => {
       // Default is iOS in mock setup usually or we can spy on it. 
       // Platform.OS is mocked at top level.
       mockPlatform.OS = 'ios';
       const { getByText, rerender } = render(<BiometricEnableModal {...mockProps} />);
       expect(getByText(/Face ID \/ Touch ID/)).toBeTruthy();

       mockPlatform.OS = 'android';
       rerender(<BiometricEnableModal {...mockProps} />);
       expect(getByText(/Huella Digital/)).toBeTruthy();
    });
  });

  describe('Interacciones', () => {
    it('should call onSkip when skip button is pressed', () => {
      const { getByText } = render(<BiometricEnableModal {...mockProps} />);
      fireEvent.press(getByText('Más Tarde'));
      expect(mockProps.onSkip).toHaveBeenCalledTimes(1);
    });

    it('should call onEnable when enable button is pressed', async () => {
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

      const { getByText } = render(<BiometricEnableModal {...mockProps} />);
      const enableButton = getByText('Activar Ahora');
      
      fireEvent.press(enableButton);
      
      // Check loading state (button text changes to Loading... in our mock)
      expect(getByText('Loading...')).toBeTruthy();

      await act(async () => {
         resolveEnable!();
      });
    });
  });
});
