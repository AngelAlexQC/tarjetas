/**
 * InstitutionSelectorHeader Component Tests
 * 
 * Tests para el selector de institución.
 */

import { render } from '@testing-library/react-native';
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
}));

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('expo-blur', () => ({
  BlurView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('expo-image', () => ({
  Image: ({ source, onError }: { source: { uri: string }; onError?: () => void }) => {
    const { Image: RNImage } = require('react-native');
    return <RNImage source={source} onError={onError} testID="institution-logo" />;
  },
}));

// Mock de ThemedText
jest.mock('@/components/themed-text', () => ({
  ThemedText: ({ children }: { children: React.ReactNode }) => {
    const { Text } = require('react-native');
    return <Text>{children}</Text>;
  },
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

  describe('Estructura', () => {
    it('should have View elements', () => {
      const { root } = render(<InstitutionSelectorHeader />);
      
      const views = root.findAllByType('View');
      expect(views.length).toBeGreaterThan(0);
    });

    it('should render with hasHeader prop', () => {
      const { root } = render(<InstitutionSelectorHeader hasHeader={true} />);
      expect(root).toBeTruthy();
    });

    it('should render without hasHeader prop', () => {
      const { root } = render(<InstitutionSelectorHeader hasHeader={false} />);
      expect(root).toBeTruthy();
    });
  });
});
