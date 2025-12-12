/**
 * Default Tenant Configuration
 * 
 * Tema por defecto usado como fallback cuando no hay tenant seleccionado.
 * Usa el formato Tenant definido en @/repositories/schemas/tenant.schema
 */

import type { Tenant, TenantFeatures } from '@/repositories/schemas/tenant.schema';

/**
 * Tenant por defecto usado cuando no hay institución seleccionada
 */
export const defaultTenant: Tenant = {
  id: 'default',
  slug: 'default',
  name: 'Institución Financiera',
  country: 'Global',
  countryCode: 'XX',
  countryFlag: '🌐',
  locale: 'en-US',
  currency: 'USD',
  currencySymbol: 'US$',
  timezone: 'UTC',
  branding: {
    // logoUrl omitido intencionalmente - la UI muestra el nombre como fallback
    primaryColor: '#0a7ea4',
    secondaryColor: '#2196F3',
    accentColor: '#FF9800',
    gradientColors: ['#0a7ea4', '#2196F3'],
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#FFFFFF',
  },
  features: {
    cards: {
      enabled: true,
      allowedTypes: ['credit', 'debit'],
      allowedActions: ['view', 'block', 'unblock'],
    },
    transfers: { enabled: false },
    loans: { enabled: false },
    insurance: {
      enabled: false,
      allowedTypes: [],
    },
  },
};

/**
 * Extrae los colores de branding de un Tenant
 */
export function getBrandingFromTenant(tenant: Tenant | null | undefined) {
  if (!tenant) {
    return defaultTenant.branding;
  }
  return tenant.branding;
}

/**
 * Extrae las features de un Tenant
 */
export function getFeaturesFromTenant(tenant: Tenant | null | undefined): TenantFeatures {
  if (!tenant) {
    return defaultTenant.features;
  }
  return tenant.features;
}
