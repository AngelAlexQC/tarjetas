/**
 * Tenant Schema - LibelulaSoft
 * 
 * Schema de validación para configuración de tenants (instituciones financieras).
 * Los tenants se cargan dinámicamente desde el backend.
 */

import { z } from 'zod';

/**
 * Schema de branding (colores, logos, etc.)
 */
export const TenantBrandingSchema = z.object({
  logoUrl: z.string().url(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i),
  accentColor: z.string().regex(/^#[0-9A-F]{6}$/i),
  gradientColors: z.array(z.string()),
  textOnPrimary: z.string(),
  textOnSecondary: z.string(),
  images: z.object({
    loginBackground: z.string().url().optional(),
    cardsBackground: z.string().url().optional(),
    onboarding: z.array(z.object({
      title: z.string(),
      description: z.string(),
      imageUrl: z.string().url(),
    })).optional(),
    maintenance: z.string().url().optional(),
    settings: z.string().url().optional(),
  }).optional(),
});

/**
 * Schema de features disponibles para tarjetas
 */
export const TenantCardFeaturesSchema = z.object({
  enabled: z.boolean(),
  allowedTypes: z.array(z.enum(['credit', 'debit', 'virtual'])),
  allowedActions: z.array(z.string()),
  maxCreditLimit: z.number().optional(),
});

/**
 * Schema de features de seguros
 */
export const TenantInsuranceFeaturesSchema = z.object({
  enabled: z.boolean(),
  allowedTypes: z.array(z.string()),
});

/**
 * Schema de features de autenticación
 */
export const TenantAuthFeaturesSchema = z.object({
  biometric: z.boolean(),
  pin: z.boolean(),
  password: z.boolean(),
  recoveryMethods: z.array(z.string()), // ['email', 'account+dob', 'account+pin']
  allowedDocumentTypes: z.array(z.string()), // ['CC', 'CE', 'CI', 'PAS', 'NIT', 'RUC', 'TI', 'PEP']
});

/**
 * Schema de features disponibles por tenant
 */
export const TenantFeaturesSchema = z.object({
  cards: TenantCardFeaturesSchema,
  transfers: z.object({ enabled: z.boolean() }),
  loans: z.object({ enabled: z.boolean() }),
  insurance: TenantInsuranceFeaturesSchema,
  auth: TenantAuthFeaturesSchema.optional(),
});

/**
 * Schema principal de Tenant
 */
export const TenantSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  country: z.string(),
  countryCode: z.string().length(2), // ISO 3166-1 alpha-2
  countryFlag: z.string(),
  locale: z.string(), // es-EC, es-CO, en-US, pt-BR
  currency: z.string().length(3), // ISO 4217
  currencySymbol: z.string(),
  timezone: z.string().optional(), // America/Guayaquil
  branding: TenantBrandingSchema,
  features: TenantFeaturesSchema,
});

/**
 * Schema para array de tenants
 */
export const TenantArraySchema = z.array(TenantSchema);

/**
 * Schema simplificado para el selector de instituciones
 */
export const TenantInfoSchema = TenantSchema.pick({
  id: true,
  slug: true,
  name: true,
  country: true,
  countryFlag: true,
}).extend({
  logoUrl: z.string().url(),
  mainColor: z.string(),
  currencyCode: z.string(),
});

// Exportar tipos inferidos
export type TenantBranding = z.infer<typeof TenantBrandingSchema>;
export type TenantCardFeatures = z.infer<typeof TenantCardFeaturesSchema>;
export type TenantInsuranceFeatures = z.infer<typeof TenantInsuranceFeaturesSchema>;
export type TenantFeatures = z.infer<typeof TenantFeaturesSchema>;
export type Tenant = z.infer<typeof TenantSchema>;
export type TenantInfo = z.infer<typeof TenantInfoSchema>;
