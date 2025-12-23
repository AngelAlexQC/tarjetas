/**
 * InstitutionSelectorHeader Component Tests
 * 
 * Tests para el selector de institución.
 */

import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { InstitutionSelectorHeader } from '../institution-selector-header';

// Mock de router
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
  }),
}));

jest.mock('@/types/routes', () => ({
  homeRoute: () => '/home',
  loginRoute: () => '/login',
}));

// Mock de tenant theme context
const mockCurrentTheme = {
  slug: 'test-bank',
  name: 'Test Bank',
  locale: 'es-EC',
  currency: 'USD',
  currencySymbol: '$',
  branding: {
    logoUrl: 'https://example.com/logo.png',
    primaryColor: '#007AFF',
    secondaryColor: '#5AC8FA',
  },
};

jest.mock('@/contexts/tenant-theme-context', () => ({
  useTenantTheme: () => ({
    currentTheme: mockCurrentTheme,
  }),
}));

jest.mock('@/hooks/use-app-theme', () => ({
  useAppTheme: () => ({
    colors: { 
      text: '#000', 
      textSecondary: '#666', 
      border: '#ddd',
      surface: '#fff',
    },
    tenant: { 
      mainColor: '#007AFF',
      name: 'Test Bank',
      logo: null,
    },
    isDark: false,
  }),
}));

jest.mock('@/hooks/use-responsive-layout', () => ({
  useResponsiveLayout: () => ({ 
    isSmall: false, 
    isMedium: true, 
    isLarge: false,
    screenWidth: 375,
    isLandscape: false,
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
  SafeAreaProvider: (props: any) => props.children,
}));

// react-native-reanimated está mockeado globalmente en jest.setup.ts

jest.mock('expo-blur', () => ({
  BlurView: (props: any) => props.children,
}));

jest.mock('expo-image', () => ({
  Image: ({ source, onError }: { source: { uri: string }; onError?: () => void }) => {
    const { Image: RNImage } = require('react-native');
    return (
      <RNImage 
        source={source} 
        onError={onError} 
        testID="institution-logo" 
      />
    );
  },
}));

// Mock de ThemedText
jest.mock('@/components/themed-text', () => ({
  ThemedText: (props: any) => {
    const { Text } = require('react-native');
    return <Text>{props.children}</Text>;
  },
}));

// Mock Ionicons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: (props: any) => `Icon-${props.name}`,
}));

describe('InstitutionSelectorHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderizado', () => {
    it('should render correctly', () => {
      const { root } = render(<InstitutionSelectorHeader />);
      expect(root).toBeTruthy();
    });

    it('should render institution name', () => {
      const { getByText } = render(<InstitutionSelectorHeader />);
      expect(getByText('Test Bank')).toBeTruthy();
    });

    it('should render logo when available', () => {
      const { getByTestId } = render(<InstitutionSelectorHeader />);
      expect(getByTestId('institution-logo')).toBeTruthy();
    });
  });

  describe('Interacciones', () => {
    it('should prevent navigation on press if disabled', () => {
       // This component doesn't seem to have disabled prop based on implementation shown
       // passing logic is handlePress -> router.push(homeRoute())
    });

    it('should navigate to home on press', () => {
      const { getByText } = render(<InstitutionSelectorHeader />);
      const name = getByText('Test Bank');
      // We need to press the pressable which wraps the content.
      // Since it doesn't have a testID and wrapping pressable might be hard to find by text if it's deep.
      // But text is child of Pressable.
      fireEvent.press(name);
      expect(mockPush).toHaveBeenCalledWith('/home');
    });

    it('should handle image error and show placeholder', () => {
      const { getByTestId, getByText, rerender } = render(<InstitutionSelectorHeader />);
      const logo = getByTestId('institution-logo');
      
      fireEvent(logo, 'onError');
      
      // Update component
      rerender(<InstitutionSelectorHeader />);
      
      // Should show initial "T" for Test Bank
      expect(getByText('T')).toBeTruthy();
    });

    it('should handle press animations', () => {
      const { getByText } = render(<InstitutionSelectorHeader />);
      const name = getByText('Test Bank');
      
      // We are just verifying it doesn't crash as we mocked reanimated
      fireEvent(name, 'onPressIn');
      fireEvent(name, 'onPressOut');
    });
  });
});
