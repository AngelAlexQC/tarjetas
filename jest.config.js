/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
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
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-native-reanimated)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@test-utils$': '<rootDir>/test-utils',
    '^@test-utils/(.*)$': '<rootDir>/test-utils/$1',
  },
  collectCoverageFrom: [
    'hooks/**/*.{ts,tsx}',
    'repositories/**/*.{ts,tsx}',
    'utils/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'contexts/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/index.ts',
  ],
  // SEGURIDAD: Umbrales de cobertura para código financiero
  // TODO: Incrementar gradualmente hasta 80% conforme se agreguen tests
  // SonarCloud monitoreará la calidad de código adicional
  coverageThreshold: {
    global: {
      branches: 15,
      functions: 15,
      lines: 15,
      statements: 15,
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
