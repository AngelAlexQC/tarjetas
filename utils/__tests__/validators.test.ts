/**
 * Tests for validators utility
 *
 * Verifica que las validaciones de seguridad funcionen correctamente
 */

import {
  getPasswordRequirements,
  isValidEmail,
  isValidPassword,
  isValidPhone,
} from '../validators';
import { AUTH_CONFIG } from '@/constants/security';

describe('validators', () => {
  describe('isValidEmail', () => {
    it('should accept valid emails', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.org',
        'user+tag@domain.co.uk',
        'firstname.lastname@company.com',
      ];

      validEmails.forEach((email) => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    it('should reject invalid emails', () => {
      const invalidEmails = [
        'invalid',
        '@domain.com',
        'user@',
        'user@.com',
        '',
        '   ',
      ];

      invalidEmails.forEach((email) => {
        expect(isValidEmail(email)).toBe(false);
      });
    });

    it('should trim whitespace', () => {
      expect(isValidEmail('  test@example.com  ')).toBe(true);
    });
  });

  describe('isValidPassword', () => {
    it('should accept valid passwords meeting all requirements', () => {
      const validPasswords = [
        'Password1!',
        'MyP@ssw0rd',
        'Secure#Pass123',
        'C0mpl3x!Pass',
      ];

      validPasswords.forEach((password) => {
        expect(isValidPassword(password)).toBe(true);
      });
    });

    it('should reject passwords shorter than minimum length', () => {
      expect(isValidPassword('Pass1!')).toBe(false);
      expect(isValidPassword('Ab1!')).toBe(false);
    });

    it('should reject passwords without uppercase', () => {
      expect(isValidPassword('password1!')).toBe(false);
    });

    it('should reject passwords without lowercase', () => {
      expect(isValidPassword('PASSWORD1!')).toBe(false);
    });

    it('should reject passwords without numbers', () => {
      expect(isValidPassword('Password!')).toBe(false);
    });

    it('should reject passwords without special characters', () => {
      expect(isValidPassword('Password1')).toBe(false);
    });

    it('should use AUTH_CONFIG.PASSWORD_MIN_LENGTH', () => {
      // Verificar que usa la constante correcta
      const minLength = AUTH_CONFIG.PASSWORD_MIN_LENGTH; // 8
      
      // Password con exactamente minLength caracteres y todos los requisitos
      const validPassword = 'Passwo1!'; // 8 chars
      expect(validPassword.length).toBe(minLength);
      expect(isValidPassword(validPassword)).toBe(true);
      
      // Password con minLength - 1 caracteres
      const shortPassword = 'Passw1!'; // 7 chars
      expect(shortPassword.length).toBe(minLength - 1);
      expect(isValidPassword(shortPassword)).toBe(false);
    });
  });

  describe('getPasswordRequirements', () => {
    it('should return all requirements as false for empty string', () => {
      const result = getPasswordRequirements('');
      
      expect(result.minLength).toBe(false);
      expect(result.hasUpperCase).toBe(false);
      expect(result.hasLowerCase).toBe(false);
      expect(result.hasNumber).toBe(false);
      expect(result.hasSpecialChar).toBe(false);
      expect(result.isValid).toBe(false);
    });

    it('should return correct requirements for partial password', () => {
      const result = getPasswordRequirements('password');
      
      expect(result.minLength).toBe(true);
      expect(result.hasLowerCase).toBe(true);
      expect(result.hasUpperCase).toBe(false);
      expect(result.hasNumber).toBe(false);
      expect(result.hasSpecialChar).toBe(false);
      expect(result.isValid).toBe(false);
    });

    it('should return all requirements as true for valid password', () => {
      const result = getPasswordRequirements('Password1!');
      
      expect(result.minLength).toBe(true);
      expect(result.hasUpperCase).toBe(true);
      expect(result.hasLowerCase).toBe(true);
      expect(result.hasNumber).toBe(true);
      expect(result.hasSpecialChar).toBe(true);
      expect(result.isValid).toBe(true);
    });

    it('should accept various special characters', () => {
      const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '+', '='];
      
      specialChars.forEach((char) => {
        const password = `Passw0rd${char}`;
        const result = getPasswordRequirements(password);
        expect(result.hasSpecialChar).toBe(true);
      });
    });
  });

  describe('isValidPhone', () => {
    it('should accept valid phone numbers', () => {
      const validPhones = [
        '1234567890',
        '+1234567890',
        '+11234567890123',
        '12 34 56 78 90',
      ];

      validPhones.forEach((phone) => {
        expect(isValidPhone(phone)).toBe(true);
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidPhones = [
        '123456789', // Too short
        'abcdefghij', // Letters
        '', // Empty
        '123', // Too short
      ];

      invalidPhones.forEach((phone) => {
        expect(isValidPhone(phone)).toBe(false);
      });
    });

    it('should ignore spaces in phone number', () => {
      expect(isValidPhone('123 456 7890')).toBe(true);
    });
  });

  describe('security: password validation consistency', () => {
    it('should have consistent validation with AUTH_CONFIG', () => {
      // Este test verifica que validators.ts usa las mismas constantes
      // que auth.schema.ts para mantener consistencia
      const minLength = AUTH_CONFIG.PASSWORD_MIN_LENGTH; // 8
      
      // Password válido con exactamente el mínimo
      const validPassword = 'Passwo1!';
      expect(validPassword.length).toBe(minLength);
      expect(isValidPassword(validPassword)).toBe(true);
      
      // Password inválido por ser muy corto
      const shortPassword = 'Passw1!';
      expect(shortPassword.length).toBe(minLength - 1);
      expect(isValidPassword(shortPassword)).toBe(false);
    });
  });
});
