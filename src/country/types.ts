/**
 * Configuración específica de cada país
 * 
 * NOTA: locale, currency, timezone están en Tenant (varían por institución)
 * Esta config solo tiene validadores y reglas que aplican a TODO el país
 */

export interface DocumentTypeInfo {
  code: string;
  name: string;
}

export interface CountryConfig {
  code: string;           // 'CO', 'EC', 'MX'
  name: string;           // 'Colombia', 'Ecuador'
  phonePrefix: string;    // '+57', '+593', '+52'
  documentTypes: string[]; // ['CC', 'CE', 'NIT', 'PAS']
  documentTypeDetails: DocumentTypeInfo[]; // Detalles con nombres descriptivos
  
  validators: {
    nationalId: (value: string) => boolean;  // Cédula, CI
    taxId: (value: string) => boolean;       // NIT, RUC, RFC
    phone: (value: string) => boolean;       // Validación de teléfono
  };
  
  formatters?: {
    nationalId?: (value: string) => string;  // Formatear cédula con guiones
    taxId?: (value: string) => string;       // Formatear documento tributario
    phone?: (value: string) => string;       // Formatear teléfono con espacios
  };
}
