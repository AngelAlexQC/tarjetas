/**
 * Tests for operations components - focusing on components that don't require full context
 */
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

// Mock dependencies
jest.mock('@/hooks/use-app-theme', () => ({
  useAppTheme: () => ({
    isDark: false,
    colors: {
      text: '#000',
      textSecondary: '#666',
      textDisabled: '#999',
      surface: '#FFF',
      surfaceHigher: '#F5F5F5',
      surfaceElevated: '#F0F0F0',
      border: '#E5E5E5',
      borderSubtle: '#F0F0F0',
      background: '#FFF',
      shadow: '#000',
    },
    tenant: { 
      mainColor: '#007AFF',
    },
    helpers: {
      getText: () => '#000',
    },
  }),
}));

jest.mock('lucide-react-native', () => ({
  DollarSign: () => null,
  Info: () => null,
  Check: () => null,
  Calendar: () => null,
  ChevronDown: () => null,
}));

jest.mock('@/components/themed-text', () => ({
  ThemedText: ({ children, type, variant, style, ...props }: any) => {
    const { Text } = require('react-native');
    return <Text style={style} {...props}>{children}</Text>;
  },
}));

// Import components
import { AmountInput, InfoBox } from '../advance-components';
import { ProgressHeader } from '../defer-components';

describe('Operations Components', () => {
  describe('Advance Components', () => {
    describe('AmountInput', () => {
      it('displays placeholder', () => {
        const { getByPlaceholderText } = render(
          <AmountInput value="" onChangeText={jest.fn()} />
        );
        expect(getByPlaceholderText('0.00')).toBeTruthy();
      });

      it('calls onChangeText on input', () => {
        const onChangeText = jest.fn();
        const { getByPlaceholderText } = render(
          <AmountInput value="" onChangeText={onChangeText} />
        );
        fireEvent.changeText(getByPlaceholderText('0.00'), '100.50');
        expect(onChangeText).toHaveBeenCalledWith('100.50');
      });

      it('displays current value', () => {
        const { getByDisplayValue } = render(
          <AmountInput value="250.00" onChangeText={jest.fn()} />
        );
        expect(getByDisplayValue('250.00')).toBeTruthy();
      });
    });

    describe('InfoBox', () => {
      it('displays message', () => {
        const { getByText } = render(<InfoBox message="Test info message" />);
        expect(getByText('Test info message')).toBeTruthy();
      });
    });
  });

  describe('Defer Components', () => {
    describe('ProgressHeader', () => {
      it('renders step 1/3 for select', () => {
        const { getByText } = render(<ProgressHeader step="select" />);
        expect(getByText('1/3')).toBeTruthy();
      });

      it('renders step 2/3 for term', () => {
        const { getByText } = render(<ProgressHeader step="term" />);
        expect(getByText('2/3')).toBeTruthy();
      });

      it('renders step 3/3 for summary', () => {
        const { getByText } = render(<ProgressHeader step="summary" />);
        expect(getByText('3/3')).toBeTruthy();
      });
    });
  });
});
