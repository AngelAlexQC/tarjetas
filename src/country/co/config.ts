import { isValidPhone } from '../common/validators';
import type { CountryConfig } from '../types';
import { validateCedula, validateNit } from './validators';

export const colombiaConfig: CountryConfig = {
  code: 'CO',
  name: 'Colombia',
  locale: 'es-CO',
  currency: 'COP',
  currencySymbol: '$',
  timezone: 'America/Bogota',
  phonePrefix: '+57',
  documentTypes: ['CC', 'CE', 'NIT', 'PAS'],
  
  validators: {
    nationalId: validateCedula,
    taxId: validateNit,
    phone: isValidPhone,
  },
};
