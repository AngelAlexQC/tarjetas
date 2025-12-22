/**
 * Mock Tenant Repository - LibelulaSoft
 * 
 * Implementación mock con datos de ejemplo para desarrollo.
 * Los datos aquí son solo para testing, en producción vienen del backend.
 */

import { API_CONFIG } from '@/core/http/config';
import type { ITenantRepository } from '../interfaces/tenant.repository.interface';
import type { Tenant } from '../schemas/tenant.schema';

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
  {
    id: '3',
    slug: 'dinersclub-ec',
    name: 'Diners Club',
    country: 'Ecuador',
    countryCode: 'EC',
    countryFlag: '🇪🇨',
    locale: 'es-EC',
    currency: 'USD',
    currencySymbol: 'US$',
    branding: {
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Diners_Club_Logo3.svg',
      primaryColor: '#0079be',
      secondaryColor: '#0091ea',
      accentColor: '#40c4ff',
      gradientColors: ['#0079be', '#0091ea', '#40c4ff'],
      textOnPrimary: '#FFFFFF',
      textOnSecondary: '#FFFFFF',
    },
    features: {
      cards: {
        enabled: true,
        allowedTypes: ['credit'],
        allowedActions: ['pay', 'block', 'defer', 'statement', 'advances', 'limits', 'pin', 'travel', 'rewards'],
        maxCreditLimit: 8000,
      },
      transfers: { enabled: false },
      loans: { enabled: false },
      insurance: {
        enabled: true,
        allowedTypes: ['vida', 'viaje-accidente'],
      },
    },
  },

  // Colombia
  {
    id: '4',
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
  {
    id: '5',
    slug: 'davivienda-co',
    name: 'Davivienda',
    country: 'Colombia',
    countryCode: 'CO',
    countryFlag: '🇨🇴',
    locale: 'es-CO',
    currency: 'COP',
    currencySymbol: 'COP$',
    branding: {
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Davivienda_Logo.png',
      primaryColor: '#D22C21',
      secondaryColor: '#e53935',
      accentColor: '#ff5252',
      gradientColors: ['#D22C21', '#e53935', '#ff5252'],
      textOnPrimary: '#FFFFFF',
      textOnSecondary: '#FFFFFF',
    },
    features: {
      cards: {
        enabled: true,
        allowedTypes: ['credit', 'debit'],
        allowedActions: ['pay', 'block', 'statement', 'limits', 'pin', 'cvv'],
        maxCreditLimit: 12000,
      },
      transfers: { enabled: true },
      loans: { enabled: false },
      insurance: {
        enabled: true,
        allowedTypes: ['vida', 'fraude', 'desempleo'],
      },
    },
  },

  // México
  {
    id: '6',
    slug: 'bbva-mx',
    name: 'BBVA México',
    country: 'México',
    countryCode: 'MX',
    countryFlag: '🇲🇽',
    locale: 'es-MX',
    currency: 'MXN',
    currencySymbol: 'MX$',
    branding: {
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/98/BBVA_logo_2025.svg',
      primaryColor: '#004481',
      secondaryColor: '#1565c0',
      accentColor: '#2196f3',
      gradientColors: ['#004481', '#1565c0', '#2196f3'],
      textOnPrimary: '#FFFFFF',
      textOnSecondary: '#FFFFFF',
    },
    features: {
      cards: {
        enabled: true,
        allowedTypes: ['credit', 'debit', 'virtual'],
        allowedActions: ['pay', 'block', 'defer', 'statement', 'advances', 'limits', 'pin', 'subscriptions', 'travel', 'cvv'],
        maxCreditLimit: 20000,
      },
      transfers: { enabled: true },
      loans: { enabled: true },
      insurance: {
        enabled: true,
        allowedTypes: ['vida', 'fraude', 'viaje-accidente'],
      },
    },
  },

  // Internacionales
  {
    id: '7',
    slug: 'jpmorgan',
    name: 'JPMorgan Chase',
    country: 'United States',
    countryCode: 'US',
    countryFlag: '🇺🇸',
    locale: 'en-US',
    currency: 'USD',
    currencySymbol: 'US$',
    branding: {
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Chase_logo.svg/200px-Chase_logo.svg.png',
      primaryColor: '#117ACA',
      secondaryColor: '#1E88E5',
      accentColor: '#42A5F5',
      gradientColors: ['#117ACA', '#1E88E5', '#42A5F5'],
      textOnPrimary: '#FFFFFF',
      textOnSecondary: '#FFFFFF',
    },
    features: {
      cards: {
        enabled: true,
        allowedTypes: ['credit', 'debit', 'virtual'],
        allowedActions: ['pay', 'block', 'statement', 'advances', 'limits', 'pin', 'travel', 'cvv', 'replace', 'rewards'],
        maxCreditLimit: 30000,
      },
      transfers: { enabled: true },
      loans: { enabled: true },
      insurance: {
        enabled: true,
        allowedTypes: ['vida', 'fraude', 'viaje-accidente', 'robo'],
      },
    },
  },
  {
    id: '8',
    slug: 'hsbc',
    name: 'HSBC',
    country: 'United Kingdom',
    countryCode: 'GB',
    countryFlag: '🇬🇧',
    locale: 'en-GB',
    currency: 'GBP',
    currencySymbol: '£',
    branding: {
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/HSBC_logo_%282018%29.svg/200px-HSBC_logo_%282018%29.svg.png',
      primaryColor: '#DB0011',
      secondaryColor: '#EE3524',
      accentColor: '#ff5252',
      gradientColors: ['#DB0011', '#EE3524', '#ff5252'],
      textOnPrimary: '#FFFFFF',
      textOnSecondary: '#FFFFFF',
    },
    features: {
      cards: {
        enabled: true,
        allowedTypes: ['credit', 'debit'],
        allowedActions: ['pay', 'block', 'statement', 'limits', 'pin', 'travel', 'cvv'],
        maxCreditLimit: 25000,
      },
      transfers: { enabled: true },
      loans: { enabled: true },
      insurance: {
        enabled: true,
        allowedTypes: ['vida', 'viaje-accidente'],
      },
    },
  },
  {
    id: '9',
    slug: 'santander',
    name: 'Banco Santander',
    country: 'España',
    countryCode: 'ES',
    countryFlag: '🇪🇸',
    locale: 'es-ES',
    currency: 'EUR',
    currencySymbol: '€',
    branding: {
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Banco_Santander_Logotipo.svg/200px-Banco_Santander_Logotipo.svg.png',
      primaryColor: '#EC0000',
      secondaryColor: '#EA1D25',
      accentColor: '#ff3838',
      gradientColors: ['#EC0000', '#EA1D25', '#ff3838'],
      textOnPrimary: '#FFFFFF',
      textOnSecondary: '#FFFFFF',
    },
    features: {
      cards: {
        enabled: true,
        allowedTypes: ['credit', 'debit'],
        allowedActions: ['pay', 'block', 'statement', 'limits', 'pin', 'travel'],
        maxCreditLimit: 18000,
      },
      transfers: { enabled: true },
      loans: { enabled: true },
      insurance: {
        enabled: true,
        allowedTypes: ['vida', 'fraude', 'viaje-accidente'],
      },
    },
  },
  {
    id: '10',
    slug: 'deutsche-bank',
    name: 'Deutsche Bank',
    country: 'Deutschland',
    countryCode: 'DE',
    countryFlag: '🇩🇪',
    locale: 'de-DE',
    currency: 'EUR',
    currencySymbol: '€',
    branding: {
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Deutsche_Bank_logo_without_wordmark.svg/200px-Deutsche_Bank_logo_without_wordmark.svg.png',
      primaryColor: '#0018A8',
      secondaryColor: '#00A3E0',
      accentColor: '#42b4e6',
      gradientColors: ['#0018A8', '#00A3E0', '#42b4e6'],
      textOnPrimary: '#FFFFFF',
      textOnSecondary: '#FFFFFF',
    },
    features: {
      cards: {
        enabled: true,
        allowedTypes: ['credit', 'debit'],
        allowedActions: ['pay', 'block', 'statement', 'limits', 'pin'],
        maxCreditLimit: 20000,
      },
      transfers: { enabled: true },
      loans: { enabled: true },
      insurance: {
        enabled: true,
        allowedTypes: ['vida'],
      },
    },
  },
  {
    id: '11',
    slug: 'bnp-paribas',
    name: 'BNP Paribas',
    country: 'France',
    countryCode: 'FR',
    countryFlag: '🇫🇷',
    locale: 'fr-FR',
    currency: 'EUR',
    currencySymbol: '€',
    branding: {
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7b/BNP_Paribas.svg/200px-BNP_Paribas.svg.png',
      primaryColor: '#008755',
      secondaryColor: '#39a87b',
      accentColor: '#6abb97',
      gradientColors: ['#007348', '#008755', '#39a87b'],
      textOnPrimary: '#FFFFFF',
      textOnSecondary: '#FFFFFF',
    },
    features: {
      cards: {
        enabled: true,
        allowedTypes: ['credit', 'debit'],
        allowedActions: ['pay', 'block', 'statement', 'limits', 'pin', 'travel'],
        maxCreditLimit: 22000,
      },
      transfers: { enabled: true },
      loans: { enabled: true },
      insurance: {
        enabled: true,
        allowedTypes: ['vida', 'viaje-accidente'],
      },
    },
  },
  {
    id: '12',
    slug: 'icbc',
    name: 'ICBC China',
    country: 'China',
    countryCode: 'CN',
    countryFlag: '🇨🇳',
    locale: 'zh-CN',
    currency: 'CNY',
    currencySymbol: '¥',
    branding: {
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/ICBC_Logo.svg/200px-ICBC_Logo.svg.png',
      primaryColor: '#C8102E',
      secondaryColor: '#E31837',
      accentColor: '#ff4757',
      gradientColors: ['#C8102E', '#E31837', '#ff4757'],
      textOnPrimary: '#FFFFFF',
      textOnSecondary: '#FFFFFF',
    },
    features: {
      cards: {
        enabled: true,
        allowedTypes: ['credit', 'debit'],
        allowedActions: ['pay', 'block', 'statement', 'limits'],
        maxCreditLimit: 15000,
      },
      transfers: { enabled: true },
      loans: { enabled: true },
      insurance: {
        enabled: false,
        allowedTypes: [],
      },
    },
  },
  {
    id: '13',
    slug: 'commonwealth',
    name: 'Commonwealth Bank',
    country: 'Australia',
    countryCode: 'AU',
    countryFlag: '🇦🇺',
    locale: 'en-AU',
    currency: 'AUD',
    currencySymbol: 'A$',
    branding: {
      logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/09/Commonwealth_Bank_logo.svg/200px-Commonwealth_Bank_logo.svg.png',
      primaryColor: '#FFCC00',
      secondaryColor: '#FFD700',
      accentColor: '#FFE033',
      gradientColors: ['#FFCC00', '#FFD700', '#FFE033'],
      textOnPrimary: '#000000',
      textOnSecondary: '#000000',
    },
    features: {
      cards: {
        enabled: true,
        allowedTypes: ['credit', 'debit', 'virtual'],
        allowedActions: ['pay', 'block', 'statement', 'advances', 'limits', 'pin', 'travel', 'cvv'],
        maxCreditLimit: 28000,
      },
      transfers: { enabled: true },
      loans: { enabled: true },
      insurance: {
        enabled: true,
        allowedTypes: ['vida', 'fraude', 'viaje-accidente'],
      },
    },
  },
  {
    id: '14',
    slug: 'itau',
    name: 'Itaú Unibanco',
    country: 'Brasil',
    countryCode: 'BR',
    countryFlag: '🇧🇷',
    locale: 'pt-BR',
    currency: 'BRL',
    currencySymbol: 'R$',
    branding: {
      logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Ita%C3%BA_Unibanco_logo.svg/200px-Ita%C3%BA_Unibanco_logo.svg.png',
      primaryColor: '#EC7000',
      secondaryColor: '#FF8C00',
      accentColor: '#FFA726',
      gradientColors: ['#EC7000', '#FF8C00', '#FFA726'],
      textOnPrimary: '#FFFFFF',
      textOnSecondary: '#FFFFFF',
    },
    features: {
      cards: {
        enabled: true,
        allowedTypes: ['credit', 'debit'],
        allowedActions: ['pay', 'block', 'statement', 'limits', 'pin', 'travel'],
        maxCreditLimit: 16000,
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
