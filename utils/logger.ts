/**
 * Logger Utility
 * 
 * Sistema de logging centralizado que solo muestra logs en desarrollo.
 * En producción, los logs se silencian automáticamente.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  /** Prefijo para identificar el módulo */
  prefix?: string;
  /** Si es true, muestra logs incluso en producción (usar con cuidado) */
  forceInProduction?: boolean;
}

class Logger {
  private prefix: string;
  private forceInProduction: boolean;

  constructor(options: LoggerOptions = {}) {
    this.prefix = options.prefix ? `[${options.prefix}]` : '';
    this.forceInProduction = options.forceInProduction ?? false;
  }

  private shouldLog(): boolean {
    return __DEV__ || this.forceInProduction;
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    return `${timestamp} ${this.prefix} ${message}`.trim();
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog()) {
      // eslint-disable-next-line no-console
      console.log(this.formatMessage('debug', message), ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog()) {
      // eslint-disable-next-line no-console
      console.log(this.formatMessage('info', message), ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog()) {
      console.warn(this.formatMessage('warn', message), ...args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog()) {
      console.error(this.formatMessage('error', message), ...args);
    }
  }
}

/**
 * Crea un logger con un prefijo específico para el módulo
 * @example
 * const logger = createLogger('AuthContext');
 * logger.info('Usuario autenticado');
 * // Output: "12:34:56 [AuthContext] Usuario autenticado"
 */
export function createLogger(prefix: string, options?: Omit<LoggerOptions, 'prefix'>): Logger {
  return new Logger({ prefix, ...options });
}

/**
 * Logger por defecto para uso general
 */
export const logger = new Logger();

/**
 * Loggers pre-configurados para módulos comunes
 */
export const loggers = {
  auth: createLogger('Auth'),
  cards: createLogger('Cards'),
  api: createLogger('API'),
  ui: createLogger('UI'),
  tour: createLogger('Tour'),
  theme: createLogger('Theme'),
  biometric: createLogger('Biometric'),
  formatter: createLogger('Formatter'),
};
