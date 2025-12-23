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
 * Type guard para verificar si es un Tenant (nuevo formato)
 */
function isTenantFormat(theme: TenantTheme | Tenant): theme is Tenant {
  return 'branding' in theme && 'features' in theme;
}

/**
 * Extrae el branding de un tenant (o usa defaults)
 * Soporta tanto el formato nuevo (Tenant) como el legacy (TenantTheme)
 */
export function getBrandingFromTenant(tenant: TenantTheme | Tenant | null) {
  if (!tenant) {
    return {
      logoUrl: defaultTheme.logoUrl,
      primaryColor: defaultTheme.mainColor,
      secondaryColor: defaultTheme.secondaryColor,
      accentColor: defaultTheme.accentColor,
      gradientColors: defaultTheme.gradientColors,
      textOnPrimary: defaultTheme.textOnPrimary,
      textOnSecondary: defaultTheme.textOnSecondary,
    };
  }

  // Si es el nuevo formato (Tenant con branding)
  if (isTenantFormat(tenant)) {
    return {
      logoUrl: tenant.branding.logoUrl,
      primaryColor: tenant.branding.primaryColor,
      secondaryColor: tenant.branding.secondaryColor,
      accentColor: tenant.branding.accentColor,
      gradientColors: tenant.branding.gradientColors,
      textOnPrimary: tenant.branding.textOnPrimary,
      textOnSecondary: tenant.branding.textOnSecondary,
    };
  }

  // Formato legacy (TenantTheme)
  return {
    logoUrl: tenant.logoUrl,
    primaryColor: tenant.mainColor,
    secondaryColor: tenant.secondaryColor,
    accentColor: tenant.accentColor,
    gradientColors: tenant.gradientColors,
    textOnPrimary: tenant.textOnPrimary,
    textOnSecondary: tenant.textOnSecondary,
  };
}

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
