/**
 * Utilidades para formateo de fechas
 * Usa Intl.DateTimeFormat y Intl.RelativeTimeFormat nativos
 */

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
    console.warn('Error formateando fecha:', error);
    return 'Fecha inválida';
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
    console.warn('Error formateando fecha y hora:', error);
    return 'Fecha inválida';
  }
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
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    // Determinar la unidad más apropiada
    if (Math.abs(diffInDays) >= 7) {
      // Más de 7 días: mostrar fecha absoluta
      return formatDate(dateObj, { locale, dateStyle: 'medium' });
    } else if (Math.abs(diffInDays) >= 1) {
      return rtf.format(diffInDays, 'day');
    } else if (Math.abs(diffInHours) >= 1) {
      return rtf.format(diffInHours, 'hour');
    } else if (Math.abs(diffInMinutes) >= 1) {
      return rtf.format(diffInMinutes, 'minute');
    } else {
      return rtf.format(diffInSeconds, 'second');
    }
  } catch (error) {
    console.warn('Error formateando fecha relativa:', error);
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
    console.warn('Error formateando fecha de vencimiento:', error);
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
    console.warn('Error calculando días hasta fecha:', error);
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
