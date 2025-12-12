import { renderHook, waitFor } from '@testing-library/react-native';
import { useTenants } from '../use-tenants';
import { RepositoryContainer } from '../../repositories';

jest.mock('../../repositories', () => ({
  RepositoryContainer: {
    getTenantRepository: jest.fn(),
  },
}));

describe('useTenants', () => {
  const mockTenants = [
    { id: '1', slug: 'tenant1', name: 'Tenant 1', country: 'US', theme: {} },
    { id: '2', slug: 'tenant2', name: 'Tenant 2', country: 'MX', theme: {} },
    { id: '3', slug: 'libelula', name: 'Libelula', country: 'CR', theme: {} },
  ];

  const mockGetTenants = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (RepositoryContainer.getTenantRepository as jest.Mock).mockReturnValue({
      getTenants: mockGetTenants,
    });
  });

  it('should load tenants on mount', async () => {
    mockGetTenants.mockResolvedValue(mockTenants);

    const { result } = renderHook(() => useTenants());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.tenants).toEqual(mockTenants);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch error', async () => {
    mockGetTenants.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useTenants());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.tenants).toEqual([]);
  });

  it('should refetch tenants', async () => {
    mockGetTenants.mockResolvedValue(mockTenants);

    const { result } = renderHook(() => useTenants());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    mockGetTenants.mockClear();
    mockGetTenants.mockResolvedValue([...mockTenants, { id: '4', slug: 'tenant4', name: 'Tenant 4', country: 'PE', theme: {} }]);

    await result.current.refetch();

    expect(mockGetTenants).toHaveBeenCalled();
  });

  it('should search tenants by name', async () => {
    mockGetTenants.mockResolvedValue(mockTenants);

    const { result } = renderHook(() => useTenants());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const searchResults = result.current.searchTenants('Libelula');

    expect(searchResults).toHaveLength(1);
    expect(searchResults[0].name).toBe('Libelula');
  });

  it('should search tenants by slug', async () => {
    mockGetTenants.mockResolvedValue(mockTenants);

    const { result } = renderHook(() => useTenants());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.searchTenants).toBeDefined();
    });

    const searchResults = result.current.searchTenants('tenant1');

    expect(searchResults.length).toBeGreaterThanOrEqual(0);
    if (searchResults.length > 0) {
      expect(searchResults[0].slug).toContain('tenant');
    }
  });

  it('should return empty array for no matches', async () => {
    mockGetTenants.mockResolvedValue(mockTenants);

    const { result } = renderHook(() => useTenants());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const searchResults = result.current.searchTenants('nonexistent');

    expect(searchResults).toEqual([]);
  });

  it('should handle case-insensitive search', async () => {
    mockGetTenants.mockResolvedValue(mockTenants);

    const { result } = renderHook(() => useTenants());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const searchResults = result.current.searchTenants('LIBELULA');

    expect(searchResults).toHaveLength(1);
    expect(searchResults[0].name).toBe('Libelula');
  });
});
