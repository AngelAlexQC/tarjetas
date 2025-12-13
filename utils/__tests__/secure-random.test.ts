/**
 * Tests para Secure Random Utilities
 */

import { generateSecureReceiptId, getSecureRandomFloat, getSecureRandomInRange, getSecureRandomInt } from '../secure-random';

// Mock de crypto.getRandomValues
const mockGetRandomValues = jest.fn();
global.crypto = {
  getRandomValues: mockGetRandomValues,
} as any;

describe('secure-random', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSecureRandomInt', () => {
    it('debe generar un número aleatorio entre 0 y max', () => {
      // Simular valor aleatorio medio (0x80000000)
      const mockBuffer = new Uint32Array([0x80000000]);
      mockGetRandomValues.mockImplementation((buffer: Uint32Array) => {
        buffer[0] = mockBuffer[0];
        return buffer;
      });

      const result = getSecureRandomInt(100);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(100);
      expect(Number.isInteger(result)).toBe(true);
    });

    it('debe lanzar error si max no es un entero positivo', () => {
      expect(() => getSecureRandomInt(0)).toThrow('max debe ser un entero positivo');
      expect(() => getSecureRandomInt(-5)).toThrow('max debe ser un entero positivo');
      expect(() => getSecureRandomInt(3.14)).toThrow('max debe ser un entero positivo');
    });

    it('debe usar crypto.getRandomValues', () => {
      const mockBuffer = new Uint32Array([0x12345678]);
      mockGetRandomValues.mockImplementation((buffer: Uint32Array) => {
        buffer[0] = mockBuffer[0];
        return buffer;
      });

      getSecureRandomInt(100);
      expect(mockGetRandomValues).toHaveBeenCalledTimes(1);
      expect(mockGetRandomValues).toHaveBeenCalledWith(expect.any(Uint32Array));
    });
  });

  describe('getSecureRandomInRange', () => {
    it('debe generar un número aleatorio en el rango [min, max)', () => {
      const mockBuffer = new Uint32Array([0x80000000]);
      mockGetRandomValues.mockImplementation((buffer: Uint32Array) => {
        buffer[0] = mockBuffer[0];
        return buffer;
      });

      const result = getSecureRandomInRange(50, 150);
      expect(result).toBeGreaterThanOrEqual(50);
      expect(result).toBeLessThan(150);
      expect(Number.isInteger(result)).toBe(true);
    });

    it('debe lanzar error si min >= max', () => {
      expect(() => getSecureRandomInRange(100, 50)).toThrow('min debe ser menor que max');
      expect(() => getSecureRandomInRange(100, 100)).toThrow('min debe ser menor que max');
    });
  });

  describe('getSecureRandomFloat', () => {
    it('debe generar un número flotante entre 0 y 1', () => {
      const mockBuffer = new Uint32Array([0x80000000]);
      mockGetRandomValues.mockImplementation((buffer: Uint32Array) => {
        buffer[0] = mockBuffer[0];
        return buffer;
      });

      const result = getSecureRandomFloat();
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThan(1);
      expect(typeof result).toBe('number');
    });

    it('debe retornar valores diferentes en llamadas sucesivas', () => {
      let callCount = 0;
      mockGetRandomValues.mockImplementation((buffer: Uint32Array) => {
        callCount++;
        buffer[0] = callCount === 1 ? 0x12345678 : 0x87654321;
        return buffer;
      });

      const result1 = getSecureRandomFloat();
      const result2 = getSecureRandomFloat();
      expect(result1).not.toBe(result2);
    });
  });

  describe('generateSecureReceiptId', () => {
    it('debe generar un ID único con el prefijo correcto', () => {
      const mockBuffer = new Uint32Array([123456]);
      mockGetRandomValues.mockImplementation((buffer: Uint32Array) => {
        buffer[0] = mockBuffer[0];
        return buffer;
      });

      const result = generateSecureReceiptId('PAY');
      expect(result).toMatch(/^PAY-[0-9a-z]+-\d{6}$/);
      expect(result.startsWith('PAY-')).toBe(true);
    });

    it('debe generar IDs diferentes en llamadas sucesivas', async () => {
      let callCount = 0;
      mockGetRandomValues.mockImplementation((buffer: Uint32Array) => {
        callCount++;
        buffer[0] = callCount * 100000;
        return buffer;
      });

      const id1 = generateSecureReceiptId('ADV');
      // Pequeña pausa para asegurar timestamp diferente
      await new Promise(resolve => setTimeout(resolve, 2));
      const id2 = generateSecureReceiptId('ADV');
      expect(id1).not.toBe(id2);
    });

    it('debe funcionar con diferentes prefijos', () => {
      const mockBuffer = new Uint32Array([123456]);
      mockGetRandomValues.mockImplementation((buffer: Uint32Array) => {
        buffer[0] = mockBuffer[0];
        return buffer;
      });

      const prefixes = ['ADV', 'PAY', 'DEF', 'ATM', 'TRV'];
      prefixes.forEach(prefix => {
        const id = generateSecureReceiptId(prefix);
        expect(id.startsWith(`${prefix}-`)).toBe(true);
      });
    });
  });

  describe('Seguridad', () => {
    it('no debe usar Math.random()', () => {
      const mathRandomSpy = jest.spyOn(Math, 'random');
      const mockBuffer = new Uint32Array([0x12345678]);
      mockGetRandomValues.mockImplementation((buffer: Uint32Array) => {
        buffer[0] = mockBuffer[0];
        return buffer;
      });

      getSecureRandomInt(100);
      getSecureRandomInRange(0, 100);
      getSecureRandomFloat();
      generateSecureReceiptId('TEST');

      expect(mathRandomSpy).not.toHaveBeenCalled();
      mathRandomSpy.mockRestore();
    });
  });
});
