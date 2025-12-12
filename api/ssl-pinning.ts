/**
 * SSL Pinning Implementation
 * 
 * Implementación de Certificate Pinning para proteger comunicaciones.
 * 
 * IMPORTANTE - LIMITACIONES DE EXPO:
 * ==========================================
 * Expo Managed Workflow NO soporta SSL Pinning nativo directamente.
 * 
 * SOLUCIONES DISPONIBLES:
 * 
 * 1. ✅ RECOMENDADO: Development Build + Config Plugin
 *    - Usar expo-dev-client
 *    - Configurar Network Security Config (Android)
 *    - Configurar App Transport Security (iOS)
 *    - Mantiene beneficios de Expo
 * 
 * 2. ⚠️ ALTERNATIVA: Bare Workflow
 *    - Eject y usar react-native-ssl-pinning
 *    - Control total pero pierdes simplicidad de Expo
 * 
 * 3. 🔧 INTERMEDIA: Validación en Backend
 *    - Proxy que valida certificados
 *    - Cliente móvil conecta a proxy seguro
 * 
 * Este archivo proporciona:
 * - Estructura para implementar pinning cuando uses dev build
 * - Validaciones de configuración
 * - Helpers para debugging
 * - Documentación de implementación
 */

import { Platform } from 'react-native';
import { loggers } from '@/utils/logger';
import {
  CERTIFICATE_VALIDATION_CONFIG,
  getPinningConfig,
  shouldUsePinning,
  SSL_PINNING_CONFIG,
  type CertificatePin,
} from './ssl-pinning.config';

const log = loggers.security;

/**
 * Resultado de validación de certificado
 */
export interface CertificateValidationResult {
  valid: boolean;
  hostname: string;
  error?: string;
  details?: {
    certificateChainValid?: boolean;
    pinMatched?: boolean;
    notExpired?: boolean;
    notRevoked?: boolean;
  };
}

/**
 * Manager de SSL Pinning
 * 
 * NOTA: Esta implementación es un placeholder que:
 * 1. Valida la configuración
 * 2. Proporciona estructura para implementación nativa
 * 3. Facilita debugging
 * 
 * Para producción DEBES:
 * - Usar expo-dev-client
 * - Configurar app.json con plugins nativos
 * - Implementar validación nativa en iOS/Android
 */
export class SSLPinningManager {
  private static instance: SSLPinningManager;
  private initialized = false;
  private validationCache = new Map<string, CertificateValidationResult>();

  private constructor() {}

  static getInstance(): SSLPinningManager {
    if (!SSLPinningManager.instance) {
      SSLPinningManager.instance = new SSLPinningManager();
    }
    return SSLPinningManager.instance;
  }

  /**
   * Inicializa el sistema de SSL Pinning
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      log.warn('SSL Pinning already initialized');
      return;
    }

    log.info('Initializing SSL Pinning...');

    // Validar configuración
    this.validateConfiguration();

    // Verificar expiración de certificados
    this.checkCertificateExpirations();

    // En desarrollo, solo logging
    if (__DEV__) {
      this.logDevelopmentWarning();
    }

    this.initialized = true;
    log.info('SSL Pinning initialized successfully');
  }

  /**
   * Valida la configuración de SSL Pinning
   */
  private validateConfiguration(): void {
    if (SSL_PINNING_CONFIG.length === 0) {
      log.error('❌ NO SSL PINS CONFIGURED - App is vulnerable to MitM attacks!');
      if (!__DEV__) {
        throw new Error('SSL Pinning configuration is required in production');
      }
    }

    // Validar cada configuración
    SSL_PINNING_CONFIG.forEach((config, index) => {
      if (!config.hostname) {
        throw new Error(`SSL Pin config at index ${index} missing hostname`);
      }
      if (!config.pins || config.pins.length === 0) {
        throw new Error(`SSL Pin config for ${config.hostname} has no pins`);
      }
      if (config.pins.some(pin => pin.length < 40)) {
        log.warn(`SSL Pin for ${config.hostname} might be invalid (too short)`);
      }
    });

    log.info(`✅ SSL Pinning config validated: ${SSL_PINNING_CONFIG.length} domains configured`);
  }

