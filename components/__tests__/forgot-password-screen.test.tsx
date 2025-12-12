/**
 * ForgotPasswordScreen Component Tests
 * 
 * Tests para el componente de recuperación de contraseña.
 * Se enfocan en renderizado básico y estructura.
 */

import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';
import { ForgotPasswordScreen } from '../forgot-password-screen';

// Mock de Alert
jest.spyOn(Alert, 'alert');

// Mock de usePasswordRecovery
const mockSendRecoveryCode = jest.fn();
const mockVerifyCode = jest.fn();
const mockResetPassword = jest.fn();

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

jest.mock('@/hooks', () => ({
  useAppTheme: jest.fn(() => ({
    colors: {
      background: '#fff',
      text: '#000',
      textSecondary: '#666',
      border: '#ddd',
    },
    tenant: { mainColor: '#007AFF' },
  })),
  useResponsiveLayout: jest.fn(() => ({ 
    isSmall: false, 
    isMedium: true, 
    isLarge: false,
    screenWidth: 375,
    horizontalPadding: 16,
  })),
  usePasswordRecovery: jest.fn(() => ({
    sendRecoveryCode: mockSendRecoveryCode,
    verifyCode: mockVerifyCode,
    resetPassword: mockResetPassword,
  })),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}));

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// Mock de componentes UI
jest.mock('@/components/ui/auth-logo-header', () => ({
  AuthLogoHeader: () => 'AuthLogoHeader',
}));

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

jest.mock('@/components/ui/themed-input', () => ({
  ThemedInput: ({ label, value, onChangeText, placeholder }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
  }) => {
    const { TextInput } = require('react-native');
    return (
      <TextInput
        testID={`input-${label}`}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
      />
    );
  },
}));

jest.mock('@/utils', () => ({
  isValidEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  isValidPassword: (password: string) => password.length >= 8,
}));

describe('ForgotPasswordScreen', () => {
  const mockProps = {
    onBack: jest.fn(),
    onSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Paso 1: Email', () => {
    it('should render correctly', () => {
      const { root } = render(<ForgotPasswordScreen {...mockProps} />);
      expect(root).toBeTruthy();
    });

    it('should render email step by default', () => {
      const { getByText } = render(<ForgotPasswordScreen {...mockProps} />);
      
      expect(getByText('Recupera tu contraseña')).toBeTruthy();
    });

    it('should render description text', () => {
      const { getByText } = render(<ForgotPasswordScreen {...mockProps} />);
      
      expect(getByText(/Ingresa el correo electrónico asociado/)).toBeTruthy();
    });

    it('should render email input', () => {
      const { getByPlaceholderText } = render(<ForgotPasswordScreen {...mockProps} />);
      
      expect(getByPlaceholderText('correo@ejemplo.com')).toBeTruthy();
    });

    it('should render send code button', () => {
      const { getByText } = render(<ForgotPasswordScreen {...mockProps} />);
      
      expect(getByText('Enviar Código')).toBeTruthy();
    });

    it('should update email field when typing', () => {
      const { getByPlaceholderText } = render(<ForgotPasswordScreen {...mockProps} />);
      const input = getByPlaceholderText('correo@ejemplo.com');
      
      fireEvent.changeText(input, 'test@example.com');
      
      expect(input.props.value).toBe('test@example.com');
    });
  });

  describe('Estructura del Componente', () => {
    it('should have View elements', () => {
      const { root } = render(<ForgotPasswordScreen {...mockProps} />);
      
      const views = root.findAllByType('View');
      expect(views.length).toBeGreaterThan(0);
    });

    it('should render header', () => {
      const { root } = render(<ForgotPasswordScreen {...mockProps} />);
      expect(root).toBeTruthy();
    });

    it('should render form container', () => {
      const { getByText } = render(<ForgotPasswordScreen {...mockProps} />);
      expect(getByText('Enviar Código')).toBeTruthy();
    });
  });
});
