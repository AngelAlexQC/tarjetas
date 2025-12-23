/**
 * Hook centralizado para el tema de la aplicación
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
import { getBrandingFromTenant } from '@/constants/tenant-themes';
import { useTenantTheme } from '@/contexts/tenant-theme-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ColorMode = 'light' | 'dark';
export type GlassIntensity = 'light' | 'medium' | 'heavy';
export type SurfaceLevel = 0 | 1 | 2 | 3;
export type TextVariant = 'primary' | 'secondary' | 'tertiary' | 'disabled' | 'inverse';

export type AppTheme = ReturnType<typeof useAppTheme>;

export function useAppTheme() {
  const { currentTheme } = useTenantTheme();
  const colorScheme = useColorScheme();
  const mode: ColorMode = colorScheme === 'dark' ? 'dark' : 'light';
  
  const branding = getBrandingFromTenant(currentTheme);

  const tenant = {
    slug: currentTheme?.slug ?? 'default',
    mainColor: branding.primaryColor,
    secondaryColor: branding.secondaryColor,
    accentColor: branding.accentColor,
    name: currentTheme?.name ?? 'Institución Financiera',
    logoUrl: branding.logoUrl,
    textOnPrimary: branding.textOnPrimary,
    textOnSecondary: branding.textOnSecondary,
    locale: currentTheme?.locale ?? 'en-US',
    currency: currentTheme?.currency ?? 'USD',
    currencySymbol: currentTheme?.currencySymbol ?? 'US$',
    gradientColors: branding.gradientColors,
  };

  const semantic = SemanticColors[mode];
  const components = ComponentTokens;

  const helpers = {
    getThemeGradient: () => getButtonGradient(
      tenant.mainColor,
      tenant.secondaryColor,
      tenant.accentColor,
      mode
    ),

    getOverlay: (intensity: GlassIntensity = 'medium') => 
      getGlassOverlay(mode, intensity),

    getSurface: (level: SurfaceLevel = 0) => 
      getSurfaceColor(mode, level),

    getText: (variant: TextVariant = 'primary') => 
      getTextColor(mode, variant),

    getGlassTokens: () => components.glassmorphism[mode],

    getCardTokens: () => components.card[mode],

    getButtonTokens: () => components.button[mode],
  };

  return {
    mode,
    isDark: mode === 'dark',
    tenant,
    colors: {
      background: semantic.background.default,
      backgroundSecondary: semantic.background.secondary,
      backgroundTertiary: semantic.background.tertiary,
      surface: semantic.surface.level0,
      surfaceElevated: semantic.surface.level1,
      surfaceHigher: semantic.surface.level2,
      surfacePopup: semantic.surface.level3,
      border: semantic.border.default,
      borderSubtle: semantic.border.subtle,
      borderStrong: semantic.border.strong,
      text: semantic.text.primary,
      textSecondary: semantic.text.secondary,
      textTertiary: semantic.text.tertiary,
      textDisabled: semantic.text.disabled,
      textInverse: semantic.text.inverse,
      overlay: semantic.overlay.medium,
      overlayLight: semantic.overlay.light,
      overlayHeavy: semantic.overlay.heavy,
      scrim: semantic.overlay.scrim,
      shadow: semantic.shadow.color,
      shadowElevated: semantic.shadow.elevated,
      white: PrimitiveColors.neutral[0],
      black: PrimitiveColors.neutral[100],
    },
    components,
    helpers,
  };
}
