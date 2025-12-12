import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HapticTab } from '../haptic-tab';
import * as Haptics from 'expo-haptics';
import { NavigationContainer } from '@react-navigation/native';

jest.mock('expo-haptics');

const renderWithNavigation = (component: React.ReactElement) => {
  return render(
    <NavigationContainer>
      {component}
    </NavigationContainer>
  );
};

describe('HapticTab', () => {
  const mockProps = {
    onPress: jest.fn(),
    onPressIn: jest.fn(),
    children: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('iOS platform', () => {
    const originalOS = process.env.EXPO_OS;

    beforeAll(() => {
      process.env.EXPO_OS = 'ios';
    });

    afterAll(() => {
      process.env.EXPO_OS = originalOS;
    });

    it('should trigger haptic feedback on press for iOS', () => {
      const { getByTestId } = renderWithNavigation(
        <HapticTab {...mockProps} testID="haptic-tab" />
      );
      
      const tab = getByTestId('haptic-tab');
      fireEvent(tab, 'pressIn');
      
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    });

    it('should call original onPressIn handler after haptic feedback', () => {
      const { getByTestId } = renderWithNavigation(
        <HapticTab {...mockProps} testID="haptic-tab" />
      );
      
      const tab = getByTestId('haptic-tab');
      fireEvent(tab, 'pressIn');
      
      expect(mockProps.onPressIn).toHaveBeenCalled();
      expect(Haptics.impactAsync).toHaveBeenCalled();
    });
  });

  describe('Android platform', () => {
    const originalOS = process.env.EXPO_OS;

    beforeAll(() => {
      process.env.EXPO_OS = 'android';
    });

    afterAll(() => {
      process.env.EXPO_OS = originalOS;
    });

    it('should not trigger haptic feedback on press for Android', () => {
      const { getByTestId } = renderWithNavigation(
        <HapticTab {...mockProps} testID="haptic-tab" />
      );
      
      const tab = getByTestId('haptic-tab');
      fireEvent(tab, 'pressIn');
      
      expect(Haptics.impactAsync).not.toHaveBeenCalled();
    });

    it('should still call original onPressIn handler', () => {
      const { getByTestId } = renderWithNavigation(
        <HapticTab {...mockProps} testID="haptic-tab" />
      );
      
      const tab = getByTestId('haptic-tab');
      fireEvent(tab, 'pressIn');
      
      expect(mockProps.onPressIn).toHaveBeenCalled();
    });
  });

  describe('without onPressIn handler', () => {
    it('should not crash when onPressIn is not provided', () => {
      const propsWithoutOnPressIn = {
        onPress: jest.fn(),
        children: null,
      };

      const { getByTestId } = renderWithNavigation(
        <HapticTab {...propsWithoutOnPressIn} testID="haptic-tab" />
      );
      
      const tab = getByTestId('haptic-tab');
      
      expect(() => {
        fireEvent(tab, 'pressIn');
      }).not.toThrow();
    });
  });

  describe('props forwarding', () => {
    it('should forward all props to PlatformPressable', () => {
      const customProps = {
        ...mockProps,
        accessibilityLabel: 'Custom Tab',
        accessibilityRole: 'button' as const,
      };

      const { getByTestId } = renderWithNavigation(
        <HapticTab {...customProps} testID="haptic-tab" />
      );
      
      const tab = getByTestId('haptic-tab');
      
      expect(tab.props.accessibilityLabel).toBe('Custom Tab');
      expect(tab.props.accessibilityRole).toBe('button');
    });
  });
});
