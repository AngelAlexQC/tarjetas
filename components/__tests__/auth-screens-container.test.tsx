/**
 * AuthScreensContainer Component Tests
 * 
 * Tests para el contenedor de pantallas de autenticación incluyendo:
 * - Navegación entre pantallas
 * - Estado inicial (login)
 * - Transiciones entre todas las pantallas
 */

import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { AuthScreensContainer } from '../auth-screens-container';

// Mock de todos los componentes hijos
jest.mock('../login-screen', () => ({
  LoginScreen: ({ 
    onLoginSuccess, 
    onForgotPassword, 
    onRegister, 
    onEmailLogin 
  }: {
    onLoginSuccess: () => void;
    onForgotPassword: () => void;
    onRegister: () => void;
    onEmailLogin: () => void;
  }) => {
    const { View, Text, Pressable } = jest.requireActual('react-native');

    return (
      <View testID="login-screen">
        <Text>Login Screen</Text>
        <Pressable testID="btn-login-success" onPress={onLoginSuccess}>
          <Text>Login Success</Text>
        </Pressable>
        <Pressable testID="btn-forgot-password" onPress={onForgotPassword}>
          <Text>Forgot Password</Text>
        </Pressable>
        <Pressable testID="btn-register" onPress={onRegister}>
          <Text>Register</Text>
        </Pressable>
        <Pressable testID="btn-email-login" onPress={onEmailLogin}>
          <Text>Email Login</Text>
        </Pressable>
      </View>
    );
  },
}));

jest.mock('../register-screen', () => ({
  RegisterScreen: ({ 
    onBack, 
    onSuccess 
  }: {
    onBack: () => void;
    onSuccess: () => void;
  }) => {
    const { View, Text, Pressable } = jest.requireActual('react-native');

    return (
      <View testID="register-screen">
        <Text>Register Screen</Text>
        <Pressable testID="btn-register-back" onPress={onBack}>
          <Text>Back</Text>
        </Pressable>
        <Pressable testID="btn-register-success" onPress={onSuccess}>
          <Text>Success</Text>
        </Pressable>
      </View>
    );
  },
}));

jest.mock('../forgot-password-screen', () => ({
  ForgotPasswordScreen: ({ 
    onBack, 
    onSuccess 
  }: {
    onBack: () => void;
    onSuccess: () => void;
  }) => {
    const { View, Text, Pressable } = jest.requireActual('react-native');

    return (
      <View testID="forgot-password-screen">
        <Text>Forgot Password Screen</Text>
        <Pressable testID="btn-forgot-back" onPress={onBack}>
          <Text>Back</Text>
        </Pressable>
        <Pressable testID="btn-forgot-success" onPress={onSuccess}>
          <Text>Success</Text>
        </Pressable>
      </View>
    );
  },
}));

jest.mock('../email-login-screen', () => ({
  EmailLoginScreen: ({ 
    onBack, 
    onLoginSuccess, 
    onForgotPassword 
  }: {
    onBack: () => void;
    onLoginSuccess: () => void;
    onForgotPassword: () => void;
  }) => {
    const { View, Text, Pressable } = jest.requireActual('react-native');

    return (
      <View testID="email-login-screen">
        <Text>Email Login Screen</Text>
        <Pressable testID="btn-email-back" onPress={onBack}>
          <Text>Back</Text>
        </Pressable>
        <Pressable testID="btn-email-success" onPress={onLoginSuccess}>
          <Text>Login Success</Text>
        </Pressable>
        <Pressable testID="btn-email-forgot" onPress={onForgotPassword}>
          <Text>Forgot Password</Text>
        </Pressable>
      </View>
    );
  },
}));

