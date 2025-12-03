/**
 * Real Tenant Repository - LibelulaSoft
 * 
 * Implementación que hace llamadas HTTP reales al backend.
 * Todas las respuestas son validadas con Zod.
 */

import { httpClient } from '@/api/http-client';
import { parseApiData } from '@/utils/api-validation';
import type { Tenant } from '../schemas/tenant.schema';
import { TenantArraySchema, TenantSchema } from '../schemas/tenant.schema';
import type { ITenantRepository } from '../interfaces/tenant.repository.interface';

export class RealTenantRepository implements ITenantRepository {
  
  async getTenants(): Promise<Tenant[]> {
    const response = await httpClient.get<unknown>('/tenants');
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener tenants');
    }
    return parseApiData(TenantArraySchema, response.data, 'lista de tenants');
  }

  async getTenantById(id: string): Promise<Tenant | undefined> {
    const response = await httpClient.get<unknown>(`/tenants/${id}`);
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener tenant');
    }
    if (!response.data) return undefined;
    return parseApiData(TenantSchema, response.data, 'tenant');
  }

  async getTenantBySlug(slug: string): Promise<Tenant | undefined> {
    const response = await httpClient.get<unknown>(`/tenants/slug/${slug}`);
    if (!response.success) {
      throw new Error(response.error || 'Error al obtener tenant');
    }
    if (!response.data) return undefined;
    return parseApiData(TenantSchema, response.data, 'tenant');
  }

  async searchTenants(query: string): Promise<Tenant[]> {
    const response = await httpClient.get<unknown>('/tenants/search', { 
      query: { q: query }
    });
    if (!response.success) {
      throw new Error(response.error || 'Error al buscar tenants');
    }
    return parseApiData(TenantArraySchema, response.data, 'resultados de búsqueda');
  }
}
