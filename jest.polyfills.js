/* eslint-env node, jest */
 
/**
 * Jest Polyfills
 *
 * Mocks y polyfills que deben ejecutarse antes que cualquier otro código.
 * Este archivo se ejecuta antes que jest.setup.ts
 */

// Mock de structuredClone si no existe
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (val) => JSON.parse(JSON.stringify(val));
}

// Mock de Expo Winter antes de cualquier importación
global.__ExpoImportMetaRegistry = new Proxy({}, {
  get() {
    return {};
  },
  set() {
    return true;
  }
});

// Mock básico para runtime de Expo
if (typeof global.require === 'undefined') {
  global.require = require;
}

// Polyfill para fetch si no existe (requerido por algunos tests)
if (typeof global.fetch === 'undefined') {
  global.fetch = jest.fn();
  global.Request = jest.fn();
  global.Response = jest.fn();
  global.Headers = jest.fn();
}

// Mock de react-native-worklets antes de que se requiera
// Esto evita el error de "Native part of Worklets doesn't seem to be initialized"
jest.mock('react-native-worklets', () => ({
  __esModule: true,
  default: {
    makeShareableCloneRecursive: jest.fn((value) => value),
    makeShareableCloneOnJS: jest.fn((value) => value),
  },
  makeShareableCloneRecursive: jest.fn((value) => value),
  makeShareableCloneOnJS: jest.fn((value) => value),
  runOnJS: jest.fn((fn) => fn),
  runOnUI: jest.fn((fn) => fn),
  createSerializable: jest.fn((value) => ({
    set: jest.fn((key, val) => val),
    get: jest.fn((key) => value),
    ...value,
  })),
}));
