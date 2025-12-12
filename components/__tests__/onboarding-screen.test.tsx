/**
 * OnboardingScreen Component Tests
 * 
 * Tests para el componente de onboarding.
 * Se enfocan en renderizado básico debido a la complejidad de animaciones.
 */

import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Dimensions } from 'react-native';
import { OnboardingScreen } from '../onboarding-screen';

// Mock de Dimensions
jest.spyOn(Dimensions, 'get').mockReturnValue({ 
  width: 375, 
  height: 812, 
  scale: 2, 
  fontScale: 1 
});

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
      textSecondary: '#666' 
    },
    tenant: { 
      mainColor: '#007AFF', 
      secondaryColor: '#5AC8FA',
      name: 'Test' 
    },
  })),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
}));

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => children,
}));

describe('OnboardingScreen', () => {
  const mockOnFinish = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderizado', () => {
    it('should render correctly', () => {
      const { root } = render(<OnboardingScreen onFinish={mockOnFinish} />);
      expect(root).toBeTruthy();
    });

    it('should render first slide by default', () => {
      const { getByText } = render(<OnboardingScreen onFinish={mockOnFinish} />);
      
      expect(getByText('Una Nueva Experiencia')).toBeTruthy();
    });

    it('should render slide description', () => {
      const { getByText } = render(<OnboardingScreen onFinish={mockOnFinish} />);
      
      expect(getByText(/Gestiona tus finanzas de manera inteligente/)).toBeTruthy();
    });

    it('should render next button on first slide', () => {
      const { getByText } = render(<OnboardingScreen onFinish={mockOnFinish} />);
      
      expect(getByText('Siguiente')).toBeTruthy();
    });
  });

  describe('Contenido de Slides', () => {
    it('should have correct content for slide 1', () => {
      const { getByText } = render(<OnboardingScreen onFinish={mockOnFinish} />);
      
      expect(getByText('Una Nueva Experiencia')).toBeTruthy();
    });

    it('should contain slide 2 content', () => {
      const { getByText } = render(<OnboardingScreen onFinish={mockOnFinish} />);
      
      expect(getByText('Control Total')).toBeTruthy();
    });

    it('should contain slide 3 content', () => {
      const { getByText } = render(<OnboardingScreen onFinish={mockOnFinish} />);
      
      expect(getByText('Comienza Ahora')).toBeTruthy();
    });
  });

  describe('Interacciones', () => {
    it('should have pressable button', () => {
      const { getByText } = render(<OnboardingScreen onFinish={mockOnFinish} />);
      
      const button = getByText('Siguiente');
      
      expect(() => {
        fireEvent.press(button);
      }).not.toThrow();
    });
  });

  describe('Estructura', () => {
    it('should render with correct structure', () => {
      const { root } = render(<OnboardingScreen onFinish={mockOnFinish} />);
      
      expect(root).toBeTruthy();
      expect(root.findAllByType('View').length).toBeGreaterThan(0);
    });
  });
});
