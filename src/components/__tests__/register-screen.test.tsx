/**
 * RegisterScreen Component Tests
 *
 * Tests para el componente de registro.
 */

import { fireEvent, render, waitFor, act } from '@testing-library/react-native';
import React from 'react';
import { RegisterScreen } from '../register-screen';

// Mock de hooks
const mockRegister = jest.fn();
const mockVerifyEmail = jest.fn();
const mockResendCode = jest.fn();
const mockValidateClient = jest.fn();

jest.mock('@/hooks', () => ({
  useRegister: jest.fn(() => ({
    register: mockRegister,
    verifyEmail: mockVerifyEmail,
    resendCode: mockResendCode,
    validateClient: mockValidateClient,
  })),
  useCountryConfig: jest.fn(() => ({
    documentTypes: [
      { id: 'cc', label: 'Cédula de Ciudadanía', code: 'CC' },
    ],
    countryCode: 'CO',
    phonePrefix: '+57',
  })),
}));

jest.mock('@/ui/theming', () => ({
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

// Mock sub-components
jest.mock('@/components/auth/register-identification-step', () => ({
  RegisterIdentificationStep: ({ onContinue, documentId, setDocumentId, birthDate, setBirthDate, isLoading }: any) => {
    const { View, TextInput, Pressable, Text } = require('react-native');
    return (
      <View testID="identification-step">
        <Text>Identificación</Text>
        <TextInput
          testID="document-input"
          value={documentId}
          onChangeText={setDocumentId}
          placeholder="Documento"
        />
        <TextInput
          testID="birthdate-input"
          value={birthDate}
          onChangeText={setBirthDate}
          placeholder="Fecha de nacimiento"
        />
        <Pressable testID="continue-button" onPress={onContinue} disabled={isLoading}>
          <Text>Continuar</Text>
        </Pressable>
      </View>
    );
  },
}));

jest.mock('@/components/auth/register-client-verification-step', () => ({
  RegisterClientVerificationStep: ({ clientName, onConfirm, onBack }: any) => {
    const { View, Pressable, Text } = require('react-native');
    return (
      <View testID="verification-step">
        <Text>Verificación de cliente</Text>
        <Text testID="client-name">{clientName}</Text>
        <Pressable testID="confirm-button" onPress={onConfirm}>
          <Text>Confirmar</Text>
        </Pressable>
        <Pressable testID="back-button" onPress={onBack}>
          <Text>Volver</Text>
        </Pressable>
      </View>
    );
  },
}));

jest.mock('@/components/auth/register-account-setup-step', () => ({
  RegisterAccountSetupStep: ({ formData, setFormData, onSubmit, isLoading, error }: any) => {
    const { View, TextInput, Pressable, Text } = require('react-native');
    return (
      <View testID="account-setup-step">
        <Text>Configuración de cuenta</Text>
        <TextInput
          testID="email-input"
          value={formData.email}
          onChangeText={(text: string) => setFormData({ email: text })}
          placeholder="correo@ejemplo.com"
        />
        <TextInput
          testID="phone-input"
          value={formData.phone}
          onChangeText={(text: string) => setFormData({ phone: text })}
          placeholder="Teléfono"
        />
        <TextInput
          testID="username-input"
          value={formData.username}
          onChangeText={(text: string) => setFormData({ username: text })}
          placeholder="Usuario"
        />
        <TextInput
          testID="password-input"
          value={formData.password}
          onChangeText={(text: string) => setFormData({ password: text })}
          placeholder="Contraseña"
          secureTextEntry
        />
        <TextInput
          testID="confirm-password-input"
          value={formData.confirmPassword}
          onChangeText={(text: string) => setFormData({ confirmPassword: text })}
          placeholder="Confirmar contraseña"
          secureTextEntry
        />
        {error && <Text testID="error-text">{error}</Text>}
        <Pressable testID="create-button" onPress={onSubmit} disabled={isLoading}>
          <Text>Crear Cuenta</Text>
        </Pressable>
      </View>
    );
  },
}));

jest.mock('@/components/otp-screen', () => ({
  OTPScreen: ({ email, onVerify, onResend, isLoading, error }: any) => {
    const { View, TextInput, Pressable, Text } = require('react-native');
    const ReactModule = require('react');
    const [code, setCode] = ReactModule.useState('');
    return (
      <View testID="otp-step">
        <Text>Verificación OTP</Text>
        <Text>Se envió un código a: {email}</Text>
        <TextInput
          testID="otp-input"
          value={code}
          onChangeText={setCode}
          placeholder="Código OTP"
        />
        {error && <Text testID="error-text">{error}</Text>}
        <Pressable testID="verify-button" onPress={() => onVerify(code)} disabled={isLoading}>
          <Text>Verificar</Text>
        </Pressable>
        <Pressable testID="resend-button" onPress={onResend}>
          <Text>Reenviar</Text>
        </Pressable>
      </View>
    );
  },
}));

jest.mock('@/components/ui/auth-logo-header', () => ({
  AuthLogoHeader: () => 'AuthLogoHeader',
}));

describe('RegisterScreen', () => {
  const mockProps = {
    onBack: jest.fn(),
    onSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderizado inicial', () => {
    it('should render identification step initially', () => {
      const { getByTestId } = render(<RegisterScreen {...mockProps} />);
      expect(getByTestId('identification-step')).toBeTruthy();
    });
  });

  describe('Flujo de registro', () => {
    it('should advance to verification step after successful client validation', async () => {
      mockValidateClient.mockResolvedValue({
        success: true,
        data: { clientName: 'Juan Pérez' },
      });

      const { getByTestId, getByText } = render(<RegisterScreen {...mockProps} />);

      fireEvent.changeText(getByTestId('document-input'), '1234567890');
      fireEvent.changeText(getByTestId('birthdate-input'), '1990-01-01');

      await act(async () => {
        fireEvent.press(getByTestId('continue-button'));
      });

      await waitFor(() => {
        expect(getByText('Verificación de cliente')).toBeTruthy();
        expect(getByTestId('client-name').props.children).toBe('Juan Pérez');
      });
    });

    it('should advance to account setup after confirming identity', async () => {
      mockValidateClient.mockResolvedValue({
        success: true,
        data: { clientName: 'Juan Pérez' },
      });

      const { getByTestId, getByText } = render(<RegisterScreen {...mockProps} />);

      // Step 1
      fireEvent.changeText(getByTestId('document-input'), '1234567890');
      fireEvent.changeText(getByTestId('birthdate-input'), '1990-01-01');
      await act(async () => {
        fireEvent.press(getByTestId('continue-button'));
      });

      // Step 2
      await waitFor(() => {
        expect(getByText('Verificación de cliente')).toBeTruthy();
      });

      await act(async () => {
        fireEvent.press(getByTestId('confirm-button'));
      });

      // Step 3
      await waitFor(() => {
        expect(getByText('Configuración de cuenta')).toBeTruthy();
      });
    });

    it('should advance to OTP after successful registration', async () => {
      mockValidateClient.mockResolvedValue({
        success: true,
        data: { clientName: 'Juan Pérez' },
      });
      mockRegister.mockResolvedValue({ success: true });

      const { getByTestId, getByText } = render(<RegisterScreen {...mockProps} />);

      // Step 1 - Identification
      fireEvent.changeText(getByTestId('document-input'), '1234567890');
      fireEvent.changeText(getByTestId('birthdate-input'), '1990-01-01');
      await act(async () => {
        fireEvent.press(getByTestId('continue-button'));
      });

      // Step 2 - Verification
      await waitFor(() => {
        expect(getByText('Verificación de cliente')).toBeTruthy();
      });
      await act(async () => {
        fireEvent.press(getByTestId('confirm-button'));
      });

      // Step 3 - Account Setup
      await waitFor(() => {
        expect(getByText('Configuración de cuenta')).toBeTruthy();
      });

      fireEvent.changeText(getByTestId('email-input'), 'test@example.com');
      fireEvent.changeText(getByTestId('phone-input'), '+573001234567');
      fireEvent.changeText(getByTestId('username-input'), 'juanperez');
      fireEvent.changeText(getByTestId('password-input'), 'Password123');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'Password123');

      await act(async () => {
        fireEvent.press(getByTestId('create-button'));
      });

      // Step 4 - OTP
      await waitFor(() => {
        expect(getByText('Verificación OTP')).toBeTruthy();
      });
    });
  });

  describe('Manejo de errores', () => {
    it('should show error when client validation fails', async () => {
      mockValidateClient.mockResolvedValue({
        success: false,
        error: 'Cliente no encontrado',
      });

      const { getByTestId } = render(<RegisterScreen {...mockProps} />);

      fireEvent.changeText(getByTestId('document-input'), '1234567890');
      fireEvent.changeText(getByTestId('birthdate-input'), '1990-01-01');

      await act(async () => {
        fireEvent.press(getByTestId('continue-button'));
      });

      // Should still be on identification step
      expect(getByTestId('identification-step')).toBeTruthy();
    });
  });
});
