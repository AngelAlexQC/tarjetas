/**
 * useTenants Hook - LibelulaSoft
 * 
 * Hook para gestionar la carga y búsqueda de tenants desde el backend.
 * Reemplaza la búsqueda hardcoded anterior.
 */

import { loggers } from '@/core/logging';
import { RepositoryContainer } from '@/repositories';
import type { Tenant } from '@/repositories/schemas/tenant.schema';
import { useCallback, useEffect, useState } from 'react';

const log = loggers.theme;

interface UseTenantsReturn {
  tenants: Tenant[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  searchTenants: (query: string) => Tenant[];
}

/**
 * Hook para gestionar tenants disponibles
 */
export function useTenants(): UseTenantsReturn {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTenants = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const repo = RepositoryContainer.getTenantRepository();
      const data = await repo.getTenants();
      
      setTenants(data);
      log.info(`Loaded ${data.length} tenants`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar tenants';
      setError(message);
      setTenants([]);
      log.error('Error loading tenants:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const searchTenants = useCallback((query: string): Tenant[] => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return tenants;

    return tenants.filter(t =>
      t.name.toLowerCase().includes(normalized) ||
      t.country.toLowerCase().includes(normalized)
    );
  }, [tenants]);

  return {
    tenants,
    isLoading,
    error,
    refetch: fetchTenants,
    searchTenants,
  };
}
