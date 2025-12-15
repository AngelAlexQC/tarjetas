/**
 * LoginScreen Component Tests
 * 
 * Tests completos para el componente de login incluyendo:
 * - Renderizado correcto
 * - Interacciones de usuario
 * - Validaciones de formulario
 * - Flujos de login exitoso/fallido
 * - Remember username functionality
 */

import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Alert } from 'react-native';
import { LoginScreen } from '../login-screen';

// Mock de Alert
jest.spyOn(Alert, 'alert');

// Mock de useAuth
const mockLogin = jest.fn();
const mockRememberUsername = jest.fn();
const mockGetRememberedUsername = jest.fn();
const mockClearRememberedUsername = jest.fn();

jest.mock('@/contexts/auth-context', () => ({
  useAuth: jest.fn(() => ({
    login: mockLogin,
    rememberUsername: mockRememberUsername,
    getRememberedUsername: mockGetRememberedUsername,
    clearRememberedUsername: mockClearRememberedUsername,
  })),
}));

// Mock de tenant theme context (usado por useAppTheme)
jest.mock('@/contexts/tenant-theme-context', () => ({
  useTenantTheme: jest.fn(() => ({
    currentTheme: {
      slug: 'test-bank',
      name: 'Test Bank',
      locale: 'es-EC',
      currency: 'USD',
      currencySymbol: '$',
      branding: {
        logoUrl: null,
        primaryColor: '#007AFF',
        secondaryColor: '#5AC8FA',
      },
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
  ThemedButton: ({ title, onPress, disabled, loading, testID }: { 
    title: string; 
    onPress: () => void; 
    disabled?: boolean; 
    loading?: boolean;
    testID?: string;
  }) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable 
        onPress={onPress} 
        disabled={disabled || loading}
        testID={testID || `button-${title}`}
      >
        <Text>{loading ? 'Loading...' : title}</Text>
      </Pressable>
    );
  },
}));

jest.mock('@/components/ui/themed-input', () => ({
  ThemedInput: ({ label, value, onChangeText, placeholder, testID }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    testID?: string;
  }) => {
    const { TextInput } = require('react-native');
    return (
      <TextInput
        testID={testID || `input-${label}`}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
      />
    );
  },
}));

jest.mock('@/utils', () => ({
  loggers: {
    auth: {
      info: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
    },
  },
}));

describe('LoginScreen', () => {
  const mockProps = {
    onLoginSuccess: jest.fn(),
    onForgotPassword: jest.fn(),
    onRegister: jest.fn(),
    onEmailLogin: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRememberedUsername.mockResolvedValue(null);
  });

  describe('Renderizado', () => {
    it('should render correctly', () => {
      const { root } = render(<LoginScreen {...mockProps} />);
      expect(root).toBeTruthy();
    });

    it('should render username and password inputs', () => {
      const { getByPlaceholderText } = render(<LoginScreen {...mockProps} />);
      
      expect(getByPlaceholderText('Sofi')).toBeTruthy();
      expect(getByPlaceholderText('••••••••••••')).toBeTruthy();
    });

    it('should render login button', () => {
      const { getByText } = render(<LoginScreen {...mockProps} />);
      
      expect(getByText('Continuar')).toBeTruthy();
    });

    it('should render forgot password link', () => {
      const { getByText } = render(<LoginScreen {...mockProps} />);
      
      expect(getByText('Olvidé mi contraseña')).toBeTruthy();
    });

    it('should render register link', () => {
      const { getByText } = render(<LoginScreen {...mockProps} />);
      
      expect(getByText('Registro')).toBeTruthy();
    });

    it('should render email login button', () => {
      const { getByText } = render(<LoginScreen {...mockProps} />);
      
      expect(getByText('Ingrese con tu email')).toBeTruthy();
    });
  });

  describe('Interacciones de Usuario', () => {
    it('should update username field when typing', () => {
      const { getByPlaceholderText } = render(<LoginScreen {...mockProps} />);
      const usernameInput = getByPlaceholderText('Sofi');
      
      fireEvent.changeText(usernameInput, 'testuser');
      
      expect(usernameInput.props.value).toBe('testuser');
    });

    it('should update password field when typing', () => {
      const { getByPlaceholderText } = render(<LoginScreen {...mockProps} />);
      const passwordInput = getByPlaceholderText('••••••••••••');
      
      fireEvent.changeText(passwordInput, 'password123');
      
      expect(passwordInput.props.value).toBe('password123');
    });

    it('should call onForgotPassword when forgot password link is pressed', () => {
      const { getByText } = render(<LoginScreen {...mockProps} />);
      
      fireEvent.press(getByText('Olvidé mi contraseña'));
      
      expect(mockProps.onForgotPassword).toHaveBeenCalledTimes(1);
    });

    it('should call onRegister when register link is pressed', () => {
      const { getByText } = render(<LoginScreen {...mockProps} />);
      
      fireEvent.press(getByText('Registro'));
      
      expect(mockProps.onRegister).toHaveBeenCalledTimes(1);
    });

    it('should call onEmailLogin when email login button is pressed', () => {
      const { getByText } = render(<LoginScreen {...mockProps} />);
      
      fireEvent.press(getByText('Ingrese con tu email'));
      
      expect(mockProps.onEmailLogin).toHaveBeenCalledTimes(1);
    });

    it('should toggle remember user checkbox', () => {
      const { getByText } = render(<LoginScreen {...mockProps} />);
      
      fireEvent.press(getByText('Recordar mi usuario'));
      // La interacción se registra correctamente
      expect(getByText('Recordar mi usuario')).toBeTruthy();
    });
  });

  describe('Flujo de Login', () => {
    it('should call login with username and password on submit', async () => {
      mockLogin.mockResolvedValue({ success: true });
      
      const { getByPlaceholderText, getByText } = render(<LoginScreen {...mockProps} />);
      
      fireEvent.changeText(getByPlaceholderText('Sofi'), 'testuser');
      fireEvent.changeText(getByPlaceholderText('••••••••••••'), 'password123');
      
      await act(async () => {
        fireEvent.press(getByText('Continuar'));
      });
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
      });
    });

    it('should call onLoginSuccess after successful login', async () => {
      mockLogin.mockResolvedValue({ success: true });
      
      const { getByPlaceholderText, getByText } = render(<LoginScreen {...mockProps} />);
      
      fireEvent.changeText(getByPlaceholderText('Sofi'), 'testuser');
      fireEvent.changeText(getByPlaceholderText('••••••••••••'), 'password123');
      
      await act(async () => {
        fireEvent.press(getByText('Continuar'));
      });
      
      await waitFor(() => {
        expect(mockProps.onLoginSuccess).toHaveBeenCalledTimes(1);
      });
    });

    it('should show error alert on login failure', async () => {
      mockLogin.mockResolvedValue({ success: false, error: 'Invalid credentials' });
      
      const { getByPlaceholderText, getByText } = render(<LoginScreen {...mockProps} />);
      
      fireEvent.changeText(getByPlaceholderText('Sofi'), 'testuser');
      fireEvent.changeText(getByPlaceholderText('••••••••••••'), 'wrongpassword');
      
      await act(async () => {
        fireEvent.press(getByText('Continuar'));
      });
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error de inicio de sesión',
          'Invalid credentials',
          [{ text: 'OK' }]
        );
      });
    });

    it('should show default error message when no error provided', async () => {
      mockLogin.mockResolvedValue({ success: false });
      
      const { getByPlaceholderText, getByText } = render(<LoginScreen {...mockProps} />);
      
      fireEvent.changeText(getByPlaceholderText('Sofi'), 'testuser');
      fireEvent.changeText(getByPlaceholderText('••••••••••••'), 'wrongpassword');
      
      await act(async () => {
        fireEvent.press(getByText('Continuar'));
      });
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error de inicio de sesión',
          'Error al iniciar sesión',
          [{ text: 'OK' }]
        );
      });
    });

    it('should handle unexpected errors during login', async () => {
      mockLogin.mockRejectedValue(new Error('Network error'));
      
      const { getByPlaceholderText, getByText } = render(<LoginScreen {...mockProps} />);
      
      fireEvent.changeText(getByPlaceholderText('Sofi'), 'testuser');
      fireEvent.changeText(getByPlaceholderText('••••••••••••'), 'password123');
      
      await act(async () => {
        fireEvent.press(getByText('Continuar'));
      });
      
      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          'Error',
          'Error inesperado. Intenta de nuevo.',
          [{ text: 'OK' }]
        );
      });
    });
  });

  describe('Remember Username', () => {
    it('should load remembered username on mount', async () => {
      mockGetRememberedUsername.mockResolvedValue('saveduser');
      
      const { getByPlaceholderText } = render(<LoginScreen {...mockProps} />);
      
      await waitFor(() => {
        expect(getByPlaceholderText('Sofi').props.value).toBe('saveduser');
      });
    });

    it('should save username when remember is checked and login succeeds', async () => {
      mockLogin.mockResolvedValue({ success: true });
      
      const { getByPlaceholderText, getByText } = render(<LoginScreen {...mockProps} />);
      
      // Check remember user
      fireEvent.press(getByText('Recordar mi usuario'));
      
      fireEvent.changeText(getByPlaceholderText('Sofi'), 'testuser');
      fireEvent.changeText(getByPlaceholderText('••••••••••••'), 'password123');
      
      await act(async () => {
        fireEvent.press(getByText('Continuar'));
      });
      
      await waitFor(() => {
        expect(mockRememberUsername).toHaveBeenCalledWith('testuser');
      });
    });

    it('should clear remembered username when checkbox unchecked and login succeeds', async () => {
      mockLogin.mockResolvedValue({ success: true });
      mockGetRememberedUsername.mockResolvedValue('saveduser');
      
      const { getByPlaceholderText, getByText } = render(<LoginScreen {...mockProps} />);
      
      await waitFor(() => {
        expect(getByPlaceholderText('Sofi').props.value).toBe('saveduser');
      });
      
      // Uncheck remember user (it's already checked because we loaded a saved user)
      fireEvent.press(getByText('Recordar mi usuario'));
      
      fireEvent.changeText(getByPlaceholderText('••••••••••••'), 'password123');
      
      await act(async () => {
        fireEvent.press(getByText('Continuar'));
      });
      
      await waitFor(() => {
        expect(mockClearRememberedUsername).toHaveBeenCalled();
      });
    });
  });

  describe('Fallback Handlers', () => {
    it('should show alert when onForgotPassword is not provided', () => {
      const propsWithoutHandler = {
        ...mockProps,
        onForgotPassword: undefined,
      };
      
      const { getByText } = render(<LoginScreen {...propsWithoutHandler} />);
      
      fireEvent.press(getByText('Olvidé mi contraseña'));
      
      expect(Alert.alert).toHaveBeenCalledWith(
        'Recuperar Contraseña',
        'Por favor contacta a tu institución financiera para recuperar tu contraseña.',
        [{ text: 'Entendido' }]
      );
    });

    it('should show alert when onRegister is not provided', () => {
      const propsWithoutHandler = {
        ...mockProps,
        onRegister: undefined,
      };
      
      const { getByText } = render(<LoginScreen {...propsWithoutHandler} />);
      
      fireEvent.press(getByText('Registro'));
      
      expect(Alert.alert).toHaveBeenCalledWith(
        'Registro',
        'Para crear una cuenta, visita la sucursal más cercana de tu institución financiera o descarga la app de registro.',
        [{ text: 'Entendido' }]
      );
    });

    it('should show alert when onEmailLogin is not provided', () => {
      const propsWithoutHandler = {
        ...mockProps,
        onEmailLogin: undefined,
      };
      
      const { getByText } = render(<LoginScreen {...propsWithoutHandler} />);
      
      fireEvent.press(getByText('Ingrese con tu email'));
      
      expect(Alert.alert).toHaveBeenCalledWith(
        'Próximamente',
        'El inicio de sesión con email estará disponible pronto.',
        [{ text: 'Entendido' }]
      );
    });
  });
});
