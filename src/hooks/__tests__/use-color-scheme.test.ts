import { useColorScheme } from '../use-color-scheme';

// Este archivo simplemente reexporta el hook de React Native
describe('useColorScheme', () => {
  it('should export useColorScheme from react-native', () => {
    expect(useColorScheme).toBeDefined();
    expect(typeof useColorScheme).toBe('function');
  });
});