  /**
   * Verifica fechas de expiración de certificados
   */
  private checkCertificateExpirations(): void {
    const now = new Date();
    const WARNING_DAYS = 30;

    SSL_PINNING_CONFIG.forEach(config => {
      if (!config.expirationDate) {
        log.warn(`Certificate for ${config.hostname} has no expiration date set`);
        return;
      }

      const expiration = new Date(config.expirationDate);
      const daysUntilExpiration = Math.floor(
        (expiration.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntilExpiration < 0) {
        log.error(`🚨 Certificate for ${config.hostname} EXPIRED ${Math.abs(daysUntilExpiration)} days ago!`);
      } else if (daysUntilExpiration < WARNING_DAYS) {
        log.warn(`⚠️  Certificate for ${config.hostname} expires in ${daysUntilExpiration} days`);
      } else {
        log.info(`✅ Certificate for ${config.hostname} valid for ${daysUntilExpiration} days`);
      }
    });
  }

  /**
   * Advertencia de desarrollo
   */
  private logDevelopmentWarning(): void {
    log.warn('');
    log.warn('═══════════════════════════════════════════════════════════');
    log.warn('⚠️  SSL PINNING IN DEVELOPMENT MODE');
    log.warn('═══════════════════════════════════════════════════════════');
    log.warn('SSL Pinning NO está activo en modo desarrollo.');
    log.warn('Para aplicaciones financieras en PRODUCCIÓN:');
    log.warn('');
    log.warn('1. Usar expo-dev-client (npx expo install expo-dev-client)');
    log.warn('2. Configurar app.json con Network Security Config');
    log.warn('3. Generar pins de tus certificados SSL');
    log.warn('4. Actualizar ssl-pinning.config.ts con pins reales');
    log.warn('');
    log.warn('Documentación: api/ssl-pinning.implementation.md');
    log.warn('═══════════════════════════════════════════════════════════');
    log.warn('');
  }

  /**
   * Valida un certificado (placeholder para implementación nativa)
   * 
   * NOTA: Esta validación es simulada. En producción con dev build,
   * la validación real ocurre a nivel nativo (iOS/Android)
   */
  async validateCertificate(
    hostname: string,
    certificate: string
  ): Promise<CertificateValidationResult> {
    // Verificar si está en caché
    const cached = this.validationCache.get(hostname);
    if (cached) {
      return cached;
    }

    log.info(`Validating certificate for ${hostname}...`);

    // En desarrollo, siempre válido
    if (__DEV__) {
      const result: CertificateValidationResult = {
        valid: true,
        hostname,
      };
      this.validationCache.set(hostname, result);
      return result;
    }

    // Verificar si debe usar pinning
    if (!shouldUsePinning(hostname)) {
      log.info(`${hostname} not configured for pinning`);
      const result: CertificateValidationResult = {
        valid: true,
        hostname,
      };
      this.validationCache.set(hostname, result);
      return result;
    }

    const config = getPinningConfig(hostname);
    if (!config) {
      log.error(`${hostname} requires pinning but no config found!`);
      return {
        valid: false,
        hostname,
        error: 'No SSL pinning configuration found',
      };
    }

    // IMPORTANTE: En producción, esta validación la hace el OS nativo
    // Esta es solo una verificación auxiliar
    log.warn(`Certificate validation for ${hostname} should be done at native level`);

    const result: CertificateValidationResult = {
      valid: true, // Placeholder
      hostname,
      details: {
        certificateChainValid: true,
        pinMatched: true,
        notExpired: true,
        notRevoked: true,
      },
    };

    this.validationCache.set(hostname, result);
    return result;
  }

  /**
   * Limpia la caché de validación
   */
  clearCache(): void {
    this.validationCache.clear();
    log.info('SSL Pinning validation cache cleared');
  }

  /**
   * Obtiene estadísticas de SSL Pinning
   */
  getStats(): {
    initialized: boolean;
    configuredDomains: number;
    cachedValidations: number;
    platform: string;
    developmentMode: boolean;
  } {
    return {
      initialized: this.initialized,
      configuredDomains: SSL_PINNING_CONFIG.length,
      cachedValidations: this.validationCache.size,
      platform: Platform.OS,
      developmentMode: __DEV__,
    };
  }

  /**
   * Exporta configuración para debugging
   */
  exportConfig(): {
    pins: CertificatePin[];
    validation: typeof CERTIFICATE_VALIDATION_CONFIG;
    stats: ReturnType<typeof this.getStats>;
  } {
    return {
      pins: SSL_PINNING_CONFIG,
      validation: CERTIFICATE_VALIDATION_CONFIG,
      stats: this.getStats(),
    };
  }
}

/**
 * Instancia singleton
 */
export const sslPinningManager = SSLPinningManager.getInstance();

/**
 * Hook para inicialización en App startup
 */
export async function initializeSSLPinning(): Promise<void> {
  try {
    await sslPinningManager.initialize();
  } catch (error) {
    log.error('Failed to initialize SSL Pinning:', error);
    // En producción, esto es crítico
    if (!__DEV__) {
      throw error;
    }
  }
}
