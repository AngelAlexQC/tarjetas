/**
 * SSL Pinning Configuration
 * 
 * Configuración de certificados SSL para Certificate Pinning.
 * 
 * SEGURIDAD CRÍTICA (OWASP M5 - Insecure Communication):
 * - Protege contra ataques Man-in-the-Middle (MitM)
 * - Valida que el servidor es quien dice ser
 * - Previene intercepción de tráfico con certificados falsos
 * 
 * IMPORTANTE:
 * - Actualizar certificados ANTES de que expiren
 * - Usar múltiples pins como backup
 * - Monitorear fechas de expiración
 * 
 * @see https://owasp.org/www-community/controls/Certificate_and_Public_Key_Pinning
 */

/**
 * Tipos de pinning soportados
 */
export type PinningType = 'certificate' | 'public-key' | 'subject-public-key-info';

/**
 * Configuración de un certificado pinneado
 */
export interface CertificatePin {
  /** Hostname del servidor (ej: 'api.tudominio.com') */
  hostname: string;
  
  /** SHA-256 hash del certificado o public key (Base64) */
  pins: string[];
  
  /** Tipo de pinning (recomendado: 'public-key') */
  type: PinningType;
  
  /** Incluir subdominios */
  includeSubdomains?: boolean;
  
  /** Fecha de expiración del certificado */
  expirationDate?: string; // ISO 8601
}

/**
 * Configuración de SSL Pinning
 * 
 * NOTA IMPORTANTE PARA EXPO:
 * - Expo Managed Workflow NO soporta SSL Pinning nativo por defecto
 * - Se requiere uno de los siguientes enfoques:
 * 
 * 1. Development Build con expo-dev-client (RECOMENDADO)
 *    - Permite usar plugins nativos
 *    - Mantiene la mayoría de beneficios de Expo
 * 
 * 2. Expo Bare Workflow
 *    - Acceso completo a código nativo
 *    - Usar react-native-ssl-pinning
 * 
 * 3. Proxy con validación de certificados
 *    - Implementar en el backend
 *    - No requiere cambios en el cliente móvil
 * 
 * 4. EAS Build con configuración nativa
 *    - Network Security Config (Android)
 *    - App Transport Security (iOS)
 */
export const SSL_PINNING_CONFIG: CertificatePin[] = [
  // PRODUCCIÓN: Reemplazar con tus certificados reales
  // Ejemplo para tu API de producción
  {
    hostname: 'api.tudominio.com',
    // Obtener el pin con: openssl s_client -connect api.tudominio.com:443 | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64
    pins: [
      'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=', // Pin principal
      'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=', // Pin de backup
    ],
    type: 'public-key',
    includeSubdomains: true,
    expirationDate: '2026-12-31T23:59:59Z',
  },
];

/**
 * Dominios que deben usar HTTPS (no permitir HTTP)
 */
export const HTTPS_ONLY_DOMAINS = [
  'api.tudominio.com',
  '*.tudominio.com', // Subdominios
];

/**
 * Dominios excluidos del pinning (solo para desarrollo)
 */
export const PINNING_EXEMPT_DOMAINS = __DEV__ ? [
  'localhost',
  '127.0.0.1',
  '10.0.2.2', // Android emulator
] : [];

/**
 * Configuración de validación de certificados
 */
export const CERTIFICATE_VALIDATION_CONFIG = {
  /** Verificar cadena de certificados completa */
  validateCertificateChain: true,
  
  /** Verificar fecha de expiración */
  checkExpiration: true,
  
  /** Verificar revocación del certificado (OCSP) */
  checkRevocation: !__DEV__, // Solo en producción por performance
  
  /** Timeout para validación OCSP (ms) */
  ocspTimeout: 5000,
  
  /** Permitir certificados autofirmados (SOLO desarrollo) */
  allowSelfSigned: __DEV__,
  
  /** Nivel de log de errores SSL */
  logLevel: __DEV__ ? 'verbose' : 'error',
};

/**
 * Genera los pins SHA-256 desde certificados
 * 
 * USO:
 * 1. Descargar certificado: openssl s_client -connect api.tudominio.com:443 -showcerts
 * 2. Extraer public key: openssl x509 -in cert.pem -pubkey -noout
 * 3. Generar pin: openssl pkey -pubin -in pubkey.pem -outform der | openssl dgst -sha256 -binary | openssl enc -base64
 */
export function generateCertificatePin(certificatePem: string): string {
  // Esta función requiere implementación nativa
  // En producción, generar los pins offline y hardcodearlos arriba
  throw new Error('Generate pins offline using OpenSSL. See documentation in comments.');
}

/**
 * Valida si un hostname debe usar pinning
 */
export function shouldUsePinning(hostname: string): boolean {
  if (!hostname) return false;
  
  // Excluir dominios de desarrollo
  if (PINNING_EXEMPT_DOMAINS.some(domain => hostname.includes(domain))) {
    return false;
  }
  
  // Verificar si está en la lista de configuración
  return SSL_PINNING_CONFIG.some(config => {
    if (config.includeSubdomains) {
      return hostname.endsWith(config.hostname) || hostname === config.hostname;
    }
    return hostname === config.hostname;
  });
}

/**
 * Obtiene la configuración de pinning para un hostname
 */
export function getPinningConfig(hostname: string): CertificatePin | undefined {
  return SSL_PINNING_CONFIG.find(config => {
    if (config.includeSubdomains) {
      return hostname.endsWith(config.hostname) || hostname === config.hostname;
    }
    return hostname === config.hostname;
  });
}

/**
 * Verifica si los certificados están próximos a expirar
 */
export function checkCertificateExpiration(): {
  hostname: string;
  daysUntilExpiration: number;
  expired: boolean;
}[] {
  const now = new Date();
  
  return SSL_PINNING_CONFIG
    .filter(config => config.expirationDate)
    .map(config => {
      const expirationDate = new Date(config.expirationDate!);
      const daysUntilExpiration = Math.floor(
        (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      return {
        hostname: config.hostname,
        daysUntilExpiration,
        expired: daysUntilExpiration < 0,
      };
    });
}
