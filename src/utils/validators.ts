/**
 * Validadores de formulario compartidos
 * 
 * Funciones de validación reutilizables para formularios de autenticación.
 */

/**
 * Valida si un email tiene formato correcto
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Valida si una contraseña cumple los requisitos mínimos
 * - Mínimo 8 caracteres
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};

/**
 * Valida si un número de teléfono tiene formato válido
 * - Acepta prefijo opcional (+)
 * - 10 a 15 dígitos
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};
