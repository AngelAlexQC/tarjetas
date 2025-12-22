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
export { usePasswordRecovery, useRegister } from './use-auth-operations';

// Tenant hooks
export { useFeatures } from './use-features';
export { useTenants } from './use-tenants';

