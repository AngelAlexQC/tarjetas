/**
 * Tenant Themes & Configuration
 * 
 * Fuente única de verdad para toda la información de tenants:
 * - Información de display (nombre, logo, país)
 * - Configuración de tema (colores, gradientes)
 * - Localización (locale, moneda)
 */

// Interfaz central para temas de tenant
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
  // Campos para el selector de instituciones
  country: string;
  countryFlag: string;
}

// Tipo simplificado para el selector de instituciones
export type TenantInfo = Pick<TenantTheme, 'slug' | 'name' | 'logoUrl' | 'mainColor' | 'country' | 'countryFlag'> & {
  currencyCode: string;
};

// Mapeo de tenants a sus temas personalizados
export const tenantThemes: Record<string, TenantTheme> = {
  // Bancos Ecuador
  'bpichincha': {
    slug: 'bpichincha',
    name: 'Banco Pichincha',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Banco_Pichincha_nuevo.png',
    mainColor: '#ffdf00',
    secondaryColor: '#ffd700',
    accentColor: '#ff6f00',
    gradientColors: ['#ffdf00', '#ffd700', '#ffb300'],
    textOnPrimary: '#000000',
    textOnSecondary: '#000000',
    locale: 'es-EC',
    currency: 'USD',
    currencySymbol: 'US$',
    country: 'Ecuador',
    countryFlag: '🇪🇨',
  },
  'coopchone': {
    slug: 'coopchone',
    name: 'Cooperativa de Ahorro y Crédito Chone',
    logoUrl: 'https://coopchone.fin.ec/wp-content/uploads/2025/01/LogoHorizontal.png',
    mainColor: '#006837',
    secondaryColor: '#00854a',
    accentColor: '#4caf50',
    gradientColors: ['#006837', '#00854a', '#4caf50'],
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#FFFFFF',
    locale: 'es-EC',
    currency: 'USD',
    currencySymbol: 'US$',
    country: 'Ecuador',
    countryFlag: '🇪🇨',
  },
  'dinersclub-ec': {
    slug: 'dinersclub-ec',
    name: 'Diners Club',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Diners_Club_Logo3.svg',
    mainColor: '#0079be',
    secondaryColor: '#0091ea',
    accentColor: '#40c4ff',
    gradientColors: ['#0079be', '#0091ea', '#40c4ff'],
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#FFFFFF',
    locale: 'es-EC',
    currency: 'USD',
    currencySymbol: 'US$',
    country: 'Ecuador',
    countryFlag: '🇪🇨',
  },
  
  // Bancos Colombia
  'bancolombia': {
    slug: 'bancolombia',
    name: 'Bancolombia',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/dc/Bancolombia_S.A._logo.svg',
    mainColor: '#FFEB00',
    secondaryColor: '#FFD600',
    accentColor: '#FFC107',
    gradientColors: ['#FFEB00', '#FFD600', '#FFC107'],
    textOnPrimary: '#000000',
    textOnSecondary: '#000000',
    locale: 'es-CO',
    currency: 'COP',
    currencySymbol: 'COP$',
    country: 'Colombia',
    countryFlag: '🇨🇴',
  },
  'davivienda-co': {
    slug: 'davivienda-co',
    name: 'Davivienda',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Davivienda_Logo.png',
    mainColor: '#D22C21',
    secondaryColor: '#e53935',
    accentColor: '#ff5252',
    gradientColors: ['#D22C21', '#e53935', '#ff5252'],
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#FFFFFF',
    locale: 'es-CO',
    currency: 'COP',
    currencySymbol: 'COP$',
    country: 'Colombia',
    countryFlag: '🇨🇴',
  },
  
  // Bancos México
  'bbva-mx': {
    slug: 'bbva-mx',
    name: 'BBVA México',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/98/BBVA_logo_2025.svg',
    mainColor: '#004481',
    secondaryColor: '#1565c0',
    accentColor: '#2196f3',
    gradientColors: ['#004481', '#1565c0', '#2196f3'],
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#FFFFFF',
    locale: 'es-MX',
    currency: 'MXN',
    currencySymbol: 'MX$',
    country: 'México',
    countryFlag: '🇲🇽',
  },
  
  // Bancos Internacionales
  'jpmorgan': {
    slug: 'jpmorgan',
    name: 'JPMorgan Chase',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Chase_logo.svg/200px-Chase_logo.svg.png',
    mainColor: '#117ACA',
    secondaryColor: '#1E88E5',
    accentColor: '#42A5F5',
    gradientColors: ['#117ACA', '#1E88E5', '#42A5F5'],
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#FFFFFF',
    locale: 'en-US',
    currency: 'USD',
    currencySymbol: 'US$',
    country: 'United States',
    countryFlag: '🇺🇸',
  },
  'hsbc': {
    slug: 'hsbc',
    name: 'HSBC',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/HSBC_logo_%282018%29.svg/200px-HSBC_logo_%282018%29.svg.png',
    mainColor: '#DB0011',
    secondaryColor: '#EE3524',
    accentColor: '#ff5252',
    gradientColors: ['#DB0011', '#EE3524', '#ff5252'],
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#FFFFFF',
    locale: 'en-GB',
    currency: 'GBP',
    currencySymbol: '£',
    country: 'United Kingdom',
    countryFlag: '🇬🇧',
  },
  'santander': {
    slug: 'santander',
    name: 'Banco Santander',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Banco_Santander_Logotipo.svg/200px-Banco_Santander_Logotipo.svg.png',
    mainColor: '#EC0000',
    secondaryColor: '#EA1D25',
    accentColor: '#ff3838',
    gradientColors: ['#EC0000', '#EA1D25', '#ff3838'],
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#FFFFFF',
    locale: 'es-ES',
    currency: 'EUR',
    currencySymbol: '€',
    country: 'España',
    countryFlag: '🇪🇸',
  },
  'deutsche-bank': {
    slug: 'deutsche-bank',
    name: 'Deutsche Bank',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Deutsche_Bank_logo_without_wordmark.svg/200px-Deutsche_Bank_logo_without_wordmark.svg.png',
    mainColor: '#0018A8',
    secondaryColor: '#00A3E0',
    accentColor: '#42b4e6',
    gradientColors: ['#0018A8', '#00A3E0', '#42b4e6'],
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#FFFFFF',
    locale: 'de-DE',
    currency: 'EUR',
    currencySymbol: '€',
    country: 'Deutschland',
    countryFlag: '🇩🇪',
  },
  'bnp-paribas': {
    slug: 'bnp-paribas',
    name: 'BNP Paribas',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7b/BNP_Paribas.svg/200px-BNP_Paribas.svg.png',
    mainColor: '#008755',
    secondaryColor: '#39a87b',
    accentColor: '#6abb97',
    gradientColors: ['#007348', '#008755', '#39a87b'],
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#FFFFFF',
    locale: 'fr-FR',
    currency: 'EUR',
    currencySymbol: '€',
    country: 'France',
    countryFlag: '🇫🇷',
  },
  'icbc': {
    slug: 'icbc',
    name: 'ICBC China',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/ICBC_Logo.svg/200px-ICBC_Logo.svg.png',
    mainColor: '#C8102E',
    secondaryColor: '#E31837',
    accentColor: '#ff4757',
    gradientColors: ['#C8102E', '#E31837', '#ff4757'],
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#FFFFFF',
    locale: 'zh-CN',
    currency: 'CNY',
    currencySymbol: '¥',
    country: 'China',
    countryFlag: '🇨🇳',
  },
  'commonwealth': {
    slug: 'commonwealth',
    name: 'Commonwealth Bank',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/09/Commonwealth_Bank_logo.svg/200px-Commonwealth_Bank_logo.svg.png',
    mainColor: '#FFCC00',
    secondaryColor: '#FFD700',
    accentColor: '#FFE033',
    gradientColors: ['#FFCC00', '#FFD700', '#FFE033'],
    textOnPrimary: '#000000',
    textOnSecondary: '#000000',
    locale: 'en-AU',
    currency: 'AUD',
    currencySymbol: 'A$',
    country: 'Australia',
    countryFlag: '🇦🇺',
  },
  'itau': {
    slug: 'itau',
    name: 'Itaú Unibanco',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Ita%C3%BA_Unibanco_logo.svg/200px-Ita%C3%BA_Unibanco_logo.svg.png',
    mainColor: '#EC7000',
    secondaryColor: '#FF8C00',
    accentColor: '#FFA726',
    gradientColors: ['#EC7000', '#FF8C00', '#FFA726'],
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#FFFFFF',
    locale: 'pt-BR',
    currency: 'BRL',
    currencySymbol: 'R$',
    country: 'Brasil',
    countryFlag: '🇧🇷',
  },
};

// Tema por defecto
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

// ============================================
// Funciones Helper
// ============================================

/**
 * Obtiene el tema completo de un tenant por su slug
 */
export function getTenantTheme(slug: string): TenantTheme {
  return tenantThemes[slug] || defaultTheme;
}

/**
 * Lista de todos los tenants disponibles (para el selector de instituciones)
 */
export const AVAILABLE_TENANTS: TenantInfo[] = Object.values(tenantThemes).map(theme => ({
  slug: theme.slug,
  name: theme.name,
  logoUrl: theme.logoUrl,
  mainColor: theme.mainColor,
  currencyCode: theme.currencySymbol,
  country: theme.country,
  countryFlag: theme.countryFlag,
}));

/**
 * Busca tenants por nombre o país
 */
export function searchTenants(query: string): TenantInfo[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return AVAILABLE_TENANTS;
  
  return AVAILABLE_TENANTS.filter(t => 
    t.name.toLowerCase().includes(normalizedQuery) ||
    t.country.toLowerCase().includes(normalizedQuery)
  );
}
