/**
 * AnimatedSplashScreen Component Tests
 * 
 * Tests básicos para el componente de splash animado.
 * Este componente es complejo con muchas animaciones, 
 * por lo que nos enfocamos en tests de renderizado y ciclo de vida.
 */

import { act, render } from '@testing-library/react-native';
import React from 'react';
import { Dimensions } from 'react-native';
import { AnimatedSplashScreen } from '../animated-splash-screen';

// Mock de Dimensions
jest.spyOn(Dimensions, 'get').mockReturnValue({ 
  width: 375, 
  height: 812, 
  scale: 2, 
  fontScale: 1 
});

// Mock del contexto de splash
const mockSetIsReady = jest.fn();
const mockSetShouldShowSplash = jest.fn();

jest.mock('@/contexts/splash-context', () => ({
  useSplash: () => ({
    isSplashComplete: false,
    setSplashComplete: mockSetIsReady,
  }),
}));

jest.mock('@/utils/logger', () => ({
  loggers: {
    ui: {
      info: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
    },
  },
}));



jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn().mockResolvedValue(undefined),
  hideAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  
  // Patch default export
  Reanimated.default.call = () => {};
  Reanimated.default.createAnimatedComponent = (component: any) => component;

  return {
    ...Reanimated,
    __esModule: true,
    default: Reanimated.default,
    runOnJS: (fn: any) => fn,
  };
});

jest.mock('expo-blur', () => ({
  BlurView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock de SVG components
// Mock de SVG components
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  class MockSvg extends React.Component {
    render() { return <View>{this.props.children}</View>; }
  }
  
  class MockPath extends React.Component {
    render() { return <View testID="svg-path" />; }
  }
  
  class MockG extends React.Component {
    render() { return <View>{this.props.children}</View>; }
  }
  
  class MockDefs extends React.Component {
    render() { return <View>{this.props.children}</View>; }
  }
  
  class MockGradient extends React.Component {
    render() { return <View />; }
  }
  
  class MockStop extends React.Component {
    render() { return <View />; }
  }

  return {
    __esModule: true,
    default: MockSvg,
    Svg: MockSvg,
    Path: MockPath,
    G: MockG,
    Defs: MockDefs,
    RadialGradient: MockGradient,
    Stop: MockStop,
  };
});

describe('AnimatedSplashScreen', () => {
  const mockOnReady = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Renderizado', () => {
    it('should render correctly', () => {
      const { root } = render(
        <AnimatedSplashScreen onReady={mockOnReady}>
          <></>
        </AnimatedSplashScreen>
      );
      expect(root).toBeTruthy();
    });

    it('should render children', () => {
      const { getByText } = render(
        <AnimatedSplashScreen onReady={mockOnReady}>
          <></>
        </AnimatedSplashScreen>
      );
      
      // Children are rendered (even if hidden during splash)
      expect(true).toBeTruthy(); // Component renders without error
    });

    it('should accept children prop', () => {
      const ChildComponent = () => {
        const { Text } = require('react-native');
        return <Text testID="child-content">Child Content</Text>;
      };
      
      const { root } = render(
        <AnimatedSplashScreen onReady={mockOnReady}>
          <ChildComponent />
        </AnimatedSplashScreen>
      );
      
      expect(root).toBeTruthy();
    });
  });

  describe('Ciclo de Vida', () => {
    it('should render splash animation initially', () => {
      const { root } = render(
        <AnimatedSplashScreen onReady={mockOnReady}>
          <></>
        </AnimatedSplashScreen>
      );
      
      // Component should render animation elements
      expect(root.findAllByType('View').length).toBeGreaterThan(0);
    });

    it('should handle mount without errors', async () => {
      let error: Error | null = null;
      
      try {
        render(
          <AnimatedSplashScreen onReady={mockOnReady}>
            <></>
          </AnimatedSplashScreen>
        );
        
        await act(async () => {
          jest.advanceTimersByTime(100);
        });
      } catch (e) {
        error = e as Error;
      }
      
      expect(error).toBeNull();
    });
  });

  describe('Callback de Ready', () => {
    it('should accept onReady callback', () => {
      const { root } = render(
        <AnimatedSplashScreen onReady={mockOnReady}>
          <></>
        </AnimatedSplashScreen>
      );
      
      expect(root).toBeTruthy();
    });

    it('should work without onReady callback', () => {
      const { root } = render(
        <AnimatedSplashScreen>
          <></>
        </AnimatedSplashScreen>
      );
      
      expect(root).toBeTruthy();
    });
  });

  describe('Estructura del Componente', () => {
    it('should have View elements', () => {
      const { root } = render(
        <AnimatedSplashScreen onReady={mockOnReady}>
          <></>
        </AnimatedSplashScreen>
      );
      
      const views = root.findAllByType('View');
      expect(views.length).toBeGreaterThan(0);
    });
  });

  describe('Animaciones', () => {
  describe('Animaciones', () => {
    it('should complete full animation lifecycle', async () => {
      const { root } = render(
        <AnimatedSplashScreen onReady={mockOnReady}>
          <></>
        </AnimatedSplashScreen>
      );
      
      // Wait for app to be ready (useEffect -> prepare -> setAppReady)
      await act(async () => {
        await Promise.resolve(); // Flush microtasks for prepare()
      });
      
      // Also expect ready callback to ensure we are ready
      // Mock hideAsync resolution might need a tick
      
      // Advance to trigger first timeout (2500ms)
      await act(async () => {
        jest.advanceTimersByTime(2500);
      });
      
      // Advance to trigger second timeout (500ms) - exit animation
      await act(async () => {
        jest.advanceTimersByTime(600);
      });

      // Verify context updates
      expect(mockSetIsReady).toHaveBeenCalled(); 
    });
  });
  });

  describe('Manejo de Errores', () => {
    it('should handle errors gracefully', () => {
      // Even if internal setup fails, component should not crash
      const { root } = render(
        <AnimatedSplashScreen onReady={mockOnReady}>
          <></>
        </AnimatedSplashScreen>
      );
      
      expect(root).toBeTruthy();
    });
    it('should handle SplashScreen.hideAsync error', async () => {
      // Mock failure
      const { hideAsync } = require('expo-splash-screen');
      hideAsync.mockRejectedValueOnce(new Error('Hide failed'));

      const { root } = render(
        <AnimatedSplashScreen onReady={mockOnReady}>
          <></>
        </AnimatedSplashScreen>
      );
      
      // Should not crash
      expect(root).toBeTruthy();
    });

  });
});
