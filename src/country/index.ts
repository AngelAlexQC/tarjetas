import { ecuadorConfig } from './ec';
import type { CountryConfig } from './types';

const countries: Record<string, CountryConfig> = {
  EC: ecuadorConfig,
  // CO: colombiaConfig, 
  // MX: mexicoConfig, 
};

export function getCountryConfig(code: string): CountryConfig | undefined {
  return countries[code.toUpperCase()];
}

export type { CountryConfig } from './types';
