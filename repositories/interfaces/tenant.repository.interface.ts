/**
 * Tenant Repository Interface - LibelulaSoft
 * 
 * Contrato para operaciones de tenants (instituciones financieras).
 */

import type { Tenant } from '../schemas/tenant.schema';

export interface ITenantRepository {
  /**
   * Obtiene lista de todos los tenants disponibles
   */
  getTenants(): Promise<Tenant[]>;

  /**
   * Obtiene un tenant por su ID
   */
  getTenantById(id: string): Promise<Tenant | undefined>;

  /**
   * Obtiene un tenant por su slug
   */
  getTenantBySlug(slug: string): Promise<Tenant | undefined>;

  /**
   * Busca tenants por nombre o país
   */
  searchTenants(query: string): Promise<Tenant[]>;
}
