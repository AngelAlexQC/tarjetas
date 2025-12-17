/**
 * Generador de datos de seguros con variaciones aleatorias
 * para el carrusel infinito de seguros disponibles
 */

export type InsuranceType =
  | 'vida'
  | 'fraude'
  | 'desempleo'
  | 'viaje-accidente'
  | 'incapacidad'
  | 'compras'
  | 'robo'
  | 'asistencia-viaje';

export type InsuranceBadge = 'Disponible' | 'Popular' | 'Nuevo' | 'Recomendado';

export interface Insurance {
  id: string;
  type: InsuranceType;
  title: string;
  description: string;
  coverage: string;
  coverageAmount: number;
  currency: string;
  badge?: InsuranceBadge;
  icon: string;
  color: string;
  benefits: string[];
  monthlyPrice: number;
}

// Datos base de tipos de seguros
const INSURANCE_TEMPLATES: Omit<Insurance, 'id' | 'coverageAmount' | 'monthlyPrice'>[] = [
  {
    type: 'vida',
    title: 'Seguro de Vida de Crédito',
    description: 'Protege a tu familia pagando la deuda en caso de fallecimiento',
    coverage: 'Hasta',
    currency: 'USD',
    badge: 'Recomendado',
    icon: 'heart',
    color: '#FF3B30',
    benefits: [
      'Cubre el saldo total de la tarjeta',
      'Sin exámenes médicos',
      'Activación inmediata',
      'Beneficiarios designados',
    ],
  },
  {
    type: 'fraude',
    title: 'Seguro contra Fraude',
    description: 'Protección total contra uso no autorizado y clonación',
    coverage: 'Hasta',
    currency: 'USD',
    badge: 'Popular',
    icon: 'shield',
    color: '#007AFF',
    benefits: [
      '100% de cargos fraudulentos',
      'Monitoreo 24/7',
      'Reembolso en 48 horas',
      'Sin deducibles',
    ],
  },
  {
    type: 'desempleo',
    title: 'Seguro de Desempleo',
    description: 'Cubre tus pagos mensuales si pierdes tu empleo',
    coverage: 'Hasta',
    currency: 'USD',
    badge: 'Disponible',
    icon: 'briefcase',
    color: '#FF9500',
    benefits: [
      'Cobertura de 6 meses',
      'Pago mínimo mensual cubierto',
      'Sin periodo de espera',
      'Válido en toda Latinoamérica',
    ],
  },
  {
    type: 'viaje-accidente',
    title: 'Seguro de Accidentes en Viajes',
    description: 'Cobertura global para ti y tu familia en cualquier viaje',
    coverage: 'Hasta',
    currency: 'USD',
    badge: 'Popular',
    icon: 'airplane',
    color: '#5856D6',
    benefits: [
      'Cobertura mundial',
      'Incluye cónyuge e hijos',
      'Muerte accidental cubierta',
      'Invalidez permanente',
    ],
  },
  {
    type: 'incapacidad',
    title: 'Seguro de Incapacidad',
    description: 'Cubre pagos por incapacidad temporal o permanente',
    coverage: 'Hasta',
    currency: 'USD',
    badge: 'Disponible',
    icon: 'medical',
    color: '#34C759',
    benefits: [
      'Cobertura inmediata',
      'Incapacidad temporal y permanente',
      'Sin límite de edad',
      'Incluye enfermedades crónicas',
    ],
  },
  {
    type: 'compras',
    title: 'Seguro de Compras Protegidas',
    description: 'Protege las compras realizadas con tu tarjeta',
    coverage: 'Hasta',
    currency: 'USD',
    badge: 'Nuevo',
    icon: 'cart',
    color: '#FF2D55',
    benefits: [
      'Protección hasta 90 días',
      'Daño, robo o pérdida',
      'Compras online y físicas',
      'Extensión de garantía',
    ],
  },
  {
    type: 'robo',
    title: 'Seguro de Robo y Extravío',
    description: 'Protección inmediata tras reporte de robo o pérdida',
    coverage: 'Hasta',
    currency: 'USD',
    badge: 'Recomendado',
    icon: 'lock',
    color: '#5AC8FA',
    benefits: [
      'Cero responsabilidad',
      'Bloqueo automático',
      'Tarjeta de reemplazo gratis',
      'Cobertura 24/7',
    ],
  },
  {
    type: 'asistencia-viaje',
    title: 'Seguro de Asistencia en Viajes',
    description: 'Asistencia médica, legal y de equipaje durante tus viajes',
    coverage: 'Hasta',
    currency: 'USD',
    badge: 'Popular',
    icon: 'globe',
    color: '#FFCC00',
    benefits: [
      'Asistencia médica de emergencia',
      'Equipaje perdido o demorado',
      'Asistencia legal',
      'Cancelación de vuelos',
    ],
  },
];

