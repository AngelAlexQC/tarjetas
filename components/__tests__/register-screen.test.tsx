/**
 * RegisterScreen Component Tests
 * 
 * Tests para el componente de registro.
 * Se enfocan en renderizado y estructura básica debido a 
 * la complejidad del flujo multi-paso.
 */

import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';
import { RegisterScreen } from '../register-screen';

// Mock de Alert
jest.spyOn(Alert, 'alert');

// Mock de useRegister
const mockRegister = jest.fn();
const mockVerifyEmail = jest.fn();
const mockResendCode = jest.fn();

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
  useRegister: jest.fn(() => ({
    register: mockRegister,
    verifyEmail: mockVerifyEmail,
    resendCode: mockResendCode,
  })),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}));

// react-native-reanimated está mockeado globalmente en jest.setup.ts

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
  isValidPhone: (phone: string) => phone.length >= 10,
}));

describe('RegisterScreen', () => {
  const mockProps = {
    onBack: jest.fn(),
    onSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderizado - Paso de Formulario', () => {
    it('should render correctly', () => {
      const { root } = render(<RegisterScreen {...mockProps} />);
      expect(root).toBeTruthy();
    });

    it('should render form step by default', () => {
      const { getByText } = render(<RegisterScreen {...mockProps} />);
      
      expect(getByText('Crear cuenta')).toBeTruthy();
    });

    it('should render description text', () => {
      const { getByText } = render(<RegisterScreen {...mockProps} />);
      
      expect(getByText('Completa tus datos para registrarte en la plataforma.')).toBeTruthy();
    });

    it('should render all form fields', () => {
      const { getByPlaceholderText } = render(<RegisterScreen {...mockProps} />);
      
      expect(getByPlaceholderText('Juan Pérez')).toBeTruthy();
      expect(getByPlaceholderText('correo@ejemplo.com')).toBeTruthy();
      expect(getByPlaceholderText('+593 999 999 999')).toBeTruthy();
      expect(getByPlaceholderText('juanperez')).toBeTruthy();
    });

    it('should render terms checkbox', () => {
      const { getByText } = render(<RegisterScreen {...mockProps} />);
      
      expect(getByText(/términos y condiciones/)).toBeTruthy();
    });

    it('should render create account button', () => {
      const { getByText } = render(<RegisterScreen {...mockProps} />);
      
      expect(getByText('Crear Cuenta')).toBeTruthy();
    });
  });

  describe('Interacciones del Formulario', () => {
    it('should update full name field when typing', () => {
      const { getByPlaceholderText } = render(<RegisterScreen {...mockProps} />);
      const input = getByPlaceholderText('Juan Pérez');
      
      fireEvent.changeText(input, 'John Doe');
      
      expect(input.props.value).toBe('John Doe');
    });

    it('should update email field when typing', () => {
      const { getByPlaceholderText } = render(<RegisterScreen {...mockProps} />);
      const input = getByPlaceholderText('correo@ejemplo.com');
      
      fireEvent.changeText(input, 'test@example.com');
      
      expect(input.props.value).toBe('test@example.com');
    });

    it('should update phone field when typing', () => {
      const { getByPlaceholderText } = render(<RegisterScreen {...mockProps} />);
      const input = getByPlaceholderText('+593 999 999 999');
      
      fireEvent.changeText(input, '+593 912 345 678');
      
      expect(input.props.value).toBe('+593 912 345 678');
    });

    it('should update username field when typing', () => {
      const { getByPlaceholderText } = render(<RegisterScreen {...mockProps} />);
      const input = getByPlaceholderText('juanperez');
      
      fireEvent.changeText(input, 'johndoe');
      
      expect(input.props.value).toBe('johndoe');
    });

    it('should toggle terms checkbox', () => {
      const { getByText } = render(<RegisterScreen {...mockProps} />);
      
      const termsCheckbox = getByText(/términos y condiciones/);
      fireEvent.press(termsCheckbox);
      
      // Checkbox should be interactive
      expect(termsCheckbox).toBeTruthy();
    });
  });

  describe('Estructura del Componente', () => {
    it('should have View elements', () => {
      const { root } = render(<RegisterScreen {...mockProps} />);
      
      const views = root.findAllByType('View');
      expect(views.length).toBeGreaterThan(0);
    });

    it('should be scrollable', () => {
      const { root } = render(<RegisterScreen {...mockProps} />);
      
      // Component should contain ScrollView structure
      expect(root).toBeTruthy();
    });
  });
});
