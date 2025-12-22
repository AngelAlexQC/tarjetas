/**
 * Hook centralizado para todo el tema de la aplicación
 * Combina tenant theme + design tokens + color scheme
 */

import type { TenantTheme } from '@/constants/tenant-themes';
import { useTenantTheme } from '@/contexts/tenant-theme-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Tenant, TenantBranding } from '@/repositories/schemas/tenant.schema';
import { useMemo } from 'react';
import {
    ComponentTokens,
    getButtonGradient,
    getGlassOverlay,
    getSurfaceColor,
    getTextColor,
    PrimitiveColors,
    SemanticColors,
} from './design-tokens';

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
  
  // Memoizar el resultado para evitar re-renders innecesarios
  return useMemo(() => {
    // Helper para obtener branding según el formato
    const getBranding = (): TenantBranding & { slug: string; name: string; locale: string; currency: string; currencySymbol: string; } => {
      if (!currentTheme) {
        return {
          slug: 'default',
          name: 'App',
          logoUrl: '',
          primaryColor: '#007AFF',
          secondaryColor: '#2196F3',
          accentColor: '#FF9800',
          gradientColors: ['#007AFF', '#2196F3'],
          textOnPrimary: '#FFFFFF',
          textOnSecondary: '#FFFFFF',
          locale: 'en-US',
          currency: 'USD',
          currencySymbol: '$',
        };
      }

      // Determinar si es formato nuevo (Tenant) o antiguo (TenantTheme)
      if ('branding' in currentTheme) {
        // Formato nuevo (Tenant)
        const tenant = currentTheme as Tenant;
        return {
          slug: tenant.slug,
          name: tenant.name,
          locale: tenant.locale,
          currency: tenant.currency,
          currencySymbol: tenant.currencySymbol,
          ...tenant.branding,
        };
      } else {
        // Formato antiguo (TenantTheme)
        const legacy = currentTheme as TenantTheme;
        return {
          slug: legacy.slug,
          name: legacy.name,
          locale: legacy.locale,
          currency: legacy.currency,
          currencySymbol: legacy.currencySymbol,
          logoUrl: legacy.logoUrl,
          primaryColor: legacy.mainColor,
          secondaryColor: legacy.secondaryColor,
          accentColor: legacy.accentColor,
          gradientColors: legacy.gradientColors,
          textOnPrimary: legacy.textOnPrimary,
          textOnSecondary: legacy.textOnSecondary,
        };
      }
    };

    const branding = getBranding();
    
    // Colores del tenant actual
    const tenant = {
      slug: branding.slug,
      name: branding.name,
      mainColor: branding.primaryColor,
      secondaryColor: branding.secondaryColor,
      accentColor: branding.accentColor,
      logoUrl: branding.logoUrl,
      textOnPrimary: branding.textOnPrimary,
      textOnSecondary: branding.textOnSecondary,
      locale: branding.locale,
      currency: branding.currency,
      currencySymbol: branding.currencySymbol,
      gradientColors: branding.gradientColors,
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
  }, [currentTheme, mode]);
}

