/**
 * Tenant Default Theme - LibelulaSoft
 * 
 * ⚠️ ARCHIVO DEPRECADO - Solo mantiene el defaultTheme para fallback
 * 
 * Todos los tenants se cargan dinámicamente desde:
 * - repositories/mock/tenant.repository.mock.ts (14 instituciones)
 * - repositories/real/tenant.repository.real.ts (backend cuando esté listo)
 * 
 * Usar:
 * - useTenants() hook para cargar instituciones
 * - Tenant type de @/repositories/schemas/tenant.schema
 */

import type { Tenant } from '@/repositories/schemas/tenant.schema';

/**
 * @deprecated Usar Tenant de @/repositories/schemas/tenant.schema
 */
export interface TenantTheme {
  slug: string;
  name: string;
  logoUrl: string;
  mainColor: string;
  secondaryColor: string;
  accentColor: string;
  gradientColors: string[];
  textOnPrimary: string;
  textOnSecondary: string;
  locale: string;
  currency: string;
  currencySymbol: string;
  country: string;
  countryFlag: string;
}

/**
 * Tema por defecto usado como fallback cuando no hay tenant seleccionado
 */
export const defaultTheme: TenantTheme = {
  slug: 'default',
  name: 'Institución Financiera',
  logoUrl: 'https://via.placeholder.com/200x200.png?text=Logo',
  mainColor: '#0a7ea4',
  secondaryColor: '#2196F3',
  accentColor: '#FF9800',
  gradientColors: ['#0a7ea4', '#2196F3'],
  textOnPrimary: '#FFFFFF',
  textOnSecondary: '#FFFFFF',
  locale: 'en-US',
  currency: 'USD',
  currencySymbol: 'US$',
  country: 'Global',
  countryFlag: '🌐',
};

/**
 * Convierte un Tenant (nuevo formato) a TenantTheme (formato legacy)
 * @deprecated Solo para compatibilidad temporal durante migración
 */
export function tenantToLegacyTheme(tenant: Tenant): TenantTheme {
  return {
    slug: tenant.slug,
    name: tenant.name,
    logoUrl: tenant.branding.logoUrl,
    mainColor: tenant.branding.primaryColor,
    secondaryColor: tenant.branding.secondaryColor,
    accentColor: tenant.branding.accentColor,
    gradientColors: tenant.branding.gradientColors,
    textOnPrimary: tenant.branding.textOnPrimary,
    textOnSecondary: tenant.branding.textOnSecondary,
    locale: tenant.locale,
    currency: tenant.currency,
    currencySymbol: tenant.currencySymbol,
    country: tenant.country,
    countryFlag: tenant.countryFlag || '🌐',
  };
}
