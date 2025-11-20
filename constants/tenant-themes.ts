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
}

// Mapeo de tenants a sus temas personalizados
export const tenantThemes: Record<string, TenantTheme> = {
  'bpichincha': {
    slug: 'bpichincha',
    name: 'Banco Pichincha',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Banco_Pichincha_logo.svg/200px-Banco_Pichincha_logo.svg.png',
    mainColor: '#ffdf00',
    secondaryColor: '#ffd700',
    accentColor: '#ff6f00',
    gradientColors: ['#ffdf00', '#ffd700', '#ffb300'],
    textOnPrimary: '#000000',
    textOnSecondary: '#000000',
  },
  'coopchone': {
    slug: 'coopchone',
    name: 'Cooperativa Chone',
    logoUrl: 'https://www.coopchone.fin.ec/wp-content/uploads/2021/03/logo-coopchone.png',
    mainColor: '#006837',
    secondaryColor: '#00854a',
    accentColor: '#4caf50',
    gradientColors: ['#006837', '#00854a', '#4caf50'],
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#FFFFFF',
  },
  'dinersclub-ec': {
    slug: 'dinersclub-ec',
    name: 'Diners Club',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Diners_Club_Logo3.svg/200px-Diners_Club_Logo3.svg.png',
    mainColor: '#0079be',
    secondaryColor: '#0091ea',
    accentColor: '#40c4ff',
    gradientColors: ['#0079be', '#0091ea', '#40c4ff'],
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#FFFFFF',
  },
  'bancolombia': {
    slug: 'bancolombia',
    name: 'Bancolombia',
    logoUrl: 'https://www.bancolombia.com/wcm/connect/www.bancolombia.com-15601/2a4e4e43-6b08-4a6d-8c0b-8b0d5e5c5c5c/logo-bancolombia.png',
    mainColor: '#FFEB00',
    secondaryColor: '#FFD600',
    accentColor: '#FFC107',
    gradientColors: ['#FFEB00', '#FFD600', '#FFC107'],
    textOnPrimary: '#000000',
    textOnSecondary: '#000000',
  },
  'davivienda-co': {
    slug: 'davivienda-co',
    name: 'Davivienda',
    logoUrl: 'https://www.davivienda.com/wps/wcm/connect/personas/5a5e5a5c-5a5e-5a5c-5a5e-5a5c5a5e5a5c/logo-davivienda.png',
    mainColor: '#D22C21',
    secondaryColor: '#e53935',
    accentColor: '#ff5252',
    gradientColors: ['#D22C21', '#e53935', '#ff5252'],
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#FFFFFF',
  },
  'bbva-mx': {
    slug: 'bbva-mx',
    name: 'BBVA Mexico',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/BBVA_2019.svg/200px-BBVA_2019.svg.png',
    mainColor: '#0f1f7a',
    secondaryColor: '#1565c0',
    accentColor: '#2196f3',
    gradientColors: ['#0f1f7a', '#1565c0', '#2196f3'],
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#FFFFFF',
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
};

// Función helper para obtener el tema de un tenant
export function getTenantTheme(slug: string): TenantTheme {
  return tenantThemes[slug] || defaultTheme;
}
