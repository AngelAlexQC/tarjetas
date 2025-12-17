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
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@test-utils$': '<rootDir>/test-utils',
    '^@test-utils/(.*)$': '<rootDir>/test-utils/$1',

    // Expo SDK 54+ (winter runtime) puede romper en Jest en algunos entornos.
    // Lo stubbeamos para tests unitarios.
    '^expo/src/winter/runtime\\.native(\\.ts)?$': '<rootDir>/test-utils/expo-winter.stub.ts',
    '^expo/src/winter/runtime(\\.ts)?$': '<rootDir>/test-utils/expo-winter.stub.ts',
    '^expo/src/winter/installGlobal(\\.ts)?$': '<rootDir>/test-utils/expo-winter.stub.ts',
  },
  collectCoverageFrom: [
    'src/hooks/**/*.{ts,tsx}',
    'src/repositories/**/*.{ts,tsx}',
    'src/utils/**/*.{ts,tsx}',
    'src/components/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  fakeTimers: {
    enableGlobally: true,
  },
};
