export interface CountryConfig {
  code: string;
  name: string;
  locale: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  phonePrefix: string;
  documentTypes: string[];
  
  validators: {
    nationalId: (value: string) => boolean;
    taxId: (value: string) => boolean;
    phone: (value: string) => boolean;
  };
}
