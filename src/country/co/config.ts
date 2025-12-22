import { isValidPhone } from '../common/validators';
import type { CountryConfig } from '../types';
import { validateCedula, validateNit } from './validators';

/**
 * Configuración de Colombia
 * Validadores y reglas específicas del país
 */
export const colombiaConfig: CountryConfig = {
  code: 'CO',
  name: 'Colombia',
  phonePrefix: '+57',
  documentTypes: ['CC', 'CE', 'NIT', 'PAS'],
  documentTypeDetails: [
    { code: 'CC', name: 'Cédula de Ciudadanía' },
    { code: 'CE', name: 'Cédula de Extranjería' },
    { code: 'NIT', name: 'NIT' },
    { code: 'PAS', name: 'Pasaporte' },
  ],
  
  validators: {
    nationalId: validateCedula,
    taxId: validateNit,
    phone: isValidPhone,
  },
};
