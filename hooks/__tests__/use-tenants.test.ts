import { renderHook, waitFor } from '@testing-library/react-native';
import { useTenants } from '../use-tenants';
import { RepositoryContainer } from '@/repositories';
import type { Tenant } from '@/repositories/schemas/tenant.schema';

jest.mock('@/repositories');

describe('useTenants', () => {
  const mockTenants: Tenant[] = [
    {
      id: 'tenant-1',
      name: 'Bank Alpha',
      country: 'USA',
      mainColor: '#FF0000',
      logoUrl: 'https://example.com/logo1.png',
      subdomains: ['alpha'],
    },
    {
      id: 'tenant-2',
      name: 'Bank Beta',
      country: 'Canada',
      mainColor: '#00FF00',
      logoUrl: 'https://example.com/logo2.png',
      subdomains: ['beta'],
    },
    {
      id: 'tenant-3',
      name: 'Banco Gamma',
      country: 'Mexico',
      mainColor: '#0000FF',
      logoUrl: 'https://example.com/logo3.png',
      subdomains: ['gamma'],
    },
  ];

  const mockTenantRepository = {
    getTenants: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (RepositoryContainer.getTenantRepository as jest.Mock).mockReturnValue(mockTenantRepository);
    mockTenantRepository.getTenants.mockResolvedValue(mockTenants);
  });

  describe('initial load', () => {
    it('should load tenants on mount', async () => {
      const { result } = renderHook(() => useTenants());

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.tenants).toEqual(mockTenants);
      expect(result.current.error).toBeNull();
      expect(mockTenantRepository.getTenants).toHaveBeenCalledTimes(1);
    });

    it('should handle error when loading tenants fails', async () => {
      const errorMessage = 'Network error';
      mockTenantRepository.getTenants.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useTenants());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.tenants).toEqual([]);
    });

    it('should handle non-Error exceptions', async () => {
      mockTenantRepository.getTenants.mockRejectedValue('String error');

      const { result } = renderHook(() => useTenants());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('Error al cargar tenants');
      expect(result.current.tenants).toEqual([]);
    });
  });

  describe('refetch', () => {
    it('should refetch tenants when refetch is called', async () => {
      const { result } = renderHook(() => useTenants());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockTenantRepository.getTenants).toHaveBeenCalledTimes(1);

      await result.current.refetch();

      expect(mockTenantRepository.getTenants).toHaveBeenCalledTimes(2);
    });

    it('should update tenants after refetch', async () => {
      const { result } = renderHook(() => useTenants());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newTenants: Tenant[] = [
        {
          id: 'tenant-4',
          name: 'Bank Delta',
          country: 'Brazil',
          mainColor: '#FFFF00',
          subdomains: ['delta'],
        },
      ];

      mockTenantRepository.getTenants.mockResolvedValue(newTenants);

      await result.current.refetch();

      await waitFor(() => {
        expect(result.current.tenants).toEqual(newTenants);
      });
    });

    it('should handle error during refetch', async () => {
      const { result } = renderHook(() => useTenants());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockTenantRepository.getTenants.mockRejectedValue(new Error('Refetch error'));

      await result.current.refetch();

      await waitFor(() => {
        expect(result.current.error).toBe('Refetch error');
      });
    });
  });

  describe('searchTenants', () => {
    it('should return all tenants for empty query', async () => {
      const { result } = renderHook(() => useTenants());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const searchResults = result.current.searchTenants('');
      expect(searchResults).toEqual(mockTenants);
    });

    it('should search tenants by name (case insensitive)', async () => {
      const { result } = renderHook(() => useTenants());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const searchResults = result.current.searchTenants('alpha');
      expect(searchResults).toEqual([mockTenants[0]]);
    });

    it('should search tenants by name with uppercase query', async () => {
      const { result } = renderHook(() => useTenants());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const searchResults = result.current.searchTenants('BETA');
      expect(searchResults).toEqual([mockTenants[1]]);
    });

    it('should search tenants by country', async () => {
      const { result } = renderHook(() => useTenants());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const searchResults = result.current.searchTenants('mexico');
      expect(searchResults).toEqual([mockTenants[2]]);
    });

    it('should return multiple matches', async () => {
      const { result } = renderHook(() => useTenants());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const searchResults = result.current.searchTenants('bank');
      expect(searchResults).toHaveLength(2);
      expect(searchResults).toContain(mockTenants[0]);
      expect(searchResults).toContain(mockTenants[1]);
    });

    it('should return empty array for no matches', async () => {
      const { result } = renderHook(() => useTenants());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const searchResults = result.current.searchTenants('nonexistent');
      expect(searchResults).toEqual([]);
    });

    it('should trim whitespace from query', async () => {
      const { result } = renderHook(() => useTenants());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const searchResults = result.current.searchTenants('  alpha  ');
      expect(searchResults).toEqual([mockTenants[0]]);
    });
  });
});
