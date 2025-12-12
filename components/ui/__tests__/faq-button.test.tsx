import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Platform } from 'react-native';
import { FaqButton } from '../faq-button';

// Mock the theme context and hook completely
jest.mock('@/contexts/tenant-theme-context', () => ({
  useThemedColors: jest.fn(() => ({
    border: '#E0E0E0',
    text: '#000000',
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

jest.mock('lucide-react-native', () => ({
  Info: 'Info',
}));

describe('FaqButton', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on iOS', () => {
    beforeAll(() => {
      Platform.OS = 'ios';
    });

    it('should render correctly on iOS', () => {
      const { getByText } = render(<FaqButton onPress={mockOnPress} />);
      expect(getByText('Cómo funciona tu tarjeta, aquí te explicamos')).toBeTruthy();
    });

    it('should call onPress when pressed on iOS', () => {
      const { getByText } = render(<FaqButton onPress={mockOnPress} />);
      fireEvent.press(getByText('Cómo funciona tu tarjeta, aquí te explicamos'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should render with custom style on iOS', () => {
      const customStyle = { marginTop: 10 };
      const { root } = render(
        <FaqButton onPress={mockOnPress} style={customStyle} />
      );
      expect(root).toBeTruthy();
    });
  });

  describe('on Android', () => {
    beforeAll(() => {
      Platform.OS = 'android';
    });

    afterAll(() => {
      Platform.OS = 'ios';
    });

    it('should render correctly on Android', () => {
      const { getByText } = render(<FaqButton onPress={mockOnPress} />);
      expect(getByText('Cómo funciona tu tarjeta, aquí te explicamos')).toBeTruthy();
    });

    it('should call onPress when pressed on Android', () => {
      const { getByText } = render(<FaqButton onPress={mockOnPress} />);
      fireEvent.press(getByText('Cómo funciona tu tarjeta, aquí te explicamos'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should render with custom style on Android', () => {
      const customStyle = { marginBottom: 10 };
      const { root } = render(
        <FaqButton onPress={mockOnPress} style={customStyle} />
      );
      expect(root).toBeTruthy();
    });
  });
});
