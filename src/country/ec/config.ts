import { isValidPhone } from '../common/validators';
import type { CountryConfig } from '../types';
import { validateCedula, validateRuc } from './validators';

export const ecuadorConfig: CountryConfig = {
  code: 'EC',
  name: 'Ecuador',
  locale: 'es-EC',
  currency: 'USD',
  currencySymbol: '$',
  timezone: 'America/Guayaquil',
  phonePrefix: '+593',
  documentTypes: ['CI', 'RUC', 'PAS'],
  
  validators: {
    nationalId: validateCedula,
    taxId: validateRuc,
    phone: isValidPhone,
  },
};
