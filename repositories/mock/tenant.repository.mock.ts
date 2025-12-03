/**
 * Mock Tenant Repository - LibelulaSoft
 * 
 * Implementación mock con datos de ejemplo para desarrollo.
 * Los datos aquí son solo para testing, en producción vienen del backend.
 */

import { API_CONFIG } from '@/api/config';
import type { Tenant } from '../schemas/tenant.schema';
import type { ITenantRepository } from '../interfaces/tenant.repository.interface';

// Simula delay de red
const delay = (ms: number = API_CONFIG.MOCK_DELAY) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Datos mock de tenants - Solo para desarrollo
const MOCK_TENANTS: Tenant[] = [
  // Ecuador
  {
    id: '1',
    slug: 'bpichincha',
    name: 'Banco Pichincha',
    country: 'Ecuador',
    countryCode: 'EC',
    countryFlag: '🇪🇨',
    locale: 'es-EC',
    currency: 'USD',
    currencySymbol: 'US$',
    branding: {
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Banco_Pichincha_nuevo.png',
      primaryColor: '#ffdf00',
      secondaryColor: '#ffd700',
      accentColor: '#ff6f00',
      gradientColors: ['#ffdf00', '#ffd700', '#ffb300'],
      textOnPrimary: '#000000',
      textOnSecondary: '#000000',
    },
    features: {
      cards: {
        enabled: true,
        allowedTypes: ['credit', 'debit', 'virtual'],
        allowedActions: ['pay', 'block', 'defer', 'statement', 'advances', 'limits', 'pin', 'subscriptions', 'travel', 'cvv', 'replace', 'rewards'],
        maxCreditLimit: 10000,
      },
      transfers: { enabled: true },
      loans: { enabled: false },
      insurance: {
        enabled: true,
        allowedTypes: ['vida', 'fraude', 'desempleo', 'viaje-accidente'],
      },
    },
  },
  {
    id: '2',
    slug: 'coopchone',
    name: 'Cooperativa de Ahorro y Crédito Chone',
    country: 'Ecuador',
    countryCode: 'EC',
    countryFlag: '🇪🇨',
    locale: 'es-EC',
    currency: 'USD',
    currencySymbol: 'US$',
    branding: {
      logoUrl: 'https://coopchone.fin.ec/wp-content/uploads/2025/01/LogoHorizontal.png',
      primaryColor: '#006837',
      secondaryColor: '#00854a',
      accentColor: '#4caf50',
      gradientColors: ['#006837', '#00854a', '#4caf50'],
      textOnPrimary: '#FFFFFF',
      textOnSecondary: '#FFFFFF',
    },
    features: {
      cards: {
        enabled: true,
        allowedTypes: ['credit', 'debit'],
        allowedActions: ['pay', 'block', 'statement', 'limits', 'pin'],
        maxCreditLimit: 5000,
      },
      transfers: { enabled: false },
      loans: { enabled: true },
      insurance: {
        enabled: false,
        allowedTypes: [],
      },
    },
  },
  // Colombia
  {
    id: '3',
    slug: 'bancolombia',
    name: 'Bancolombia',
    country: 'Colombia',
    countryCode: 'CO',
    countryFlag: '🇨🇴',
    locale: 'es-CO',
    currency: 'COP',
    currencySymbol: 'COP$',
    branding: {
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/dc/Bancolombia_S.A._logo.svg',
      primaryColor: '#FFEB00',
      secondaryColor: '#FFD600',
      accentColor: '#FFC107',
      gradientColors: ['#FFEB00', '#FFD600', '#FFC107'],
      textOnPrimary: '#000000',
      textOnSecondary: '#000000',
    },
    features: {
      cards: {
        enabled: true,
        allowedTypes: ['credit', 'debit', 'virtual'],
        allowedActions: ['pay', 'block', 'statement', 'advances', 'limits', 'pin', 'travel', 'cvv'],
        maxCreditLimit: 15000,
      },
      transfers: { enabled: true },
      loans: { enabled: true },
      insurance: {
        enabled: true,
        allowedTypes: ['vida', 'fraude'],
      },
    },
  },
];

export class MockTenantRepository implements ITenantRepository {
  async getTenants(): Promise<Tenant[]> {
    await delay();
    return [...MOCK_TENANTS];
  }

  async getTenantById(id: string): Promise<Tenant | undefined> {
    await delay();
    return MOCK_TENANTS.find(t => t.id === id);
  }

  async getTenantBySlug(slug: string): Promise<Tenant | undefined> {
    await delay();
    return MOCK_TENANTS.find(t => t.slug === slug);
  }

  async searchTenants(query: string): Promise<Tenant[]> {
    await delay();
    const normalizedQuery = query.toLowerCase().trim();
    
    if (!normalizedQuery) {
      return [...MOCK_TENANTS];
    }
    
    return MOCK_TENANTS.filter(t => 
      t.name.toLowerCase().includes(normalizedQuery) ||
      t.country.toLowerCase().includes(normalizedQuery)
    );
  }
}
