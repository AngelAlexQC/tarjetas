/**
 * Utilidades para formateo de fechas
 * Usa Intl.DateTimeFormat y Intl.RelativeTimeFormat nativos
 */

import { loggers } from '@/utils/logger';

const log = loggers.formatter;

export interface DateFormatOptions {
  locale?: string;
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
}

/**
 * Formatea una fecha de manera absoluta
 * @param date - Fecha a formatear
 * @param options - Opciones de formateo
 * @returns String formateado (ej: "15 Nov 2025")
 */
export const formatDate = (
  date: Date | string | number,
  options: DateFormatOptions = {}
): string => {
  const {
    locale = 'es-ES',
    dateStyle = 'medium',
  } = options;

  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' 
      ? new Date(date) 
      : date;

    const formatter = new Intl.DateTimeFormat(locale, {
      dateStyle,
    });

    return formatter.format(dateObj);
  } catch (error) {
    log.warn('Error formateando fecha:', error);
    return 'Fecha inválida';
  }
};

/**
 * Formatea una fecha de vencimiento para tarjeta (MM/AA)
 * @param date - Fecha a formatear (puede ser Date, string ISO, o formato "MM/YY")
 * @param _locale - Locale para el formateo (reservado para uso futuro)
 * @returns String formateado (ej: "12/25")
 */
export const formatCardExpiry = (
  date: Date | string,
  _locale: string = 'es-ES'
): string => {
  try {
    // Si ya está en formato MM/YY o MM/YYYY, devolverlo tal cual
    if (typeof date === 'string') {
      // Verificar si ya tiene el formato correcto MM/YY
      const mmyyPattern = /^\d{2}\/\d{2}$/;
      if (mmyyPattern.test(date)) {
        return date;
      }
      
      // Verificar si tiene formato MM/YYYY
      const mmyyyyPattern = /^\d{2}\/\d{4}$/;
      if (mmyyyyPattern.test(date)) {
        const [month, year] = date.split('/');
        return `${month}/${year.slice(-2)}`;
      }
    }
    
    // Si es una fecha, convertirla
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Verificar si la fecha es válida
    if (isNaN(dateObj.getTime())) {
      log.warn('Fecha inválida recibida:', date);
      return '--/--';
    }
    
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = String(dateObj.getFullYear()).slice(-2);
    return `${month}/${year}`;
  } catch (error) {
    log.warn('Error formateando fecha de vencimiento:', error);
    return '--/--';
  }
};

/**
 * Formatea fecha con estilo compacto y relativo (ej: "En 12 días", "Vence el 1 Dic")
 * @param date - Fecha a formatear
 * @param locale - Locale para el formateo
 * @returns String formateado
 */
export const formatPaymentDueDate = (
  date: Date | string,
  locale: string = 'es-ES'
): { relative: string; absolute: string } => {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    const diffTime = dateObj.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Formato relativo
    let relative: string;
    if (diffDays < 0) {
      relative = 'Vencido';
    } else if (diffDays === 0) {
      relative = 'Vence hoy';
    } else if (diffDays === 1) {
      relative = 'Vence mañana';
    } else if (diffDays <= 7) {
      relative = `En ${diffDays} días`;
    } else if (diffDays <= 14) {
      relative = `En ${diffDays} días`;
    } else {
      relative = `En ${diffDays} días`;
    }

    // Formato absoluto compacto
    const formatter = new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
    });
    const absolute = `Vence el ${formatter.format(dateObj)}`;

    return { relative, absolute };
  } catch (error) {
    log.warn('Error formateando fecha de pago:', error);
    return { relative: 'Fecha inválida', absolute: 'Fecha inválida' };
  }
};

/**
 * Formatea una fecha con hora
 * @param date - Fecha a formatear
 * @param options - Opciones de formateo
 * @returns String formateado (ej: "15 Nov 2025, 3:45 PM")
 */
export const formatDateTime = (
  date: Date | string | number,
  options: DateFormatOptions = {}
): string => {
  const {
    locale = 'es-ES',
    dateStyle = 'medium',
    timeStyle = 'short',
  } = options;

  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' 
      ? new Date(date) 
      : date;

    const formatter = new Intl.DateTimeFormat(locale, {
      dateStyle,
      timeStyle,
    });

    return formatter.format(dateObj);
  } catch (error) {
    log.warn('Error formateando fecha y hora:', error);
    return 'Fecha inválida';
  }
};

/**
 * Helper: Get relative time text based on unit and value
 */