describe('AuthScreensContainer', () => {
  const mockOnLoginSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Estado Inicial', () => {
    it('should render correctly', () => {
      const { root } = render(
        <AuthScreensContainer onLoginSuccess={mockOnLoginSuccess} />
      );
      expect(root).toBeTruthy();
    });

    it('should display login screen by default', () => {
      const { getByTestId, getByText } = render(

        <AuthScreensContainer onLoginSuccess={mockOnLoginSuccess} />
      );
      
      expect(getByTestId('login-screen')).toBeTruthy();
      expect(getByText('Login Screen')).toBeTruthy();
    });
  });

  describe('Navegación desde Login', () => {
    it('should call onLoginSuccess when login succeeds', () => {
      const { getByTestId } = render(
        <AuthScreensContainer onLoginSuccess={mockOnLoginSuccess} />
      );
      
      fireEvent.press(getByTestId('btn-login-success'));
      
      expect(mockOnLoginSuccess).toHaveBeenCalledTimes(1);
    });

    it('should navigate to register screen', () => {
      const { getByTestId, getByText } = render(
        <AuthScreensContainer onLoginSuccess={mockOnLoginSuccess} />
      );
      
      fireEvent.press(getByTestId('btn-register'));
      
      expect(getByTestId('register-screen')).toBeTruthy();
      expect(getByText('Register Screen')).toBeTruthy();
    });

    it('should navigate to forgot password screen', () => {
      const { getByTestId, getByText } = render(
        <AuthScreensContainer onLoginSuccess={mockOnLoginSuccess} />
      );
      
      fireEvent.press(getByTestId('btn-forgot-password'));
      
      expect(getByTestId('forgot-password-screen')).toBeTruthy();
      expect(getByText('Forgot Password Screen')).toBeTruthy();
    });

    it('should navigate to email login screen', () => {
      const { getByTestId, getByText } = render(
        <AuthScreensContainer onLoginSuccess={mockOnLoginSuccess} />
      );
      
      fireEvent.press(getByTestId('btn-email-login'));
      
      expect(getByTestId('email-login-screen')).toBeTruthy();
      expect(getByText('Email Login Screen')).toBeTruthy();
    });
  });

  describe('Navegación desde Register', () => {
    it('should navigate back to login from register', () => {
      const { getByTestId, getByText } = render(
        <AuthScreensContainer onLoginSuccess={mockOnLoginSuccess} />
      );
      
      // Navigate to register
      fireEvent.press(getByTestId('btn-register'));
      expect(getByTestId('register-screen')).toBeTruthy();
      
      // Navigate back to login
      fireEvent.press(getByTestId('btn-register-back'));
      expect(getByTestId('login-screen')).toBeTruthy();
      expect(getByText('Login Screen')).toBeTruthy();
    });

    it('should navigate to login after successful registration', () => {
      const { getByTestId, getByText } = render(
        <AuthScreensContainer onLoginSuccess={mockOnLoginSuccess} />
      );
      
      // Navigate to register
      fireEvent.press(getByTestId('btn-register'));
      expect(getByTestId('register-screen')).toBeTruthy();
      
      // Complete registration
      fireEvent.press(getByTestId('btn-register-success'));
      expect(getByTestId('login-screen')).toBeTruthy();
      expect(getByText('Login Screen')).toBeTruthy();
    });
  });

  describe('Navegación desde Forgot Password', () => {
    it('should navigate back to login from forgot password', () => {
      const { getByTestId, getByText } = render(
        <AuthScreensContainer onLoginSuccess={mockOnLoginSuccess} />
      );
      
      // Navigate to forgot password
      fireEvent.press(getByTestId('btn-forgot-password'));
      expect(getByTestId('forgot-password-screen')).toBeTruthy();
      
      // Navigate back to login
      fireEvent.press(getByTestId('btn-forgot-back'));
      expect(getByTestId('login-screen')).toBeTruthy();
      expect(getByText('Login Screen')).toBeTruthy();
    });

    it('should navigate to login after successful password reset', () => {
      const { getByTestId, getByText } = render(
        <AuthScreensContainer onLoginSuccess={mockOnLoginSuccess} />
      );
      
      // Navigate to forgot password
      fireEvent.press(getByTestId('btn-forgot-password'));
      expect(getByTestId('forgot-password-screen')).toBeTruthy();
      
      // Complete password reset
      fireEvent.press(getByTestId('btn-forgot-success'));
      expect(getByTestId('login-screen')).toBeTruthy();
      expect(getByText('Login Screen')).toBeTruthy();
    });
  });

  describe('Navegación desde Email Login', () => {
    it('should navigate back to login from email login', () => {
      const { getByTestId, getByText } = render(
        <AuthScreensContainer onLoginSuccess={mockOnLoginSuccess} />
      );
      
      // Navigate to email login
      fireEvent.press(getByTestId('btn-email-login'));
      expect(getByTestId('email-login-screen')).toBeTruthy();
      
      // Navigate back to login
      fireEvent.press(getByTestId('btn-email-back'));
      expect(getByTestId('login-screen')).toBeTruthy();
      expect(getByText('Login Screen')).toBeTruthy();
    });

    it('should call onLoginSuccess from email login screen', () => {
      const { getByTestId } = render(
        <AuthScreensContainer onLoginSuccess={mockOnLoginSuccess} />
      );
      
      // Navigate to email login
      fireEvent.press(getByTestId('btn-email-login'));
      expect(getByTestId('email-login-screen')).toBeTruthy();
      
      // Press login success
      fireEvent.press(getByTestId('btn-email-success'));
      expect(mockOnLoginSuccess).toHaveBeenCalledTimes(1);
    });

    it('should navigate to forgot password from email login', () => {
      const { getByTestId, getByText } = render(
        <AuthScreensContainer onLoginSuccess={mockOnLoginSuccess} />
      );
      
      // Navigate to email login
      fireEvent.press(getByTestId('btn-email-login'));
      expect(getByTestId('email-login-screen')).toBeTruthy();
      
      // Navigate to forgot password
      fireEvent.press(getByTestId('btn-email-forgot'));
      expect(getByTestId('forgot-password-screen')).toBeTruthy();
      expect(getByText('Forgot Password Screen')).toBeTruthy();
    });
  });

  describe('Flujos Complejos', () => {
    it('should handle: login -> register -> back -> forgot password -> back -> email login', () => {
      const { getByTestId } = render(

        <AuthScreensContainer onLoginSuccess={mockOnLoginSuccess} />
      );
      
      // Start at login
      expect(getByTestId('login-screen')).toBeTruthy();
      
      // Go to register
      fireEvent.press(getByTestId('btn-register'));
      expect(getByTestId('register-screen')).toBeTruthy();
      
      // Back to login
      fireEvent.press(getByTestId('btn-register-back'));
      expect(getByTestId('login-screen')).toBeTruthy();
      
      // Go to forgot password
      fireEvent.press(getByTestId('btn-forgot-password'));
      expect(getByTestId('forgot-password-screen')).toBeTruthy();
      
      // Back to login
      fireEvent.press(getByTestId('btn-forgot-back'));
      expect(getByTestId('login-screen')).toBeTruthy();
      
      // Go to email login
      fireEvent.press(getByTestId('btn-email-login'));
      expect(getByTestId('email-login-screen')).toBeTruthy();
    });

    it('should handle email login -> forgot password -> success -> login', () => {
      const { getByTestId } = render(
        <AuthScreensContainer onLoginSuccess={mockOnLoginSuccess} />
      );
      
      // Start at login, go to email login
      fireEvent.press(getByTestId('btn-email-login'));
      expect(getByTestId('email-login-screen')).toBeTruthy();
      
      // Go to forgot password
      fireEvent.press(getByTestId('btn-email-forgot'));
      expect(getByTestId('forgot-password-screen')).toBeTruthy();
      
      // Complete forgot password, back to login
      fireEvent.press(getByTestId('btn-forgot-success'));
      expect(getByTestId('login-screen')).toBeTruthy();
    });
  });
});
