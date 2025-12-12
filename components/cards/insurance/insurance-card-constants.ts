import type { Ionicons } from '@expo/vector-icons';

// Mapeo de iconos personalizados a Ionicons
export const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  heart: 'heart',
  shield: 'shield-checkmark',
  briefcase: 'briefcase',
  airplane: 'airplane',
  medical: 'medical',
  cart: 'cart',
  lock: 'lock-closed',
  globe: 'globe',
};

// Colores minimalistas por tipo de seguro
export const INSURANCE_COLORS: Record<string, string> = {
  vida: '#FF3B30',
  fraude: '#007AFF',
  desempleo: '#FF9500',
  'viaje-accidente': '#5856D6',
  incapacidad: '#34C759',
  compras: '#FF2D55',
  robo: '#5AC8FA',
  'asistencia-viaje': '#FFCC00',
};

// Badges minimalistas
export const BADGE_COLORS: Record<string, string> = {
  Popular: '#FF3B30',
  Recomendado: '#34C759',
  Nuevo: '#5856D6',
  Disponible: '#007AFF',
};

export function getInsuranceColor(type: string): string {
  return INSURANCE_COLORS[type] || INSURANCE_COLORS.fraude;
}

export function getBadgeStyle(badge: string | undefined, _isDark: boolean) {
  if (!badge) {
    return {
      backgroundColor: 'transparent',
      color: '',
    };
  }

  return {
    backgroundColor: `${BADGE_COLORS[badge]}15`,
    color: BADGE_COLORS[badge],
  };
}
