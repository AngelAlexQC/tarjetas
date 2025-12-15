/**
 * Jest Setup File
 * 
 * Configuración global para los tests.
 */

// Mock de Expo Winter (debe ir primero antes de cualquier otra importación)
jest.mock('expo/src/winter/installGlobal', () => ({}));
jest.mock('expo/src/winter/runtime.native', () => ({}));

// Mock de react-native-gesture-handler (debe ir primero)
import 'react-native-gesture-handler/jestSetup';

// Helper para crear layout animations con métodos encadenables
const createLayoutAnimation = () => {
  const animation = {
    duration: jest.fn().mockReturnThis(),
    delay: jest.fn().mockReturnThis(),
    easing: jest.fn().mockReturnThis(),
    springify: jest.fn().mockReturnThis(),
    damping: jest.fn().mockReturnThis(),
    mass: jest.fn().mockReturnThis(),
    stiffness: jest.fn().mockReturnThis(),
    overshootClamping: jest.fn().mockReturnThis(),
    energyThreshold: jest.fn().mockReturnThis(),
    randomDelay: jest.fn().mockReturnThis(),
    reduceMotion: jest.fn().mockReturnThis(),
    withInitialValues: jest.fn().mockReturnThis(),
    withCallback: jest.fn().mockReturnThis(),
  };
  return animation;
};

// Mock de react-native-reanimated
// Este mock debe definir todo inline porque jest.mock se ejecuta antes que cualquier import
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  
  const View = require('react-native').View;
  const Text = require('react-native').Text;
  const Image = require('react-native').Image;
  const ScrollView = require('react-native').ScrollView;
  const FlatList = require('react-native').FlatList;
  
  // Helper para crear layout animations con métodos encadenables
  const createLayoutAnimation = () => {
    const animation = {
      duration: jest.fn().mockReturnThis(),
      delay: jest.fn().mockReturnThis(),
      easing: jest.fn().mockReturnThis(),
      springify: jest.fn().mockReturnThis(),
      damping: jest.fn().mockReturnThis(),
      mass: jest.fn().mockReturnThis(),
      stiffness: jest.fn().mockReturnThis(),
      overshootClamping: jest.fn().mockReturnThis(),
      energyThreshold: jest.fn().mockReturnThis(),
      randomDelay: jest.fn().mockReturnThis(),
      reduceMotion: jest.fn().mockReturnThis(),
      withInitialValues: jest.fn().mockReturnThis(),
      withCallback: jest.fn().mockReturnThis(),
    };
    return animation;
  };
  
  return {
    __esModule: true,
    default: {
      call: jest.fn(),
      createAnimatedComponent: (Component: any) => Component,
      View,
      Text,
      Image,
      ScrollView,
      FlatList,
    },
    // Hooks
    useSharedValue: jest.fn((initialValue: any) => ({ value: initialValue })),
    useAnimatedStyle: jest.fn((styleFactory: () => any) => {
      try { return styleFactory(); } catch { return {}; }
    }),
    useAnimatedProps: jest.fn((propsFactory: () => any) => {
      try { return propsFactory(); } catch { return {}; }
    }),
    useDerivedValue: jest.fn((valueFactory: () => any) => {
      try { return { value: valueFactory() }; } catch { return { value: undefined }; }
    }),
    useAnimatedRef: jest.fn(() => ({ current: null })),
    useAnimatedScrollHandler: jest.fn(() => jest.fn()),
    useAnimatedGestureHandler: jest.fn(() => ({})),
    useAnimatedReaction: jest.fn(),
    
    // Worklet helpers
    runOnJS: jest.fn((fn: any) => fn),
    runOnUI: jest.fn((fn: any) => fn),
    
    // Animations
    withTiming: jest.fn((toValue: any, _config?: any, callback?: any) => {
      if (callback) callback(true);
      return toValue;
    }),
    withSpring: jest.fn((toValue: any) => toValue),
    withDelay: jest.fn((_delay: any, animation: any) => animation),
    withSequence: jest.fn((...animations: any[]) => animations[animations.length - 1]),
    withRepeat: jest.fn((animation: any) => animation),
    withDecay: jest.fn(() => 0),
    cancelAnimation: jest.fn(),
    
    // Interpolation
    interpolate: jest.fn((value: any, inputRange: any, outputRange: any) => {
      if (typeof value === 'number' && Array.isArray(outputRange) && outputRange.length > 0) {
        return outputRange[0];
      }
      return 0;
    }),
    interpolateColor: jest.fn(() => 'transparent'),
    
    // Easing
    Easing: {
      linear: jest.fn((t: any) => t),
      ease: jest.fn((t: any) => t),
      bezier: jest.fn(() => (t: any) => t),
      in: jest.fn((easing: any) => easing),
      out: jest.fn((easing: any) => easing),
      inOut: jest.fn((easing: any) => easing),
      poly: jest.fn(() => (t: any) => t),
      sin: jest.fn((t: any) => t),
      exp: jest.fn((t: any) => t),
      circle: jest.fn((t: any) => t),
      back: jest.fn(() => (t: any) => t),
      bounce: jest.fn((t: any) => t),
      elastic: jest.fn(() => (t: any) => t),
    },
    
    // Extrapolation
    Extrapolation: {
      CLAMP: 'clamp',
      EXTEND: 'extend',
      IDENTITY: 'identity',
    },
    Extrapolate: {
      CLAMP: 'clamp',
      EXTEND: 'extend',
      IDENTITY: 'identity',
    },
    
    // Layout animations - con encadenamiento de métodos
    FadeIn: createLayoutAnimation(),
    FadeOut: createLayoutAnimation(),
    FadeInUp: createLayoutAnimation(),
    FadeInDown: createLayoutAnimation(),
    FadeOutUp: createLayoutAnimation(),
    FadeOutDown: createLayoutAnimation(),
    SlideInRight: createLayoutAnimation(),
    SlideOutRight: createLayoutAnimation(),
    SlideInLeft: createLayoutAnimation(),
    SlideOutLeft: createLayoutAnimation(),
    Layout: createLayoutAnimation(),
    
    // Animated components
    createAnimatedComponent: (Component: any) => Component,
    
    // Animated versions of RN components  
    Animated: {
      View,
      Text,
      Image,
      ScrollView,
      FlatList,
      createAnimatedComponent: (Component: any) => Component,
    },
    
    // Misc
    measure: jest.fn(),
    scrollTo: jest.fn(),
    setGestureState: jest.fn(),
    makeMutable: jest.fn((value: any) => ({ value })),
    
    // Setup for testing (no-op since we're mocking everything)
    setUpTests: jest.fn(),
  };
});

