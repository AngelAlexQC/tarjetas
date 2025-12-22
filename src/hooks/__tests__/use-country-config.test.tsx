/**
 * Tests para useCountryConfig Hook
 */

import { renderHook } from '@testing-library/react-native';
import { useTenantTheme } from '@/contexts/tenant-theme-context';
import { useCountryConfig } from '../use-country-config';
import type { Tenant } from '@/repositories/schemas/tenant.schema';

// Mock del TenantThemeContext
jest.mock('@/contexts/tenant-theme-context', () => ({
  useTenantTheme: jest.fn(),
}));

const mockUseTenantTheme = useTenantTheme as jest.MockedFunction<typeof useTenantTheme>;

describe('useCountryConfig', () => {
  const mockEcuadorTenant: Tenant = {
    id: '1',
    slug: 'bpichincha',
    name: 'Banco Pichincha',
    country: 'Ecuador',
    countryCode: 'EC',
    countryFlag: '🇪🇨',
    locale: 'es-EC',
    currency: 'USD',
    currencySymbol: 'US$',
    branding: {
      logoUrl: 'https://example.com/logo.png',
      primaryColor: '#ffdf00',
      secondaryColor: '#ffd700',
      accentColor: '#ff6f00',
      gradientColors: ['#ffdf00', '#ffd700'],
      textOnPrimary: '#000000',
      textOnSecondary: '#000000',
    },
    features: {
      cards: { enabled: true, allowedTypes: ['credit'], allowedActions: [] },
      transfers: { enabled: true },
      loans: { enabled: false },
      insurance: { enabled: false, allowedTypes: [] },
    },
  };

  const mockColombiaTenant: Tenant = {
    ...mockEcuadorTenant,
    id: '4',
    slug: 'bancolombia',
    name: 'Bancolombia',
    country: 'Colombia',
    countryCode: 'CO',
    countryFlag: '🇨🇴',
    locale: 'es-CO',
    currency: 'COP',
    currencySymbol: 'COP$',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return null values when no tenant is selected', () => {
    mockUseTenantTheme.mockReturnValue({
      currentTheme: null,
      colorScheme: 'light',
      setTenant: jest.fn(),
      clearTenant: jest.fn(),
      isLoading: false,
    });

    const { result } = renderHook(() => useCountryConfig());

    expect(result.current.country).toBeNull();
    expect(result.current.tenant).toBeNull();
    expect(result.current.validators).toBeNull();
    expect(result.current.phonePrefix).toBeNull();
    expect(result.current.countryCode).toBeNull();
    expect(result.current.documentTypes).toEqual([]);
    expect(result.current.documentTypeDetails).toEqual([]);
  });

  it('should return Ecuador config when Ecuador tenant is selected', () => {
    mockUseTenantTheme.mockReturnValue({
      currentTheme: mockEcuadorTenant,
      colorScheme: 'light',
      setTenant: jest.fn(),
      clearTenant: jest.fn(),
      isLoading: false,
    });

    const { result } = renderHook(() => useCountryConfig());

    expect(result.current.country).toBeDefined();
    expect(result.current.countryCode).toBe('EC');
    expect(result.current.countryName).toBe('Ecuador');
    expect(result.current.phonePrefix).toBe('+593');
    expect(result.current.documentTypes).toContain('CI');
    expect(result.current.documentTypes).toContain('RUC');
    expect(result.current.validators).toBeDefined();
    expect(result.current.formatters).toBeDefined();
    
    // Test documentTypeDetails
    expect(result.current.documentTypeDetails).toBeDefined();
    expect(result.current.documentTypeDetails.length).toBeGreaterThan(0);
    expect(result.current.documentTypeDetails).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'CI', name: expect.any(String) }),
        expect.objectContaining({ code: 'RUC', name: expect.any(String) }),
      ])
    );
  });

  it('should return Colombia config when Colombia tenant is selected', () => {
    mockUseTenantTheme.mockReturnValue({
      currentTheme: mockColombiaTenant,
      colorScheme: 'light',
      setTenant: jest.fn(),
      clearTenant: jest.fn(),
      isLoading: false,
    });

    const { result } = renderHook(() => useCountryConfig());

    expect(result.current.country).toBeDefined();
    expect(result.current.countryCode).toBe('CO');
    expect(result.current.countryName).toBe('Colombia');
    expect(result.current.phonePrefix).toBe('+57');
    expect(result.current.documentTypes).toContain('CC');
    expect(result.current.documentTypes).toContain('NIT');
    
    // Test documentTypeDetails for Colombia
    expect(result.current.documentTypeDetails).toBeDefined();
    expect(result.current.documentTypeDetails).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'CC', name: 'Cédula de Ciudadanía' }),
        expect.objectContaining({ code: 'CE', name: 'Cédula de Extranjería' }),
        expect.objectContaining({ code: 'NIT', name: 'NIT' }),
        expect.objectContaining({ code: 'PAS', name: 'Pasaporte' }),
      ])
    );
  });

  it('should provide working validators', () => {
    mockUseTenantTheme.mockReturnValue({
      currentTheme: mockEcuadorTenant,
      colorScheme: 'light',
      setTenant: jest.fn(),
      clearTenant: jest.fn(),
      isLoading: false,
    });

    const { result } = renderHook(() => useCountryConfig());

    expect(result.current.validators).toBeDefined();
    expect(typeof result.current.validators?.nationalId).toBe('function');
    expect(typeof result.current.validators?.taxId).toBe('function');
    expect(typeof result.current.validators?.phone).toBe('function');
  });

  it('should provide formatters with tenant locale and currency', () => {
    mockUseTenantTheme.mockReturnValue({
      currentTheme: mockEcuadorTenant,
      colorScheme: 'light',
      setTenant: jest.fn(),
      clearTenant: jest.fn(),
      isLoading: false,
    });

    const { result } = renderHook(() => useCountryConfig());

    expect(result.current.formatters).toBeDefined();
    
    // Test currency formatter with Ecuador settings
    const formatted = result.current.formatters?.currency(1000);
    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });

  it('should handle unknown country gracefully', () => {
    const unknownTenant: Tenant = {
      ...mockEcuadorTenant,
      countryCode: 'XX',
      country: 'Unknown Country',
    };

    mockUseTenantTheme.mockReturnValue({
      currentTheme: unknownTenant,
      colorScheme: 'light',
      setTenant: jest.fn(),
      clearTenant: jest.fn(),
      isLoading: false,
    });

    const { result } = renderHook(() => useCountryConfig());

    // Should still return basic info even if country not configured
    expect(result.current.country).toBeNull();
    expect(result.current.countryCode).toBe('XX');
    expect(result.current.formatters).toBeDefined(); // Formatters still work with tenant locale
    expect(result.current.validators).toBeNull();
    expect(result.current.documentTypeDetails).toEqual([]);
  });

  it('should return documentTypeDetails for México', () => {
    const mockMexicoTenant: Tenant = {
      ...mockEcuadorTenant,
      id: '5',
      slug: 'santander-mx',
      name: 'Santander México',
      country: 'México',
      countryCode: 'MX',
      countryFlag: '🇲🇽',
      locale: 'es-MX',
      currency: 'MXN',
      currencySymbol: '$',
    };

    mockUseTenantTheme.mockReturnValue({
      currentTheme: mockMexicoTenant,
      colorScheme: 'light',
      setTenant: jest.fn(),
      clearTenant: jest.fn(),
      isLoading: false,
    });

    const { result } = renderHook(() => useCountryConfig());

    expect(result.current.countryCode).toBe('MX');
    expect(result.current.countryName).toBe('México');
    expect(result.current.documentTypeDetails).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'INE', name: 'INE/IFE' }),
        expect.objectContaining({ code: 'CURP', name: 'CURP' }),
        expect.objectContaining({ code: 'RFC', name: 'RFC' }),
        expect.objectContaining({ code: 'PAS', name: 'Pasaporte' }),
      ])
    );
  });
});
