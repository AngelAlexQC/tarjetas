/**
 * Valida cédula de ciudadanía colombiana
 * Formato: 6-10 dígitos numéricos
 */
export function validateCedula(cedula: string): boolean {
  if (!cedula) return false;
  
  // Eliminar espacios y puntos
  const cleaned = cedula.trim().replace(/[.\s]/g, '');
  
  // Validar que solo contenga números
  if (!/^\d+$/.test(cleaned)) return false;
  
  // Validar longitud (6-10 dígitos)
  if (cleaned.length < 6 || cleaned.length > 10) return false;
  
  return true;
}

/**
 * Valida NIT (Número de Identificación Tributaria) colombiano
 * Formato: 9-10 dígitos + dígito de verificación
 * Ejemplo: 900123456-7
 */
export function validateNit(nit: string): boolean {
  if (!nit) return false;
  
  // Eliminar espacios, puntos y guiones
  const cleaned = nit.trim().replace(/[.\s-]/g, '');
  
  // Validar que solo contenga números
  if (!/^\d+$/.test(cleaned)) return false;
  
  // Validar longitud (9-10 dígitos + verificación = 10-11)
  if (cleaned.length < 9 || cleaned.length > 11) return false;
  
  // Si tiene dígito de verificación, validarlo
  if (cleaned.length >= 10) {
    const digits = cleaned.slice(0, -1);
    const checkDigit = parseInt(cleaned.slice(-1));
    
    // Algoritmo de validación del dígito de verificación
    const weights = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
    let sum = 0;
    
    for (let i = 0; i < digits.length; i++) {
      sum += parseInt(digits[digits.length - 1 - i]) * weights[i];
    }
    
    const remainder = sum % 11;
    const expectedCheckDigit = remainder > 1 ? 11 - remainder : remainder;
    
    return checkDigit === expectedCheckDigit;
  }
  
  return true;
}
