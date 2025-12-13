/**
 * Secure Random Utilities
 * 
 * Utilidades para generar números aleatorios criptográficamente seguros
 * usando la API Web Crypto disponible en React Native.
 */

/**
 * Genera un número entero aleatorio criptográficamente seguro entre 0 y max (exclusivo)
 * @param max - Valor máximo (exclusivo)
 * @returns Número aleatorio seguro entre 0 y max
 */
export const getSecureRandomInt = (max: number): number => {
  if (max <= 0 || !Number.isInteger(max)) {
    throw new Error('max debe ser un entero positivo');
  }

  // Usar crypto.getRandomValues disponible en React Native
  const randomBuffer = new Uint32Array(1);
  crypto.getRandomValues(randomBuffer);
  
  // Convertir a número en rango [0, max)
  return Math.floor((randomBuffer[0] / 0x100000000) * max);
};

/**
 * Genera un número entero aleatorio criptográficamente seguro en un rango [min, max)
 * @param min - Valor mínimo (inclusivo)
 * @param max - Valor máximo (exclusivo)
 * @returns Número aleatorio seguro en el rango [min, max)
 */
export const getSecureRandomInRange = (min: number, max: number): number => {
  if (min >= max) {
    throw new Error('min debe ser menor que max');
  }
  return min + getSecureRandomInt(max - min);
};

/**
 * Genera un número flotante aleatorio criptográficamente seguro entre 0 y 1
 * @returns Número flotante aleatorio seguro entre 0 y 1
 */
export const getSecureRandomFloat = (): number => {
  const randomBuffer = new Uint32Array(1);
  crypto.getRandomValues(randomBuffer);
  return randomBuffer[0] / 0x100000000;
};

/**
 * Genera un ID de recibo único y seguro
 * @param prefix - Prefijo para el ID (ej: "ADV", "PAY", "DEF")
 * @returns ID de recibo único
 */
export const generateSecureReceiptId = (prefix: string): string => {
  const randomNumber = getSecureRandomInt(1000000);
  const timestamp = Date.now().toString(36);
  return `${prefix}-${timestamp}-${randomNumber.toString().padStart(6, '0')}`;
};
