/**
 * BiometricAccessScreen Component Tests
 * 
 * Tests para el componente de acceso biométrico.
 * Se enfocan en renderizado básico debido a la complejidad de la autenticación.
 */

import { render } from '@testing-library/react-native';
import React from 'react';
import { Platform } from 'react-native';
import { BiometricAccessScreen } from '../biometric-access-screen';

// Mock de Platform
const mockPlatform = Platform as { OS: typeof Platform.OS };

// Mock de useAuth
const mockAuthenticateWithBiometric = jest.fn();

jest.mock('@/contexts/auth-context', () => ({
  useAuth: jest.fn(() => ({
    authenticateWithBiometric: mockAuthenticateWithBiometric,
  })),
}));

// Mock de tenant theme context
jest.mock('@/contexts/tenant-theme-context', () => ({
  useTenantTheme: jest.fn(() => ({
    currentTheme: {
      slug: 'test-bank',
      name: 'Test Bank',
      locale: 'es-EC',
      currency: 'USD',
      currencySymbol: '$',
      branding: { logoUrl: null, primaryColor: '#007AFF', secondaryColor: '#5AC8FA' },
    },
  })),
}));

jest.mock('@/hooks/use-app-theme', () => ({
  useAppTheme: jest.fn(() => ({
    colors: { 
      background: '#fff', 
      text: '#000', 
      textSecondary: '#666',
      surface: '#f5f5f5',
    },
    tenant: { mainColor: '#007AFF' },
    mode: 'light',
    isDark: false,
    components: {},
    helpers: {},
  })),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}));

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

jest.mock('@/utils/logger', () => ({
  loggers: {
    biometric: {
      info: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
    },
  },
}));

// Mock de ThemedText
jest.mock('@/components/themed-text', () => ({
  ThemedText: ({ children }: { children: React.ReactNode }) => {
    const { Text } = require('react-native');
    return <Text>{children}</Text>;
  },
}));

// Mock de lucide icons
jest.mock('lucide-react-native', () => ({
  Fingerprint: () => 'FingerprintIcon',
  ShieldCheck: () => 'ShieldCheckIcon',
}));

// Mock de componentes UI
jest.mock('@/components/ui/themed-button', () => ({
  ThemedButton: ({ title, onPress, disabled, loading }: { 
    title: string; 
    onPress: () => void; 
    disabled?: boolean; 
    loading?: boolean;
  }) => {
    const { Pressable, Text } = require('react-native');
    return (
      <Pressable onPress={onPress} disabled={disabled || loading} testID={`button-${title}`}>
        <Text>{loading ? 'Loading...' : title}</Text>
      </Pressable>
    );
  },
}));

describe('BiometricAccessScreen', () => {
  const mockProps = {
    onSuccess: jest.fn(),
    onUsePassword: jest.fn(),
    userName: 'Juan',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockAuthenticateWithBiometric.mockResolvedValue({ success: false });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Renderizado', () => {
    it('should render correctly', () => {
      const { root } = render(<BiometricAccessScreen {...mockProps} />);
      expect(root).toBeTruthy();
    });

    it('should display user greeting when userName is provided', () => {
      const { getByText } = render(<BiometricAccessScreen {...mockProps} />);
      
      expect(getByText('¡Hola, Juan!')).toBeTruthy();
    });

    it('should display biometric access title', () => {
      const { getByText } = render(<BiometricAccessScreen {...mockProps} />);
      
      expect(getByText('Acceso Biométrico')).toBeTruthy();
    });
  });

  describe('Estructura', () => {
    it('should have View elements', () => {
      const { root } = render(<BiometricAccessScreen {...mockProps} />);
      
      const views = root.findAllByType('View');
      expect(views.length).toBeGreaterThan(0);
    });
  });
});
