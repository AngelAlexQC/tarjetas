/**
 * Definición de tipos y constantes para tarjetas financieras
 */

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'diners' | 'jcb' | 'maestro' | 'unionpay';
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
  jcb: {
    gradientColors: ['#0E4C96', '#1E5BA8', '#2E6DB9'],
    textColor: '#FFFFFF',
    chipColor: '#FFD700',
  },
  maestro: {
    gradientColors: ['#0099DF', '#00A1E0', '#00A9E0'],
    textColor: '#FFFFFF',
    chipColor: '#FFD700',
  },
  unionpay: {
    gradientColors: ['#E21836', '#E94B3C', '#F05A3E'],
    textColor: '#FFFFFF',
    chipColor: '#FFD700',
  },
};

// Etiquetas localizadas
export const CARD_TYPE_LABELS: Record<CardType, string> = {
  credit: 'Crédito',
  debit: 'Débito',
  virtual: 'Virtual',
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