// Rangos de cobertura por tipo de seguro (en USD)
const COVERAGE_RANGES: Record<InsuranceType, { min: number; max: number }> = {
  'vida': { min: 100000, max: 500000 },
  'fraude': { min: 50000, max: 250000 },
  'desempleo': { min: 5000, max: 15000 },
  'viaje-accidente': { min: 250000, max: 500000 },
  'incapacidad': { min: 50000, max: 200000 },
  'compras': { min: 10000, max: 50000 },
  'robo': { min: 25000, max: 100000 },
  'asistencia-viaje': { min: 3000, max: 10000 },
};

// Rangos de precios mensuales por tipo (en USD)
const PRICE_RANGES: Record<InsuranceType, { min: number; max: number }> = {
  'vida': { min: 15, max: 45 },
  'fraude': { min: 5, max: 15 },
  'desempleo': { min: 10, max: 30 },
  'viaje-accidente': { min: 20, max: 50 },
  'incapacidad': { min: 12, max: 35 },
  'compras': { min: 8, max: 20 },
  'robo': { min: 5, max: 12 },
  'asistencia-viaje': { min: 10, max: 25 },
};

/**
 * Genera un número aleatorio entre min y max
 */
function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Redondea un número a múltiplos de un valor específico
 */
function roundToMultiple(num: number, multiple: number): number {
  return Math.round(num / multiple) * multiple;
}

/**
 * Mezcla aleatoriamente un array (Fisher-Yates shuffle)
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Genera una instancia de seguro con valores aleatorios
 */
function generateInsuranceInstance(
  template: Omit<Insurance, 'id' | 'coverageAmount' | 'monthlyPrice'>,
  index: number
): Insurance {
  const coverageRange = COVERAGE_RANGES[template.type];
  const priceRange = PRICE_RANGES[template.type];

  // Generar cobertura redondeada a múltiplos de 5000
  const coverageAmount = roundToMultiple(
    randomInRange(coverageRange.min, coverageRange.max),
    5000
  );

  // Generar precio redondeado a múltiplos de 5
  const monthlyPrice = roundToMultiple(
    randomInRange(priceRange.min, priceRange.max),
    5
  );

  return {
    ...template,
    id: `insurance-${template.type}-${index}-${Date.now()}`,
    coverageAmount,
    monthlyPrice,
  };
}

/**
 * Genera una lista infinita de seguros con variaciones aleatorias
 * @param count Cantidad de items a generar
 * @param startIndex Índice inicial para IDs únicos
 */
export function generateInsurances(count: number, startIndex: number = 0): Insurance[] {
  const insurances: Insurance[] = [];
  
  // Mezclar templates para variedad
  const shuffledTemplates = shuffleArray(INSURANCE_TEMPLATES);
  
  for (let i = 0; i < count; i++) {
    // Rotación circular a través de los templates
    const templateIndex = i % shuffledTemplates.length;
    const template = shuffledTemplates[templateIndex];
    
    insurances.push(generateInsuranceInstance(template, startIndex + i));
  }
  
  return insurances;
}

/**
 * Hook helper para generar seguros con scroll infinito
 */
export class InsuranceGenerator {
  private currentIndex: number = 0;
  private readonly batchSize: number;

  constructor(batchSize: number = 20) {
    this.batchSize = batchSize;
  }

  /**
   * Genera el siguiente batch de seguros
   */
  generateNext(): Insurance[] {
    const batch = generateInsurances(this.batchSize, this.currentIndex);
    this.currentIndex += this.batchSize;
    return batch;
  }

  /**
   * Reinicia el generador
   */
  reset(): void {
    this.currentIndex = 0;
  }

  /**
   * Obtiene el índice actual
   */
  getCurrentIndex(): number {
    return this.currentIndex;
  }
}
