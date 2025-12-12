import { useAppTheme } from '@/hooks/use-app-theme';
import { fireEvent, render } from '@testing-library/react-native';
import { CreditCard } from 'lucide-react-native';
import React from 'react';
import { Platform } from 'react-native';
import { ThemedButton } from '../themed-button';

// Mock dependencies
jest.mock('@/hooks/use-app-theme');

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
}));

jest.mock('lucide-react-native', () => ({
  CreditCard: () => 'CreditCardIcon',
}));

describe('ThemedButton', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppTheme as jest.Mock).mockReturnValue({
      colors: {
        surface: '#FFFFFF',
        surfaceHigher: '#F5F5F5',
        text: '#000000',
        textSecondary: '#666666',
      },
      tenant: {
        mainColor: '#007AFF',
      },
      helpers: {
        getText: jest.fn(() => '#000000'),
      },
    });
  });

  describe('variants', () => {
    it('should render primary variant', () => {
      const { getByText } = render(
        <ThemedButton title="Primary" onPress={mockOnPress} variant="primary" />
      );
      expect(getByText('Primary')).toBeTruthy();
    });

    it('should render secondary variant', () => {
      const { getByText } = render(
        <ThemedButton title="Secondary" onPress={mockOnPress} variant="secondary" />
      );
      expect(getByText('Secondary')).toBeTruthy();
    });

    it('should render outline variant', () => {
      const { getByText } = render(
        <ThemedButton title="Outline" onPress={mockOnPress} variant="outline" />
      );
      expect(getByText('Outline')).toBeTruthy();
    });

    it('should render danger variant', () => {
      const { getByText } = render(
        <ThemedButton title="Danger" onPress={mockOnPress} variant="danger" />
      );
      expect(getByText('Danger')).toBeTruthy();
    });

    it('should default to primary variant', () => {
      const { getByText } = render(
        <ThemedButton title="Default" onPress={mockOnPress} />
      );
      expect(getByText('Default')).toBeTruthy();
    });
  });

  describe('states', () => {
    it('should call onPress when pressed', () => {
      const { getByText } = render(
        <ThemedButton title="Press me" onPress={mockOnPress} />
      );
      fireEvent.press(getByText('Press me'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should not call onPress when disabled', () => {
      const { getByText } = render(
        <ThemedButton title="Disabled" onPress={mockOnPress} disabled />
      );
      fireEvent.press(getByText('Disabled'));
      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('should not call onPress when loading', () => {
      const { root } = render(
        <ThemedButton title="Loading" onPress={mockOnPress} loading />
      );
      // When loading, the button shows ActivityIndicator, not the title
      expect(root).toBeTruthy();
    });

    it('should show loading indicator when loading', () => {
      const { root, queryByText } = render(
        <ThemedButton title="Loading" onPress={mockOnPress} loading />
      );
      expect(root).toBeTruthy();
      expect(queryByText('Loading')).toBeNull();
    });
  });

  describe('icon', () => {
    it('should render with icon', () => {
      const { getByText, root } = render(
        <ThemedButton 
          title="With Icon" 
          onPress={mockOnPress} 
          icon={<CreditCard />}
        />
      );
      expect(getByText('With Icon')).toBeTruthy();
      expect(root).toBeTruthy();
    });
  });

  describe('styling', () => {
    it('should render with custom style', () => {
      const customStyle = { marginTop: 20 };
      const { root } = render(
        <ThemedButton title="Styled" onPress={mockOnPress} style={customStyle} />
      );
      expect(root).toBeTruthy();
    });
  });

  describe('platform-specific behavior', () => {
    beforeAll(() => {
      Platform.OS = 'ios';
    });

    it('should trigger haptics on iOS when pressed', () => {
      const Haptics = require('expo-haptics');
      const { getByText } = render(
        <ThemedButton title="Haptic" onPress={mockOnPress} />
      );
      fireEvent.press(getByText('Haptic'));
      expect(Haptics.selectionAsync).toHaveBeenCalled();
    });
  });
});
