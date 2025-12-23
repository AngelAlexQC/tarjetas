/**
 * Hooks Index
 * 
 * Punto de entrada principal para hooks comunes.
 * Nota: Muchos hooks se importan directamente para mejor tree-shaking.
 */

// Card hooks (especializados)
export * from '@/domain/cards/hooks';

// App hooks más usados
export { useAppTheme, useResponsiveLayout } from '@/ui/theming';

// Auth hooks
export { usePasswordRecovery, useRegister } from './use-auth-operations';
export { useAuthFlow } from './use-auth-flow';
export { useUserRecovery } from './use-user-recovery';

// Tenant hooks
export { useFeatures } from './use-features';
export { useTenants } from './use-tenants';

// UI hooks
export { useKeyboard } from './use-keyboard';

// Country hooks
export { useCountryConfig } from './use-country-config';

