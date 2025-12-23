/**
 * SSL Pinning Tests
 */

import {
  checkCertificateExpiration,
  getPinningConfig,
  shouldUsePinning,
  SSL_PINNING_CONFIG,
  type CertificatePin,
} from '../ssl-pinning.config';

describe('SSL Pinning Configuration', () => {
  describe('shouldUsePinning', () => {
    it('should return true for configured hostnames', () => {
      // Asumiendo que hay al menos una configuración
      if (SSL_PINNING_CONFIG.length > 0) {
        const hostname = SSL_PINNING_CONFIG[0].hostname;
        expect(shouldUsePinning(hostname)).toBe(true);
      }
    });

    it('should return false for localhost in development', () => {
      expect(shouldUsePinning('localhost')).toBe(false);
      expect(shouldUsePinning('127.0.0.1')).toBe(false);
    });

    it('should return false for unconfigured hostnames', () => {
      expect(shouldUsePinning('unknown.example.com')).toBe(false);
    });

    it('should handle empty hostname', () => {
      expect(shouldUsePinning('')).toBe(false);
    });

    it('should support subdomains when configured', () => {
      const configWithSubdomains: CertificatePin = {
        hostname: 'example.com',
        pins: ['test'],
        type: 'public-key',
        includeSubdomains: true,
      };

      // Mock temporalmente la configuración
      const originalConfig = [...SSL_PINNING_CONFIG];
      SSL_PINNING_CONFIG.length = 0;
      SSL_PINNING_CONFIG.push(configWithSubdomains);

      expect(shouldUsePinning('example.com')).toBe(true);
      expect(shouldUsePinning('api.example.com')).toBe(true);
      expect(shouldUsePinning('sub.api.example.com')).toBe(true);

      // Restaurar
      SSL_PINNING_CONFIG.length = 0;
      SSL_PINNING_CONFIG.push(...originalConfig);
    });
  });

  describe('getPinningConfig', () => {
    it('should return config for exact hostname match', () => {
      if (SSL_PINNING_CONFIG.length > 0) {
        const hostname = SSL_PINNING_CONFIG[0].hostname;
        const config = getPinningConfig(hostname);
        expect(config).toBeDefined();
        expect(config?.hostname).toBe(hostname);
      }
    });

    it('should return undefined for unconfigured hostname', () => {
      const config = getPinningConfig('unknown.example.com');
      expect(config).toBeUndefined();
    });

    it('should return config for subdomain when includeSubdomains is true', () => {
      const configWithSubdomains: CertificatePin = {
        hostname: 'example.com',
        pins: ['test'],
        type: 'public-key',
        includeSubdomains: true,
      };

      const originalConfig = [...SSL_PINNING_CONFIG];
      SSL_PINNING_CONFIG.length = 0;
      SSL_PINNING_CONFIG.push(configWithSubdomains);

      const config = getPinningConfig('api.example.com');
      expect(config).toBeDefined();
      expect(config?.hostname).toBe('example.com');

      SSL_PINNING_CONFIG.length = 0;
      SSL_PINNING_CONFIG.push(...originalConfig);
    });
  });

  describe('checkCertificateExpiration', () => {
    it('should return expiration info for certificates with dates', () => {
      const testConfig: CertificatePin = {
        hostname: 'test.example.com',
        pins: ['test'],
        type: 'public-key',
        expirationDate: '2026-12-31T23:59:59Z',
      };

      const originalConfig = [...SSL_PINNING_CONFIG];
      SSL_PINNING_CONFIG.length = 0;
      SSL_PINNING_CONFIG.push(testConfig);

      const results = checkCertificateExpiration();
      expect(results).toHaveLength(1);
      expect(results[0].hostname).toBe('test.example.com');
      expect(typeof results[0].daysUntilExpiration).toBe('number');
      expect(typeof results[0].expired).toBe('boolean');

      SSL_PINNING_CONFIG.length = 0;
      SSL_PINNING_CONFIG.push(...originalConfig);
    });

    it('should detect expired certificates', () => {
      const expiredConfig: CertificatePin = {
        hostname: 'expired.example.com',
        pins: ['test'],
        type: 'public-key',
        expirationDate: '2020-01-01T00:00:00Z', // En el pasado
      };

      const originalConfig = [...SSL_PINNING_CONFIG];
      SSL_PINNING_CONFIG.length = 0;
      SSL_PINNING_CONFIG.push(expiredConfig);

      const results = checkCertificateExpiration();
      expect(results).toHaveLength(1);
      expect(results[0].expired).toBe(true);
      expect(results[0].daysUntilExpiration).toBeLessThan(0);

      SSL_PINNING_CONFIG.length = 0;
      SSL_PINNING_CONFIG.push(...originalConfig);
    });

    it('should handle certificates without expiration dates', () => {
      const configWithoutDate: CertificatePin = {
        hostname: 'no-date.example.com',
        pins: ['test'],
        type: 'public-key',
      };

      const originalConfig = [...SSL_PINNING_CONFIG];
      SSL_PINNING_CONFIG.length = 0;
      SSL_PINNING_CONFIG.push(configWithoutDate);

      const results = checkCertificateExpiration();
      expect(results).toHaveLength(0); // No debe incluir configs sin fecha

      SSL_PINNING_CONFIG.length = 0;
      SSL_PINNING_CONFIG.push(...originalConfig);
    });
  });

  describe('SSL_PINNING_CONFIG validation', () => {
    it('should have valid configuration structure', () => {
      SSL_PINNING_CONFIG.forEach((config, _index) => {
        expect(config.hostname).toBeDefined();
        expect(typeof config.hostname).toBe('string');
        expect(config.hostname.length).toBeGreaterThan(0);
        
        expect(config.pins).toBeDefined();
        expect(Array.isArray(config.pins)).toBe(true);
        expect(config.pins.length).toBeGreaterThan(0);
        
        expect(config.type).toBeDefined();
        expect(['certificate', 'public-key', 'subject-public-key-info']).toContain(config.type);

        // Si tiene fecha de expiración, debe ser válida
        if (config.expirationDate) {
          const date = new Date(config.expirationDate);
          expect(date.toString()).not.toBe('Invalid Date');
        }
      });
    });

    it('should have pins with reasonable length', () => {
      SSL_PINNING_CONFIG.forEach(config => {
        config.pins.forEach(pin => {
          // SHA-256 Base64 debe tener al menos 40 caracteres
          expect(pin.length).toBeGreaterThanOrEqual(40);
        });
      });
    });

    it('should recommend having backup pins', () => {
      if (SSL_PINNING_CONFIG.length > 0) {
        // Al menos una config debe tener más de 1 pin (backup)
        const configsWithBackup = SSL_PINNING_CONFIG.filter(c => c.pins.length > 1);
        if (configsWithBackup.length === 0) {
          console.warn('⚠️  RECOMMENDATION: Add backup pins for certificate rotation');
        }
        // No falla el test, solo advierte
      }
    });
  });
});
