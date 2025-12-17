/**
 * Jest Setup File
 * 
 * Configuración global para los tests.
 */

// Expo SDK 54+ incluye el runtime "winter" (import.meta registry) que no es
// necesario para unit tests y puede romper en Jest con:
// "You are trying to import a file outside of the scope of the test code."
// Lo deshabilitamos mockeando sus módulos internos.
jest.mock('expo/src/winter/runtime.native', () => ({}));
jest.mock('expo/src/winter/runtime', () => ({}));
jest.mock('expo/src/winter/installGlobal', () => ({}));

// Mock de react-native-reanimated
jest.mock('react-native-reanimated', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock de expo-modules
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

beforeAll(() => {
  console.warn = (...args) => {
    const message = args[0]?.toString?.() ?? '';
    // Solo silenciar warnings de Reanimated que son conocidos y no afectan tests
    if (message.includes('React Native Reanimated')) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
});

// Fake timers para animaciones
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});
