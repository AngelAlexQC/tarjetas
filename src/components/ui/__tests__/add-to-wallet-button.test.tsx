import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Platform } from 'react-native';
import { AddToWalletButton } from '../add-to-wallet-button';

// Mock the theme context and hook completely
jest.mock('@/contexts/tenant-theme-context', () => ({
  useThemedColors: jest.fn(() => ({
    primary: '#007AFF',
    textOnPrimary: '#FFFFFF',
  })),
  useTenantTheme: jest.fn(() => ({
    currentTheme: { branding: { primaryColor: '#007AFF' } },
    colorScheme: 'light',
  })),
}));

// Mock useAppTheme for ThemedText
jest.mock('@/hooks/use-app-theme', () => ({
  useAppTheme: jest.fn(() => ({
    tenant: {
      mainColor: '#007AFF',
    },
    helpers: {
      getText: jest.fn(() => '#000000'),
    },
    colors: {
      text: '#000000',
    },
  })),
}));

describe('AddToWalletButton', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on iOS', () => {
    beforeAll(() => {
      Platform.OS = 'ios';
    });

    it('should render Apple Wallet button on iOS', () => {
      const { getByText } = render(
        <AddToWalletButton onPress={mockOnPress} />
      );
      expect(getByText('Agregar a Apple Wallet')).toBeTruthy();
    });

    it('should call onPress when pressed on iOS', () => {
      const { getByText } = render(
        <AddToWalletButton onPress={mockOnPress} />
      );
      fireEvent.press(getByText('Agregar a Apple Wallet'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should render with custom style on iOS', () => {
      const customStyle = { marginTop: 20 };
      const { root } = render(
        <AddToWalletButton onPress={mockOnPress} style={customStyle} />
      );
      expect(root).toBeTruthy();
    });
  });

  describe('on Android', () => {
    beforeAll(() => {
      Platform.OS = 'android';
    });

    afterAll(() => {
      // Reset to default
      Platform.OS = 'ios';
    });

    it('should render Google Wallet button on Android', () => {
      const { getByText } = render(
        <AddToWalletButton onPress={mockOnPress} />
      );
      expect(getByText('Agregar a la Billetera de Google')).toBeTruthy();
    });

    it('should call onPress when pressed on Android', () => {
      const { getByText } = render(
        <AddToWalletButton onPress={mockOnPress} />
      );
      fireEvent.press(getByText('Agregar a la Billetera de Google'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should render with custom style on Android', () => {
      const customStyle = { marginBottom: 10 };
      const { root } = render(
        <AddToWalletButton onPress={mockOnPress} style={customStyle} />
      );
      expect(root).toBeTruthy();
    });
  });
});
