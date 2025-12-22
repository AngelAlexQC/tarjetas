import { isValidPhone } from '../common/validators';
import type { CountryConfig } from '../types';
import { validateCurp, validateRfc } from './validators';

/**
 * Configuración de México
 * Validadores y reglas específicas del país
 */
export const mexicoConfig: CountryConfig = {
  code: 'MX',
  name: 'México',
  phonePrefix: '+52',
  documentTypes: ['INE', 'CURP', 'RFC', 'PAS'],
  documentTypeDetails: [
    { code: 'INE', name: 'INE/IFE' },
    { code: 'CURP', name: 'CURP' },
    { code: 'RFC', name: 'RFC' },
    { code: 'PAS', name: 'Pasaporte' },
  ],
  
  validators: {
    nationalId: validateCurp,
    taxId: validateRfc,
    phone: isValidPhone,
  },
};
