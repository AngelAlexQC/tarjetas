/**
 * Valida CURP (Clave Única de Registro de Población) mexicana
 * Formato: 18 caracteres alfanuméricos
 * Ejemplo: ABCD123456HDFRNN09
 */
export function validateCurp(curp: string): boolean {
  if (!curp) return false;
  
  // Eliminar espacios y convertir a mayúsculas
  const cleaned = curp.trim().toUpperCase();
  
  // Validar longitud
  if (cleaned.length !== 18) return false;
  
  // Validar formato: 4 letras, 6 números, 6 alfanuméricos, 2 números
  const curpRegex = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z0-9]\d$/;
  if (!curpRegex.test(cleaned)) return false;
  
  return true;
}

/**
 * Valida RFC (Registro Federal de Contribuyentes) mexicano
 * Formato persona física: 13 caracteres (AAAA123456XXX)
 * Formato persona moral: 12 caracteres (AAA123456XXX)
 */
export function validateRfc(rfc: string): boolean {
  if (!rfc) return false;
  
  // Eliminar espacios y convertir a mayúsculas
  const cleaned = rfc.trim().toUpperCase();
  
  // Validar longitud (12 o 13 caracteres)
  if (cleaned.length !== 12 && cleaned.length !== 13) return false;
  
  // Persona física (13 caracteres): 4 letras, 6 números, 3 alfanuméricos
  const rfcFisicoRegex = /^[A-Z]{4}\d{6}[A-Z0-9]{3}$/;
  
  // Persona moral (12 caracteres): 3 letras, 6 números, 3 alfanuméricos
  const rfcMoralRegex = /^[A-Z]{3}\d{6}[A-Z0-9]{3}$/;
  
  return rfcFisicoRegex.test(cleaned) || rfcMoralRegex.test(cleaned);
}
