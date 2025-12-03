/**
 * Components Index
 *
 * Barrel exports para todos los componentes de la aplicación.
 */

// Core themed components
export { ThemedText, type ThemedTextProps } from './themed-text';
export { ThemedView, type ThemedViewProps } from './themed-view';

// Error handling
export { ErrorFallback, type ErrorFallbackProps } from './error-fallback';

// Screen components
export { AnimatedSplashScreen } from './animated-splash-screen';
export { BiometricAccessScreen } from './biometric-access-screen';
export { BiometricEnableModal } from './biometric-enable-modal';
export { LoginScreen } from './login-screen';
export { OnboardingScreen } from './onboarding-screen';

// Layout components
export { HapticTab } from './haptic-tab';
export { InstitutionSelectorHeader } from './institution-selector-header';

// Sub-modules (import from these for more specific components)
export * from './cards';
export * from './navigation';
export * from './ui';

