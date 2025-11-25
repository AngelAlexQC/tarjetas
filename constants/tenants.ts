/**
 * Available Tenants (Instituciones Financieras)
 * 
 * Lista de instituciones financieras disponibles para selección.
 * Esta información podría venir de un servicio en producción.
 */

export interface TenantInfo {
  slug: string;
  name: string;
  logoUrl: string;
  mainColor: string;
  currencyCode: string;
  country: string;
  countryFlag: string;
}

/**
 * Lista de tenants disponibles agrupados por región.
 */
export const AVAILABLE_TENANTS: TenantInfo[] = [
  // ==========================================
  // ECUADOR
  // ==========================================
  {
    slug: "bpichincha",
    name: "Banco Pichincha",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/45/Banco_Pichincha_nuevo.png",
    mainColor: "#ffdf00",
    currencyCode: "US$",
    country: "Ecuador",
    countryFlag: "🇪🇨",
  },
  {
    slug: "coopchone",
    name: "Cooperativa de Ahorro y Crédito Chone",
    logoUrl: "https://coopchone.fin.ec/wp-content/uploads/2025/01/LogoHorizontal.png",
    mainColor: "#006837",
    currencyCode: "US$",
    country: "Ecuador",
    countryFlag: "🇪🇨",
  },
  {
    slug: "dinersclub-ec",
    name: "Diners Club",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Diners_Club_Logo3.svg",
    mainColor: "#0079be",
    currencyCode: "US$",
    country: "Ecuador",
    countryFlag: "🇪🇨",
  },
  
  // ==========================================
  // COLOMBIA
  // ==========================================
  {
    slug: "bancolombia",
    name: "Bancolombia",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/d/dc/Bancolombia_S.A._logo.svg",
    mainColor: "#FFEB00",
    currencyCode: "COP$",
    country: "Colombia",
    countryFlag: "🇨🇴",
  },
  {
    slug: "davivienda-co",
    name: "Davivienda",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/a/ac/Davivienda_Logo.png",
    mainColor: "#D22C21",
    currencyCode: "COP$",
    country: "Colombia",
    countryFlag: "🇨🇴",
  },
  
  // ==========================================
  // MÉXICO
  // ==========================================
  {
    slug: "bbva-mx",
    name: "BBVA México",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/9/98/BBVA_logo_2025.svg",
    mainColor: "#004481",
    currencyCode: "MX$",
    country: "México",
    countryFlag: "🇲🇽",
  },
  
  // ==========================================
  // ESTADOS UNIDOS
  // ==========================================
  {
    slug: "jpmorgan",
    name: "JPMorgan Chase",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Chase_logo.svg/200px-Chase_logo.svg.png",
    mainColor: "#117ACA",
    currencyCode: "US$",
    country: "United States",
    countryFlag: "🇺🇸",
  },
  
  // ==========================================
  // REINO UNIDO
  // ==========================================
  {
    slug: "hsbc",
    name: "HSBC",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/HSBC_logo_%282018%29.svg/200px-HSBC_logo_%282018%29.svg.png",
    mainColor: "#DB0011",
    currencyCode: "£",
    country: "United Kingdom",
    countryFlag: "🇬🇧",
  },
  
  // ==========================================
  // ESPAÑA
  // ==========================================
  {
    slug: "santander",
    name: "Banco Santander",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Banco_Santander_Logotipo.svg/200px-Banco_Santander_Logotipo.svg.png",
    mainColor: "#EC0000",
    currencyCode: "€",
    country: "España",
    countryFlag: "🇪🇸",
  },
  
  // ==========================================
  // ALEMANIA
  // ==========================================
  {
    slug: "deutsche-bank",
    name: "Deutsche Bank",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Deutsche_Bank_logo_without_wordmark.svg/200px-Deutsche_Bank_logo_without_wordmark.svg.png",
    mainColor: "#0018A8",
    currencyCode: "€",
    country: "Deutschland",
    countryFlag: "🇩🇪",
  },
  
  // ==========================================
  // FRANCIA
  // ==========================================
  {
    slug: "bnp-paribas",
    name: "BNP Paribas",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/7/7b/BNP_Paribas.svg/200px-BNP_Paribas.svg.png",
    mainColor: "#008755",
    currencyCode: "€",
    country: "France",
    countryFlag: "🇫🇷",
  },
  
  // ==========================================
  // CHINA
  // ==========================================
  {
    slug: "icbc",
    name: "ICBC China",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/ICBC_Logo.svg/200px-ICBC_Logo.svg.png",
    mainColor: "#C8102E",
    currencyCode: "¥",
    country: "China",
    countryFlag: "🇨🇳",
  },
  
  // ==========================================
  // AUSTRALIA
  // ==========================================
  {
    slug: "commonwealth",
    name: "Commonwealth Bank",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/0/09/Commonwealth_Bank_logo.svg/200px-Commonwealth_Bank_logo.svg.png",
    mainColor: "#FFCC00",
    currencyCode: "A$",
    country: "Australia",
    countryFlag: "🇦🇺",
  },
  
  // ==========================================
  // BRASIL
  // ==========================================
  {
    slug: "itau",
    name: "Itaú Unibanco",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Ita%C3%BA_Unibanco_logo.svg/200px-Ita%C3%BA_Unibanco_logo.svg.png",
    mainColor: "#EC7000",
    currencyCode: "R$",
    country: "Brasil",
    countryFlag: "🇧🇷",
  },
];

/**
 * Obtiene los países únicos de los tenants disponibles.
 */
export function getAvailableCountries(): string[] {
  const countries = new Set(AVAILABLE_TENANTS.map(t => t.country));
  return Array.from(countries).sort();
}

/**
 * Filtra tenants por país.
 */
export function getTenantsByCountry(country: string): TenantInfo[] {
  return AVAILABLE_TENANTS.filter(t => t.country === country);
}

/**
 * Busca tenants por nombre o país.
 */
export function searchTenants(query: string): TenantInfo[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return AVAILABLE_TENANTS;
  
  return AVAILABLE_TENANTS.filter(t => 
    t.name.toLowerCase().includes(normalizedQuery) ||
    t.country.toLowerCase().includes(normalizedQuery)
  );
}
