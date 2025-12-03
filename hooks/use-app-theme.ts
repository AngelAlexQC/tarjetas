/**
 * Hook centralizado para todo el tema de la aplicación
 * Combina tenant theme + design tokens + color scheme
 */

import {
    ComponentTokens,
    getButtonGradient,
    getGlassOverlay,
    getSurfaceColor,
    getTextColor,
    PrimitiveColors,
    SemanticColors,
} from '@/constants/design-tokens';
import { useTenantTheme } from '@/contexts/tenant-theme-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ColorMode = 'light' | 'dark';
export type GlassIntensity = 'light' | 'medium' | 'heavy';
export type SurfaceLevel = 0 | 1 | 2 | 3;
export type TextVariant = 'primary' | 'secondary' | 'tertiary' | 'disabled' | 'inverse';

/**
 * Tipo que representa el tema completo de la aplicación
 * Útil para tipar props que reciben el resultado de useAppTheme()
 */
export type AppTheme = ReturnType<typeof useAppTheme>;

/**
 * Hook principal para acceder al tema completo de la app
 */
export function useAppTheme() {
  const { currentTheme } = useTenantTheme();
  const colorScheme = useColorScheme();
  const mode: ColorMode = colorScheme === 'dark' ? 'dark' : 'light';
  
  // Colores del tenant actual
  const tenant = {
    slug: currentTheme?.slug || 'default',
    mainColor: currentTheme?.mainColor || '#007AFF',
    secondaryColor: currentTheme?.secondaryColor || '#2196F3',
    accentColor: currentTheme?.accentColor || '#FF9800',
    name: currentTheme?.name || 'App',
    logoUrl: currentTheme?.logoUrl || '',
    textOnPrimary: currentTheme?.textOnPrimary || '#FFFFFF',
    textOnSecondary: currentTheme?.textOnSecondary || '#FFFFFF',
    locale: currentTheme?.locale || 'en-US',
    currency: currentTheme?.currency || 'USD',
    currencySymbol: currentTheme?.currencySymbol || '$',
    gradientColors: currentTheme?.gradientColors || [currentTheme?.mainColor || '#007AFF', currentTheme?.secondaryColor || '#2196F3'],
  };

  // Tokens semánticos según el modo
  const semantic = SemanticColors[mode];
  const components = ComponentTokens;

  // Helper functions con el modo actual
  const helpers = {
    /**
     * Obtiene el gradiente del tema adaptado al modo
     */
    getThemeGradient: () => getButtonGradient(
      tenant.mainColor,
      tenant.secondaryColor,
      tenant.accentColor,
      mode
    ),

    /**
     * Obtiene color de overlay con intensidad
     */
    getOverlay: (intensity: GlassIntensity = 'medium') => 
      getGlassOverlay(mode, intensity),

    /**
     * Obtiene color de superficie según elevación
     */
    getSurface: (level: SurfaceLevel = 0) => 
      getSurfaceColor(mode, level),

    /**
     * Obtiene color de texto según variante
     */
    getText: (variant: TextVariant = 'primary') => 
      getTextColor(mode, variant),

    /**
     * Obtiene tokens de glassmorphism para el modo actual
     */
    getGlassTokens: () => components.glassmorphism[mode],

    /**
     * Obtiene tokens de card para el modo actual
     */
    getCardTokens: () => components.card[mode],

    /**
     * Obtiene tokens de button para el modo actual
     */
    getButtonTokens: () => components.button[mode],
  };

  return {
    // Modo de color actual
    mode,
    isDark: mode === 'dark',
    
    // Colores del tenant
    tenant,
    
    // Tokens semánticos
    colors: {
      // Backgrounds
      background: semantic.background.default,
      backgroundSecondary: semantic.background.secondary,
      backgroundTertiary: semantic.background.tertiary,
      
      // Surfaces
      surface: semantic.surface.level0,
      surfaceElevated: semantic.surface.level1,
      surfaceHigher: semantic.surface.level2,
      surfacePopup: semantic.surface.level3,
      
      // Borders
      border: semantic.border.default,
      borderSubtle: semantic.border.subtle,
      borderStrong: semantic.border.strong,
      
      // Text
      text: semantic.text.primary,
      textSecondary: semantic.text.secondary,
      textTertiary: semantic.text.tertiary,
      textDisabled: semantic.text.disabled,
      textInverse: semantic.text.inverse,
      
      // Overlay
      overlay: semantic.overlay.medium,
      overlayLight: semantic.overlay.light,
      overlayHeavy: semantic.overlay.heavy,
      scrim: semantic.overlay.scrim,
      
      // Shadow
      shadow: semantic.shadow.color,
      shadowElevated: semantic.shadow.elevated,
      
      // Primitive colors (si se necesitan)
      white: PrimitiveColors.neutral[0],
      black: PrimitiveColors.neutral[100],
    },
    
    // Component tokens
    components,
    
    // Helper functions
    helpers,
  };
}
