/**
 * Jest Setup File
 * 
 * Configuración global para los tests.
 */

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