const getRelativeText = (
  value: number,
  unit: 'day' | 'hour' | 'minute' | 'now',
  isPast: boolean,
  isSpanish: boolean
): string => {
  if (unit === 'now') {
    return isSpanish ? 'ahora' : 'now';
  }

  if (unit === 'day' && value === 1) {
    return isPast 
      ? (isSpanish ? 'ayer' : 'yesterday')
      : (isSpanish ? 'mañana' : 'tomorrow');
  }

  const units: Record<string, { es: string; en: string; spaced: boolean }> = {
    day: { es: 'días', en: 'days', spaced: true },
    hour: { es: 'h', en: 'h', spaced: false },
    minute: { es: 'm', en: 'm', spaced: false },
  };

  const unit_info = units[unit];
  const space = unit_info.spaced ? ' ' : '';
  if (isPast) {
    return isSpanish ? `hace ${value}${space}${unit_info.es}` : `${value} ${unit_info.en} ago`;
  }
  return isSpanish ? `en ${value}${space}${unit_info.es}` : `in ${value} ${unit_info.en}`;
};

/**
 * Formatea una fecha de manera relativa (hace X tiempo)
 * @param date - Fecha a formatear
 * @param locale - Locale a usar
 * @returns String relativo (ej: "Hace 2 horas", "En 5 días")
 */
export const formatRelativeDate = (
  date: Date | string | number,
  locale: string = 'es-ES'
): string => {
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' 
      ? new Date(date) 
      : date;

    const now = new Date();
    const diffInSeconds = Math.floor((dateObj.getTime() - now.getTime()) / 1000);
    const isPast = diffInSeconds < 0;
    const isSpanish = locale.startsWith('es');

    const absSeconds = Math.abs(diffInSeconds);
    const absMinutes = Math.floor(absSeconds / 60);
    const absHours = Math.floor(absMinutes / 60);
    const absDays = Math.floor(absHours / 24);

    // Más de 7 días: mostrar fecha absoluta
    if (absDays >= 7) {
      return formatDate(dateObj, { locale, dateStyle: 'medium' });
    }
    
    // Determinar unidad apropiada
    if (absDays >= 1) {
      return getRelativeText(absDays, 'day', isPast, isSpanish);
    }
    if (absHours >= 1) {
      return getRelativeText(absHours, 'hour', isPast, isSpanish);
    }
    if (absMinutes >= 1) {
      return getRelativeText(absMinutes, 'minute', isPast, isSpanish);
    }
    return getRelativeText(0, 'now', isPast, isSpanish);
  } catch (error) {
    log.warn('Error formateando fecha relativa:', error);
    return 'Fecha inválida';
  }
};

/**
 * Formatea una fecha de vencimiento con contexto
 * @param date - Fecha de vencimiento
 * @param locale - Locale a usar
 * @returns String con contexto (ej: "Vence en 5 días", "Venció hace 2 días")
 */
export const formatDueDate = (
  date: Date | string | number,
  locale: string = 'es-ES'
): string => {
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' 
      ? new Date(date) 
      : date;

    const now = new Date();
    const diffInMs = dateObj.getTime() - now.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays > 0) {
      // Futuro
      return `Vence ${formatRelativeDate(dateObj, locale)}`.replace('en ', 'en ');
    } else if (diffInDays === 0) {
      // Hoy
      return 'Vence hoy';
    } else {
      // Pasado
      return `Venció ${formatRelativeDate(dateObj, locale)}`.replace('hace ', 'hace ');
    }
  } catch (error) {
    log.warn('Error formateando fecha de vencimiento:', error);
    return 'Fecha inválida';
  }
};

/**
 * Calcula días hasta una fecha
 * @param date - Fecha objetivo
 * @returns Número de días (negativo si ya pasó)
 */
export const daysUntil = (date: Date | string | number): number => {
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' 
      ? new Date(date) 
      : date;

    const now = new Date();
    const diffInMs = dateObj.getTime() - now.getTime();
    return Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  } catch (error) {
    log.warn('Error calculando días hasta fecha:', error);
    return 0;
  }
};

/**
 * Verifica si una fecha está próxima (menos de 7 días)
 * @param date - Fecha a verificar
 * @returns true si está próxima
 */
export const isDateSoon = (date: Date | string | number): boolean => {
  const days = daysUntil(date);
  return days >= 0 && days <= 7;
};

/**
 * Verifica si una fecha está vencida
 * @param date - Fecha a verificar
 * @returns true si está vencida
 */
export const isDateOverdue = (date: Date | string | number): boolean => {
  return daysUntil(date) < 0;
};
