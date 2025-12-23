/**
 * Tests for error-sanitizer utility
 *
 * Verifica que los mensajes de error no expongan información sensible
 */

import {
  sanitizeAuthError,
  sanitizeRecoveryError,
  sanitizeRegisterError,
  sanitizeVerificationError,
} from '../error-sanitizer';
import { SANITIZED_ERROR_MESSAGES } from '@/constants/security';

describe('error-sanitizer', () => {
  describe('sanitizeAuthError', () => {
    it('should return generic message for credential errors', () => {
      const errors = [
        new Error('Invalid credentials'),
        new Error('Wrong password'),
        new Error('Username not found'),
        new Error('unauthorized access'),
        new Error('401 Unauthorized'),
      ];

      errors.forEach((error) => {
        expect(sanitizeAuthError(error)).toBe(SANITIZED_ERROR_MESSAGES.INVALID_CREDENTIALS);
      });
    });

    it('should return network error message for connection issues', () => {
      const errors = [
        new Error('Network request failed'),
        new Error('Connection refused'),
        new Error('Request timeout'),
        new Error('fetch failed'),
        new Error('ECONNREFUSED'),
      ];

      errors.forEach((error) => {
        expect(sanitizeAuthError(error)).toBe(SANITIZED_ERROR_MESSAGES.NETWORK_ERROR);
      });
    });

    it('should return server error message for server issues', () => {
      const errors = [
        new Error('Internal Server Error'),
        new Error('500 error'),
        new Error('502 Bad Gateway'),
        new Error('503 Service Unavailable'),
        new Error('504 Gateway Timeout'),
      ];

      errors.forEach((error) => {
        expect(sanitizeAuthError(error)).toBe(SANITIZED_ERROR_MESSAGES.SERVER_ERROR);
      });
    });

    it('should return rate limit message for too many requests', () => {
      const errors = [
        new Error('Rate limit exceeded'),
        new Error('Too many requests'),
        new Error('429 Too Many Requests'),
      ];

      errors.forEach((error) => {
        expect(sanitizeAuthError(error)).toBe(SANITIZED_ERROR_MESSAGES.RATE_LIMITED);
      });
    });

    it('should return default message for unknown errors', () => {
      const error = new Error('Some random error');
      expect(sanitizeAuthError(error)).toBe(SANITIZED_ERROR_MESSAGES.GENERIC_LOGIN_ERROR);
    });

    it('should handle non-Error objects', () => {
      expect(sanitizeAuthError('string error')).toBe(SANITIZED_ERROR_MESSAGES.GENERIC_LOGIN_ERROR);
      expect(sanitizeAuthError(null)).toBe(SANITIZED_ERROR_MESSAGES.GENERIC_LOGIN_ERROR);
      expect(sanitizeAuthError(undefined)).toBe(SANITIZED_ERROR_MESSAGES.GENERIC_LOGIN_ERROR);
      expect(sanitizeAuthError({ message: 'object' })).toBe(SANITIZED_ERROR_MESSAGES.GENERIC_LOGIN_ERROR);
    });

    it('should accept custom default message', () => {
      const customMessage = 'Custom error message';
      expect(sanitizeAuthError(new Error('unknown'), customMessage)).toBe(customMessage);
    });
  });

  describe('sanitizeRegisterError', () => {
    it('should return duplicate user message for existing accounts', () => {
      const errors = [
        new Error('User already exists'),
        new Error('Duplicate entry'),
        new Error('Email already registered'),
        new Error('409 Conflict'),
      ];

      errors.forEach((error) => {
        expect(sanitizeRegisterError(error)).toBe('Este usuario o email ya está registrado');
      });
    });

    it('should return validation message for invalid data', () => {
      const errors = [
        new Error('Validation failed'),
        new Error('Invalid email format'),
      ];

      errors.forEach((error) => {
        expect(sanitizeRegisterError(error)).toBe('Por favor verifica los datos ingresados');
      });
    });

    it('should fallback to auth error sanitization for other errors', () => {
      const error = new Error('Network error');
      expect(sanitizeRegisterError(error)).toBe(SANITIZED_ERROR_MESSAGES.NETWORK_ERROR);
    });
  });

  describe('sanitizeVerificationError', () => {
    it('should return expired message for expired codes', () => {
      const errors = [
        new Error('Code expired'),
        new Error('Verification code has expired'),
      ];

      errors.forEach((error) => {
        expect(sanitizeVerificationError(error)).toBe('El código ha expirado. Solicita uno nuevo.');
      });
    });

    it('should return incorrect code message for wrong codes', () => {
      const errors = [
        new Error('Incorrect code'),
        new Error('Invalid verification code'),
        new Error('Wrong code entered'),
      ];

      errors.forEach((error) => {
        expect(sanitizeVerificationError(error)).toBe('Código incorrecto. Verifica e intenta de nuevo.');
      });
    });
  });

  describe('sanitizeRecoveryError', () => {
    it('should return generic message for not found errors (security)', () => {
      // SEGURIDAD: No revelar si el email existe en el sistema
      const errors = [
        new Error('User not found'),
        new Error('Email no existe'),
        new Error('404 Not Found'),
      ];

      errors.forEach((error) => {
        expect(sanitizeRecoveryError(error)).toBe(
          'Si el email existe en nuestro sistema, recibirás un código de recuperación.'
        );
      });
    });
  });

  describe('security: no sensitive data exposure', () => {
    it('should never include stack traces in messages', () => {
      const errorWithStack = new Error('Password mismatch');
      errorWithStack.stack = 'Error at auth.js:123\n    at login.ts:456';

      const result = sanitizeAuthError(errorWithStack);
      expect(result).not.toContain('auth.js');
      expect(result).not.toContain('login.ts');
      expect(result).not.toContain('456');
    });

    it('should never include technical details', () => {
      const technicalError = new Error(
        'SQLSTATE[42S02]: Base table or column not found: 1146 Table users does not exist'
      );

      const result = sanitizeAuthError(technicalError);
      expect(result).not.toContain('SQLSTATE');
      expect(result).not.toContain('Table');
      expect(result).not.toContain('users');
    });

    it('should never reveal internal server paths', () => {
      const pathError = new Error('Error at /var/www/app/controllers/AuthController.php:89');

      const result = sanitizeAuthError(pathError);
      expect(result).not.toContain('/var');
      expect(result).not.toContain('AuthController');
      expect(result).not.toContain('.php');
    });
  });
});
