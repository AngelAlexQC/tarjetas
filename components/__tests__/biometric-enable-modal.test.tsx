/**
 * BiometricEnableModal Component Tests
 * 
 * Tests para el modal de habilitación biométrica.
 */

import { fireEvent, render } from '@testing-library/react-native';
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

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

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

    it('should render modal title', () => {
      const { getByText } = render(<BiometricEnableModal {...mockProps} />);
      
      expect(getByText('¿Activar Acceso Rápido?')).toBeTruthy();
    });

    it('should render description', () => {
      const { getByText } = render(<BiometricEnableModal {...mockProps} />);
      
      expect(getByText(/para acceder más rápido/)).toBeTruthy();
    });

    it('should render benefits list', () => {
      const { getByText } = render(<BiometricEnableModal {...mockProps} />);
      
      expect(getByText('Acceso instantáneo')).toBeTruthy();
      expect(getByText('Mayor seguridad')).toBeTruthy();
      expect(getByText('Sin contraseñas')).toBeTruthy();
    });

    it('should render action buttons', () => {
      const { getByText } = render(<BiometricEnableModal {...mockProps} />);
      
      expect(getByText('Activar Ahora')).toBeTruthy();
      expect(getByText('Más Tarde')).toBeTruthy();
    });
  });

  describe('Interacciones', () => {
    it('should call onSkip when skip button is pressed', () => {
      const { getByText } = render(<BiometricEnableModal {...mockProps} />);
      
      fireEvent.press(getByText('Más Tarde'));
      
      expect(mockProps.onSkip).toHaveBeenCalledTimes(1);
    });
  });

  describe('Estructura', () => {
    it('should have View elements', () => {
      const { root } = render(<BiometricEnableModal {...mockProps} />);
      
      const views = root.findAllByType('View');
      expect(views.length).toBeGreaterThan(0);
    });
  });
});
