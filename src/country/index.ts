import { colombiaConfig } from './co';
import { ecuadorConfig } from './ec';
import { mexicoConfig } from './mx';
import type { CountryConfig } from './types';

/**
 * Registro de configuraciones por país
 * Agregar nuevos países aquí
 */
const countries: Record<string, CountryConfig> = {
  CO: colombiaConfig,
  EC: ecuadorConfig,
  MX: mexicoConfig,
};

/**
 * Obtiene la configuración de un país por su código ISO
 * @param code - Código ISO del país (CO, EC, MX)
 * @returns CountryConfig o undefined si no existe
 */
export function getCountryConfig(code: string): CountryConfig | undefined {
  return countries[code.toUpperCase()];
}

/**
 * Lista todos los códigos de países disponibles
 */
export function getAvailableCountries(): string[] {
  return Object.keys(countries);
}

// Export configs individuales para uso directo
export { colombiaConfig, ecuadorConfig, mexicoConfig };

// Export validadores con namespaces para evitar conflictos
export * as coValidators from './co/validators';
export * as ecValidators from './ec/validators';
export * as mxValidators from './mx/validators';

// Export types
export type { CountryConfig } from './types';
