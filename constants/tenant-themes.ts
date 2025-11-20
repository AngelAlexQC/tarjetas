import { TenantTheme } from '@/contexts/tenant-theme-context';

// Mapeo de tenants a sus temas personalizados
export const tenantThemes: Record<string, TenantTheme> = {
  'bpichincha': {
    slug: 'bpichincha',
    name: 'Banco Pichincha',
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
    mainColor: '#0f1f7a',
    secondaryColor: '#1565c0',
    accentColor: '#2196f3',
    gradientColors: ['#0f1f7a', '#1565c0', '#2196f3'],
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#FFFFFF',
  },
};

// Función helper para obtener el tema de un tenant
export function getTenantTheme(slug: string): TenantTheme {
  return tenantThemes[slug] || {
    slug: 'default',
    name: 'Default',
    mainColor: '#0a7ea4',
    secondaryColor: '#2196F3',
    accentColor: '#FF9800',
    gradientColors: ['#0a7ea4', '#2196F3'],
    textOnPrimary: '#FFFFFF',
    textOnSecondary: '#FFFFFF',
  };
}
