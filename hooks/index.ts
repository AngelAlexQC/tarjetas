/**
 * Hooks Index
 * 
 * Punto de entrada principal para hooks comunes.
 * Nota: Muchos hooks se importan directamente para mejor tree-shaking.
 */

// Card hooks (especializados)
export * from './cards';

// App hooks más usados
export { useAppTheme } from './use-app-theme';
export { usePasswordRecovery, useRegister } from './use-auth-operations';
export { useResponsiveLayout } from './use-responsive-layout';

// Tenant hooks
export { useTenants } from './use-tenants';
export { useFeatures } from './use-features';

// Security hooks
export { useLoginRateLimit } from './use-login-rate-limit';
export { useSessionTimeout, useActivityTracker } from './use-session-timeout';

