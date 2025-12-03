/**
 * Hooks Index
 * 
 * Punto de entrada principal para todos los hooks de la aplicación.
 */

// Card hooks (especializados)
export * from './cards';

// Alias para compatibilidad - useCards es un alias de useCardQueries
export { useCardQueries as useCards } from './cards';

// App hooks
export { useAppTheme } from './use-app-theme';
export { useColorScheme } from './use-color-scheme';
export { useKeyboard } from './use-keyboard';
export { useResponsiveLayout } from './use-responsive-layout';

