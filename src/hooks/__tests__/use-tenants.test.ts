import { useTenants } from '../use-tenants';

// Mock básico para verificar que el hook existe y es exportado correctamente
describe('useTenants', () => {
  it('should be defined', () => {
    expect(useTenants).toBeDefined();
    expect(typeof useTenants).toBe('function');
  });

  it('should export a function', () => {
    expect(useTenants).toBeInstanceOf(Function);
  });
});