// Mock de expo-modules
jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => {
  const actual = jest.requireActual('react-native/Libraries/TurboModule/TurboModuleRegistry');
  return {
    ...actual,
    getEnforcing: (name: string) => {
      if (name === 'DevMenu') {
        return {
          show: jest.fn(),
          reload: jest.fn(),
        };
      }
      if (name === 'SettingsManager') {
        return {
          settings: {},
          getConstants: jest.fn(() => ({ settings: {} })),
        };
      }
      return actual.getEnforcing(name);
    },
  };
});

jest.mock('expo-font', () => ({
  loadAsync: jest.fn(),
  isLoaded: jest.fn(() => true),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(() => Promise.resolve(true)),
  isEnrolledAsync: jest.fn(() => Promise.resolve(true)),
  authenticateAsync: jest.fn(() => Promise.resolve({ success: true })),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

// Mock de AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
  getAllKeys: jest.fn(() => []),
}));

// Mock de expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  useSegments: () => [],
  Link: 'Link',
  Stack: {
    Screen: 'Screen',
  },
  Tabs: {
    Screen: 'Screen',
  },
}));

// Silenciar solo warnings específicos de librerías que no podemos controlar
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.warn = (...args) => {
    const message = args[0]?.toString?.() ?? '';
    // Solo silenciar warnings de Reanimated que son conocidos y no afectan tests
    if (message.includes('React Native Reanimated')) {
      return;
    }
    originalWarn.call(console, ...args);
  };

  // Silenciar warnings de act() para actualizaciones async en useEffect
  // Estos warnings son informativos pero ruidosos cuando el código es correcto
  // Ver: https://github.com/testing-library/react-testing-library/issues/459
  console.error = (...args) => {
    const message = args[0]?.toString?.() ?? '';
    // Silenciar warnings de act() que son esperados en tests con async state updates
    if (message.includes('not wrapped in act')) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});

// NOTA: No usar fake timers globalmente - causa que tests async se cuelguen
// Ver: https://github.com/facebook/jest/issues/10221
// Para tests que necesiten fake timers, usar dentro del test:
//   jest.useFakeTimers();
//   // ... test code ...
//   jest.useRealTimers();

// Limpiar todos los timers después de cada test
afterEach(() => {
  jest.clearAllTimers();
});
