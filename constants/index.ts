/**
 * Constants Index
 * 
 * Barrel exports para todas las constantes de la aplicación.
 */

// App configuration
export { STORAGE_KEYS, TIMING } from './app';

// Card related
export { CARD_ACTIONS, type CardAction, type CardActionType } from './card-actions';
export {
    CARD_BRAND_DESIGNS, CARD_STATUS_LABELS, CARD_TYPE_LABELS, CARD_TYPE_VARIANTS, type CardBrand, type CardStatus, type CardType
} from './card-types';

// Design system
export {
    ComponentTokens,
    getButtonGradient,
    getGlassOverlay,
    getSurfaceColor,
    getTextColor, PrimitiveColors,
    SemanticColors
} from './design-tokens';

// Tenant/Multi-tenant
export {
    AVAILABLE_TENANTS, defaultTheme, getTenantTheme,
    searchTenants, tenantThemes, type TenantInfo, type TenantTheme
} from './tenant-themes';

