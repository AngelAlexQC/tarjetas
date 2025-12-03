/**
 * Contexts Index
 * 
 * Barrel exports para todos los contextos de React.
 */

export { AuthProvider, useAuth, type User } from './auth-context';
export { SplashProvider, useSplash } from './splash-context';
export { TenantThemeProvider, useTenantTheme, useThemedColors } from './tenant-theme-context';
export { TourProvider, useTour } from './tour-context';

