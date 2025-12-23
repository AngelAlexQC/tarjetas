/**
 * ForgotPasswordScreen Component Tests
 *
 * Tests para el componente de recuperación de contraseña.
 */

import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { ForgotPasswordScreen } from '../forgot-password-screen';

// Mock hooks
const mockSendRecoveryCode = jest.fn();
const mockVerifyCode = jest.fn();
const mockResetPassword = jest.fn();

jest.mock('@/hooks', () => ({
  usePasswordRecovery: jest.fn(() => ({
    sendRecoveryCode: mockSendRecoveryCode,
    verifyCode: mockVerifyCode,
    resetPassword: mockResetPassword,
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

// Mock sub-components to simplify testing
jest.mock('@/components/auth/recovery-input-screen', () => ({
  RecoveryInputScreen: ({ onSubmit, formData, setFormData, error, isLoading }: any) => {
    const { View, TextInput, Pressable, Text } = require('react-native');
    return (
      <View testID="recovery-input-screen">
        <TextInput
          testID="account-input"
          value={formData.accountNumber}
          onChangeText={(text: string) => setFormData({ ...formData, accountNumber: text })}
          placeholder="Número de cuenta"
        />
        <TextInput
          testID="birth-date-input"
          value={formData.birthDate}
          onChangeText={(text: string) => setFormData({ ...formData, birthDate: text })}
          placeholder="Fecha de nacimiento"
        />
        {error && <Text testID="error-text">{error}</Text>}
        <Pressable testID="send-code-button" onPress={onSubmit} disabled={isLoading}>
          <Text>{isLoading ? 'Cargando...' : 'Enviar Código'}</Text>
        </Pressable>
      </View>
    );
  },
}));

jest.mock('@/components/auth/recovery-code-screen', () => ({
  RecoveryCodeScreen: ({ onVerify, onResend, code, setCode, error, isLoading }: any) => {
    const { View, TextInput, Pressable, Text } = require('react-native');
    return (
      <View testID="recovery-code-screen">
        <Text>Verifica tu identidad</Text>
        <TextInput
          testID="code-input"
          value={code}
          onChangeText={setCode}
          placeholder="Código"
        />
        {error && <Text testID="error-text">{error}</Text>}
        <Pressable testID="verify-button" onPress={onVerify} disabled={isLoading}>
          <Text>Verificar</Text>
        </Pressable>
        <Pressable testID="resend-button" onPress={onResend}>
          <Text>Reenviar</Text>
        </Pressable>
      </View>
    );
  },
}));

jest.mock('@/components/auth/recovery-new-password-screen', () => ({
  RecoveryNewPasswordScreen: ({ onSubmit, newPassword, setNewPassword, confirmPassword, setConfirmPassword, error, isLoading }: any) => {
    const { View, TextInput, Pressable, Text } = require('react-native');
    return (
      <View testID="recovery-password-screen">
        <Text>Nueva contraseña</Text>
        <TextInput
          testID="new-password-input"
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Nueva contraseña"
          secureTextEntry
        />
        <TextInput
          testID="confirm-password-input"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirmar contraseña"
          secureTextEntry
        />
        {error && <Text testID="error-text">{error}</Text>}
        <Pressable testID="reset-button" onPress={onSubmit} disabled={isLoading}>
          <Text>Cambiar</Text>
        </Pressable>
      </View>
    );
  },
}));

jest.mock('@/components/auth/recovery-success-screen', () => ({
  RecoverySuccessScreen: ({ onSuccess }: { onSuccess: () => void }) => {
    const { View, Pressable, Text } = require('react-native');
    return (
      <View testID="recovery-success-screen">
        <Text>¡Contraseña actualizada!</Text>
        <Pressable testID="success-button" onPress={onSuccess}>
          <Text>Continuar</Text>
        </Pressable>
      </View>
    );
  },
}));

jest.mock('@/components/ui/auth-logo-header', () => ({
  AuthLogoHeader: () => 'AuthLogoHeader',
}));

jest.mock('@/utils', () => ({
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

  describe('Renderizado inicial', () => {
    it('should render recovery input screen initially', () => {
      const { getByTestId } = render(<ForgotPasswordScreen {...mockProps} />);
      expect(getByTestId('recovery-input-screen')).toBeTruthy();
    });
  });

  describe('Paso 1: Validación de identidad', () => {
    it('should show error when account number is empty', async () => {
      const { getByTestId } = render(<ForgotPasswordScreen {...mockProps} />);

      await act(async () => {
        fireEvent.press(getByTestId('send-code-button'));
      });

      expect(getByTestId('error-text')).toBeTruthy();
    });

    it('should call sendRecoveryCode on valid submission', async () => {
      mockSendRecoveryCode.mockResolvedValue({ success: true });
      const { getByTestId } = render(<ForgotPasswordScreen {...mockProps} />);

      fireEvent.changeText(getByTestId('account-input'), '1234567890');
      fireEvent.changeText(getByTestId('birth-date-input'), '1990-01-01');

      await act(async () => {
        fireEvent.press(getByTestId('send-code-button'));
      });

      expect(mockSendRecoveryCode).toHaveBeenCalled();
    });

    it('should advance to code step on success', async () => {
      mockSendRecoveryCode.mockResolvedValue({ success: true });
      const { getByTestId, getByText } = render(<ForgotPasswordScreen {...mockProps} />);

      fireEvent.changeText(getByTestId('account-input'), '1234567890');
      fireEvent.changeText(getByTestId('birth-date-input'), '1990-01-01');

      await act(async () => {
        fireEvent.press(getByTestId('send-code-button'));
      });

      await waitFor(() => {
        expect(getByText('Verifica tu identidad')).toBeTruthy();
      });
    });
  });

  describe('Paso 2: Verificación de código', () => {
    beforeEach(async () => {
      mockSendRecoveryCode.mockResolvedValue({ success: true });
    });

    it('should show error when code is too short', async () => {
      const { getByTestId, getByText } = render(<ForgotPasswordScreen {...mockProps} />);

      // Advance to code step
      fireEvent.changeText(getByTestId('account-input'), '1234567890');
      fireEvent.changeText(getByTestId('birth-date-input'), '1990-01-01');
      await act(async () => {
        fireEvent.press(getByTestId('send-code-button'));
      });

      await waitFor(() => {
        expect(getByText('Verifica tu identidad')).toBeTruthy();
      });

      // Try to verify with short code
      fireEvent.changeText(getByTestId('code-input'), '123');
      await act(async () => {
        fireEvent.press(getByTestId('verify-button'));
      });

      expect(getByTestId('error-text')).toBeTruthy();
    });

    it('should call verifyCode and advance on success', async () => {
      mockVerifyCode.mockResolvedValue({ success: true });
      const { getByTestId, getByText } = render(<ForgotPasswordScreen {...mockProps} />);

      // Advance to code step
      fireEvent.changeText(getByTestId('account-input'), '1234567890');
      fireEvent.changeText(getByTestId('birth-date-input'), '1990-01-01');
      await act(async () => {
        fireEvent.press(getByTestId('send-code-button'));
      });

      await waitFor(() => {
        expect(getByText('Verifica tu identidad')).toBeTruthy();
      });

      // Verify code
      fireEvent.changeText(getByTestId('code-input'), '123456');
      await act(async () => {
        fireEvent.press(getByTestId('verify-button'));
      });

      await waitFor(() => {
        expect(getByText('Nueva contraseña')).toBeTruthy();
      });
    });
  });

  describe('Paso 3: Nueva contraseña', () => {
    beforeEach(async () => {
      mockSendRecoveryCode.mockResolvedValue({ success: true });
      mockVerifyCode.mockResolvedValue({ success: true });
    });

    const advanceToPasswordStep = async (getByTestId: any, getByText: any) => {
      fireEvent.changeText(getByTestId('account-input'), '1234567890');
      fireEvent.changeText(getByTestId('birth-date-input'), '1990-01-01');
      await act(async () => {
        fireEvent.press(getByTestId('send-code-button'));
      });

      await waitFor(() => {
        expect(getByText('Verifica tu identidad')).toBeTruthy();
      });

      fireEvent.changeText(getByTestId('code-input'), '123456');
      await act(async () => {
        fireEvent.press(getByTestId('verify-button'));
      });

      await waitFor(() => {
        expect(getByText('Nueva contraseña')).toBeTruthy();
      });
    };

    it('should show error when password is too short', async () => {
      const { getByTestId, getByText } = render(<ForgotPasswordScreen {...mockProps} />);
      await advanceToPasswordStep(getByTestId, getByText);

      fireEvent.changeText(getByTestId('new-password-input'), '123');
      fireEvent.changeText(getByTestId('confirm-password-input'), '123');

      await act(async () => {
        fireEvent.press(getByTestId('reset-button'));
      });

      expect(getByTestId('error-text')).toBeTruthy();
    });

    it('should show error when passwords do not match', async () => {
      const { getByTestId, getByText } = render(<ForgotPasswordScreen {...mockProps} />);
      await advanceToPasswordStep(getByTestId, getByText);

      fireEvent.changeText(getByTestId('new-password-input'), 'password123');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'password456');

      await act(async () => {
        fireEvent.press(getByTestId('reset-button'));
      });

      expect(getByTestId('error-text')).toBeTruthy();
    });

    it('should call resetPassword and show success', async () => {
      mockResetPassword.mockResolvedValue({ success: true });
      const { getByTestId, getByText } = render(<ForgotPasswordScreen {...mockProps} />);
      await advanceToPasswordStep(getByTestId, getByText);

      fireEvent.changeText(getByTestId('new-password-input'), 'password123');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'password123');

      await act(async () => {
        fireEvent.press(getByTestId('reset-button'));
      });

      await waitFor(() => {
        expect(getByText('¡Contraseña actualizada!')).toBeTruthy();
      });
    });
  });

  describe('Paso 4: Éxito', () => {
    it('should call onSuccess when continuing', async () => {
      mockSendRecoveryCode.mockResolvedValue({ success: true });
      mockVerifyCode.mockResolvedValue({ success: true });
      mockResetPassword.mockResolvedValue({ success: true });

      const { getByTestId, getByText } = render(<ForgotPasswordScreen {...mockProps} />);

      // Complete full flow
      fireEvent.changeText(getByTestId('account-input'), '1234567890');
      fireEvent.changeText(getByTestId('birth-date-input'), '1990-01-01');
      await act(async () => {
        fireEvent.press(getByTestId('send-code-button'));
      });

      await waitFor(() => {
        expect(getByText('Verifica tu identidad')).toBeTruthy();
      });

      fireEvent.changeText(getByTestId('code-input'), '123456');
      await act(async () => {
        fireEvent.press(getByTestId('verify-button'));
      });

      await waitFor(() => {
        expect(getByText('Nueva contraseña')).toBeTruthy();
      });

      fireEvent.changeText(getByTestId('new-password-input'), 'password123');
      fireEvent.changeText(getByTestId('confirm-password-input'), 'password123');
      await act(async () => {
        fireEvent.press(getByTestId('reset-button'));
      });

      await waitFor(() => {
        expect(getByText('¡Contraseña actualizada!')).toBeTruthy();
      });

      fireEvent.press(getByTestId('success-button'));
      expect(mockProps.onSuccess).toHaveBeenCalled();
    });
  });
});
