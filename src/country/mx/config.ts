import { isValidPhone } from '../common/validators';
import type { CountryConfig } from '../types';
import { validateCurp, validateRfc } from './validators';

export const mexicoConfig: CountryConfig = {
  code: 'MX',
  name: 'Mexico',
  locale: 'es-MX',
  currency: 'MXN',
  currencySymbol: '$',
  timezone: 'America/Mexico_City',
  phonePrefix: '+52',
  documentTypes: ['INE', 'CURP', 'RFC', 'PAS'],
  
  validators: {
    nationalId: validateCurp,
    taxId: validateRfc,
    phone: isValidPhone,
  },
};
