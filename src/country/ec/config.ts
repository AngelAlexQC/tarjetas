import { isValidPhone } from '../common/validators';
import type { CountryConfig } from '../types';
import { validateCedula, validateRuc } from './validators';

/**
 * Configuración de Ecuador
 * Validadores y reglas específicas del país
 */
export const ecuadorConfig: CountryConfig = {
  code: 'EC',
  name: 'Ecuador',
  phonePrefix: '+593',
  documentTypes: ['CI', 'RUC', 'PAS'],
  documentTypeDetails: [
    { code: 'CI', name: 'Cédula de Identidad' },
    { code: 'RUC', name: 'RUC' },
    { code: 'PAS', name: 'Pasaporte' },
  ],
  
  validators: {
    nationalId: validateCedula,
    taxId: validateRuc,
    phone: isValidPhone,
  },
};
