/**
 * useCountryConfig Hook
 * 
 * Hook que conecta automáticamente el tenant seleccionado con su configuración de país.
 * Proporciona validadores, formatters y reglas específicas del país.
 * 
 * @example
 * ```tsx
 * function RegisterForm() {
 *   const { validators, phonePrefix, documentTypes } = useCountryConfig();
 *   
 *   const handleSubmit = () => {
 *     if (!validators?.nationalId(cedula)) {
 *       setError('Cédula inválida');
 *     }
 *   };
 * }
 * ```
 */

import { getCountryConfig } from '@/country';
import type { CountryConfig } from '@/country';
import { createFormatters } from '@/core/formatters';
import { useTenantTheme } from '@/contexts/tenant-theme-context';
import type { Tenant } from '@/repositories/schemas/tenant.schema';
import { useMemo } from 'react';

interface UseCountryConfigReturn {
  /** Configuración completa del país */
  country: CountryConfig | null;
  
  /** Tenant actual (para acceso rápido) */
  tenant: Tenant | null;
  
  /** Validadores específicos del país (cédula, NIT, RUC, etc.) */
  validators: CountryConfig['validators'] | null;
  
  /** Formatters con locale y currency del tenant */
  formatters: ReturnType<typeof createFormatters> | null;
  
  /** Prefijo telefónico del país (+57, +593, +52) */
  phonePrefix: string | null;
  
  /** Tipos de documento permitidos en el país */
  documentTypes: string[];
  
  /** Detalles de tipos de documento con nombres descriptivos */
  documentTypeDetails: { code: string; name: string }[];
  
  /** Código del país (CO, EC, MX) */
  countryCode: string | null;
  
  /** Nombre del país */
  countryName: string | null;
}

/**
 * Hook que proporciona configuración del país basado en el tenant seleccionado
 */
export function useCountryConfig(): UseCountryConfigReturn {
  const { currentTheme } = useTenantTheme();

  return useMemo(() => {
    // Si no hay tema o no es un Tenant nuevo, retornar valores null
    if (!currentTheme || !('countryCode' in currentTheme)) {
      return {
        country: null,
        tenant: null,
        validators: null,
        formatters: null,
        phonePrefix: null,
        documentTypes: [],
        documentTypeDetails: [],
        countryCode: null,
        countryName: null,
      };
    }

    const tenant = currentTheme as Tenant;
    const country = getCountryConfig(tenant.countryCode);

    if (!country) {
      // País no configurado aún, retornar valores básicos del tenant
      return {
        country: null,
        tenant,
        validators: null,
        formatters: createFormatters(tenant.locale, tenant.currency),
        phonePrefix: null,
        documentTypes: [],
        documentTypeDetails: [],
        countryCode: tenant.countryCode,
        countryName: tenant.country,
      };
    }

    // País configurado, retornar todo
    return {
      country,
      tenant,
      validators: country.validators,
      formatters: createFormatters(tenant.locale, tenant.currency),
      phonePrefix: country.phonePrefix,
      documentTypes: country.documentTypes,
      documentTypeDetails: country.documentTypeDetails,
      countryCode: tenant.countryCode,
      countryName: country.name,
    };
  }, [currentTheme]);
}
