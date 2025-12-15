/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // Agregar mocks globales antes del setup
  setupFiles: ['<rootDir>/jest.polyfills.js'],
  testMatch: [
    '**/__tests__/**/*.(test|spec).[jt]s?(x)',
    '**/*.(test|spec).[jt]s?(x)',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/.expo/',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/(?!.*winter)|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-native-reanimated)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@test-utils$': '<rootDir>/test-utils',
    '^@test-utils/(.*)$': '<rootDir>/test-utils/$1',
  },
  collectCoverageFrom: [
    // Incluir todos los archivos fuente principales
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'contexts/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'repositories/**/*.{ts,tsx}',
    'utils/**/*.{ts,tsx}',
    'api/**/*.{ts,tsx}',
    // Excluir archivos que no deben ser testeados
    '!**/*.d.ts',
    '!**/index.ts',
    '!**/index.tsx',
    '!**/*.test.{ts,tsx}',
    '!**/*.spec.{ts,tsx}',
    '!**/__tests__/**',
    '!**/__mocks__/**',
    '!**/test-utils/**',
    '!app/_layout.tsx',
    '!app/+not-found.tsx',
  ],
  // SEGURIDAD: Umbrales de cobertura para código financiero
  // Objetivo: Mantener y aumentar la cobertura progresivamente
  // SonarCloud requiere 80% en nuevo código
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 20,
      lines: 20,
      statements: 20,
    },
    // Umbrales más estrictos para código de seguridad
    './utils/auth-storage.ts': {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
    './utils/validators.ts': {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
    './utils/error-sanitizer.ts': {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // NOTA: No usar fakeTimers globalmente - causa que tests async se cuelguen
  // Ver: https://github.com/facebook/jest/issues/10221
  // Usar jest.useFakeTimers() solo en tests específicos que lo necesiten
  testTimeout: 10000,
};
