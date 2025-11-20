/**
 * Definición de tipos y constantes para tarjetas financieras
 */

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'diners';
export type CardType = 'credit' | 'debit' | 'virtual';
export type CardStatus = 'active' | 'blocked' | 'expired' | 'pending';

export interface CardDesign {
  brand: CardBrand;
  type: CardType;
  gradientColors: string[];
  textColor: string;
  chipColor: string;
  logoUrl?: string;
}

// Colores realistas para cada marca de tarjeta
export const CARD_BRAND_DESIGNS: Record<CardBrand, Omit<CardDesign, 'brand' | 'type'>> = {
  visa: {
    gradientColors: ['#1A1F71', '#2D3B9E', '#4158D0'],
    textColor: '#FFFFFF',
    chipColor: '#FFD700',
  },
  mastercard: {
    gradientColors: ['#EB001B', '#F79E1B', '#FF6000'],
    textColor: '#FFFFFF',
    chipColor: '#FFD700',
  },
  amex: {
    gradientColors: ['#006FCF', '#0E7CCB', '#1E90FF'],
    textColor: '#FFFFFF',
    chipColor: '#FFFFFF',
  },
  discover: {
    gradientColors: ['#FF6600', '#FF8533', '#FFA366'],
    textColor: '#FFFFFF',
    chipColor: '#FFD700',
  },
  diners: {
    gradientColors: ['#0079BE', '#006699', '#0099CC'],
    textColor: '#FFFFFF',
    chipColor: '#FFFFFF',
  },
};

// Colores adicionales según el tipo de tarjeta
export const CARD_TYPE_VARIANTS: Record<CardType, { opacity: number; accentColor: string }> = {
  credit: {
    opacity: 1,
    accentColor: '#FFD700',
  },
  debit: {
    opacity: 0.95,
    accentColor: '#4CAF50',
  },
  virtual: {
    opacity: 0.9,
    accentColor: '#9C27B0',
  },
};

// Etiquetas localizadas
export const CARD_TYPE_LABELS: Record<CardType, string> = {
  credit: 'Crédito',
  debit: 'Débito',
  virtual: 'Virtual',
};

export const CARD_STATUS_LABELS: Record<CardStatus, string> = {
  active: 'Activa',
  blocked: 'Bloqueada',
  expired: 'Vencida',
  pending: 'Pendiente',
};

// Función helper para obtener el diseño de una tarjeta
export function getCardDesign(brand: CardBrand, type: CardType): CardDesign {
  const brandDesign = CARD_BRAND_DESIGNS[brand];
  
  return {
    brand,
    type,
    gradientColors: brandDesign.gradientColors,
    textColor: brandDesign.textColor,
    chipColor: brandDesign.chipColor,
    logoUrl: brandDesign.logoUrl,
  };
}

// Detectar marca de tarjeta por número
export function detectCardBrand(cardNumber: string): CardBrand {
  const cleanNumber = cardNumber.replace(/\s/g, '');
  
  if (/^4/.test(cleanNumber)) return 'visa';
  if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
  if (/^3[47]/.test(cleanNumber)) return 'amex';
  if (/^6(?:011|5)/.test(cleanNumber)) return 'discover';
  if (/^3(?:0[0-5]|[68])/.test(cleanNumber)) return 'diners';
  
  return 'visa'; // default
}
