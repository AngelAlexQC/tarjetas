/**
 * Real Tenant Repository Tests
 */

import { httpClient } from '@/core/http';
import { RealTenantRepository } from '../tenant.repository.real';

// Mock dependencies
jest.mock('@/core/http', () => ({
  httpClient: {
    get: jest.fn(),
  },
  API_ENDPOINTS: {
    TENANTS: {
      LIST: '/tenants',
    },
  },
}));

jest.mock('@/utils/api-validation', () => ({
  parseApiData: jest.fn((_schema, data) => data),
}));

describe('RealTenantRepository', () => {
  let repository: RealTenantRepository;

  const mockTenants = [
    {
      id: '1',
      slug: 'bank-a',
      name: 'Bank A',
      country: 'Ecuador',
      countryCode: 'EC',
      currency: 'USD',
    },
    {
      id: '2',
      slug: 'bank-b',
      name: 'Bank B',
      country: 'Colombia',
      countryCode: 'CO',
      currency: 'COP',
    },
  ];

  beforeEach(() => {
    repository = new RealTenantRepository();
    jest.clearAllMocks();
  });

  describe('getTenants', () => {
    it('should get all tenants successfully', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue({
        success: true,
        data: mockTenants,
      });

      const tenants = await repository.getTenants();

      expect(httpClient.get).toHaveBeenCalledWith('/tenants');
      expect(tenants).toEqual(mockTenants);
      expect(tenants).toHaveLength(2);
    });

    it('should throw error on failure', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Error de servidor',
      });

      await expect(repository.getTenants()).rejects.toThrow('Error de servidor');
    });

    it('should throw default error when no message provided', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue({
        success: false,
      });

      await expect(repository.getTenants()).rejects.toThrow('Error al obtener tenants');
    });
  });

  describe('getTenantById', () => {
    it('should get tenant by ID successfully', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue({
        success: true,
        data: mockTenants[0],
      });

      const tenant = await repository.getTenantById('1');

      expect(httpClient.get).toHaveBeenCalledWith('/tenants/1');
      expect(tenant).toEqual(mockTenants[0]);
    });

    it('should return undefined when no data', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue({
        success: true,
        data: null,
      });

      const tenant = await repository.getTenantById('999');

      expect(tenant).toBeUndefined();
    });

    it('should throw error on failure', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Tenant no encontrado',
      });

      await expect(repository.getTenantById('invalid'))
        .rejects.toThrow('Tenant no encontrado');
    });
  });

  describe('getTenantBySlug', () => {
    it('should get tenant by slug successfully', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue({
        success: true,
        data: mockTenants[0],
      });

      const tenant = await repository.getTenantBySlug('bank-a');

      expect(httpClient.get).toHaveBeenCalledWith('/tenants/slug/bank-a');
      expect(tenant).toEqual(mockTenants[0]);
    });

    it('should return undefined when no data', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue({
        success: true,
        data: null,
      });

      const tenant = await repository.getTenantBySlug('unknown-slug');

      expect(tenant).toBeUndefined();
    });

    it('should throw error on failure', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Slug inválido',
      });

      await expect(repository.getTenantBySlug('-invalid-'))
        .rejects.toThrow('Slug inválido');
    });
  });

  describe('searchTenants', () => {
    it('should search tenants successfully', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockTenants[0]],
      });

      const tenants = await repository.searchTenants('Ecuador');

      expect(httpClient.get).toHaveBeenCalledWith('/tenants/search?q=Ecuador');
      expect(tenants).toEqual([mockTenants[0]]);
    });

    it('should encode search query', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue({
        success: true,
        data: [],
      });

      await repository.searchTenants('Bank & Trust');

      expect(httpClient.get).toHaveBeenCalledWith('/tenants/search?q=Bank%20%26%20Trust');
    });

    it('should handle empty results', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue({
        success: true,
        data: [],
      });

      const tenants = await repository.searchTenants('nonexistent');

      expect(tenants).toEqual([]);
    });

    it('should throw error on failure', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Error de búsqueda',
      });

      await expect(repository.searchTenants('test'))
        .rejects.toThrow('Error de búsqueda');
    });

    it('should throw default error on failure without message', async () => {
      (httpClient.get as jest.Mock).mockResolvedValue({
        success: false,
      });

      await expect(repository.searchTenants('test'))
        .rejects.toThrow('Error al buscar tenants');
    });
  });
});
