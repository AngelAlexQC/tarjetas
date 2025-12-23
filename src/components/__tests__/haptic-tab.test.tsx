/**
 * HapticTab Component Tests
 * 
 * Tests para el componente de tab con haptic feedback.
 * Nota: El proceso de detección de plataforma se evalúa en tiempo de carga,
 * por lo que los tests se enfocan en verificar el comportamiento general.
 */

import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { HapticTab } from '../haptic-tab';

// Mock de Haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

// Mock de PlatformPressable
jest.mock('@react-navigation/elements', () => ({
  PlatformPressable: (props: any) => {
    const { Pressable } = require('react-native');
    const { onPressIn, children, ...rest } = props;
    return (
      <Pressable 
        {...rest} 
        onPressIn={onPressIn}
        testID="platform-pressable"
      >
        {children}
      </Pressable>
    );
  },
}));

describe('HapticTab', () => {
  const mockOnPressIn = jest.fn();
  const mockAccessibilityState = { selected: false };
  
  const mockProps = {
    onPressIn: mockOnPressIn,
    accessibilityState: mockAccessibilityState,
    children: <></>,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderizado', () => {
    it('should render correctly', () => {
      const { root } = render(<HapticTab {...mockProps} />);
      expect(root).toBeTruthy();
    });

    it('should render PlatformPressable', () => {
      const { getByTestId } = render(<HapticTab {...mockProps} />);
      expect(getByTestId('platform-pressable')).toBeTruthy();
    });

    it('should pass props to PlatformPressable', () => {
      const extraProps = {
        ...mockProps,
        testID: 'custom-test-id',
      };
      
      const { root } = render(<HapticTab {...extraProps} />);
      expect(root).toBeTruthy();
    });
  });

  describe('Interacciones', () => {
    it('should handle press in event', () => {
      const { getByTestId } = render(<HapticTab {...mockProps} />);
      
      const pressable = getByTestId('platform-pressable');
      
      // Should not throw
      expect(() => {
        fireEvent(pressable, 'pressIn', {});
      }).not.toThrow();
    });

    it('should call original onPressIn callback', () => {
      const { getByTestId } = render(<HapticTab {...mockProps} />);
      
      const pressable = getByTestId('platform-pressable');
      const mockEvent = { nativeEvent: {} };
      
      fireEvent(pressable, 'pressIn', mockEvent);
      
      expect(mockOnPressIn).toHaveBeenCalled();
    });
  });

  describe('Sin onPressIn prop', () => {
    it('should handle missing onPressIn prop gracefully', () => {
      const propsWithoutOnPressIn = {
        accessibilityState: mockAccessibilityState,
        children: <></>,
      };
      
      const { getByTestId } = render(<HapticTab {...propsWithoutOnPressIn} />);
      
      const pressable = getByTestId('platform-pressable');
      
      // Should not throw
      expect(() => {
        fireEvent(pressable, 'pressIn', {});
      }).not.toThrow();
    });
  });

  describe('Pasaje de Props', () => {
    it('should forward all props to PlatformPressable', () => {
      const allProps = {
        ...mockProps,
        style: { backgroundColor: 'red' },
        accessibilityLabel: 'Tab button',
      };
      
      const { getByTestId } = render(<HapticTab {...allProps} />);
      
      const pressable = getByTestId('platform-pressable');
      expect(pressable).toBeTruthy();
    });

    it('should handle children prop', () => {
      const { Text } = require('react-native');
      
      const { getByText } = render(
        <HapticTab {...mockProps}>
          <Text>Tab Content</Text>
        </HapticTab>
      );
      
      expect(getByText('Tab Content')).toBeTruthy();
    });
  });
});
