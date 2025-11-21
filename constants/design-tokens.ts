/**
 * Design System Tokens - Foundation Colors
 * Siguiendo Material Design 3 y Apple HIG 2025
 * Sistema de tokens semánticos que funcionan para cualquier tema
 */

// ============================================
// PRIMITIVE TOKENS - Base Colors
// ============================================

export const PrimitiveColors = {
  // Neutral Palette (Gray Scale) - Base para todos los modos
  neutral: {
    0: '#FFFFFF',    // Pure white
    5: '#F8F9FA',    // Casi blanco
    10: '#F1F3F4',   // Muy claro
    20: '#E8EAED',   // Claro
    30: '#DADCE0',   // Medio claro
    40: '#BDC1C6',   // Medio
    50: '#9AA0A6',   // Medio oscuro
    60: '#80868B',   // Oscuro
    70: '#5F6368',   // Muy oscuro
    80: '#3C4043',   // Casi negro
    90: '#202124',   // Negro suave
    95: '#171717',   // Negro oscuro
    100: '#000000',  // Pure black
  },

  // Neutral Variant (Warm Gray) - Para elevaciones y superficies
  neutralVariant: {
    10: '#F5F5F0',
    20: '#E7E8E0',
    30: '#CACBC3',
    40: '#AEAFA7',
    50: '#92938C',
    60: '#787A73',
    70: '#5F615B',
    80: '#474944',
    90: '#2F312E',
  },
};

// ============================================
// SEMANTIC TOKENS - Surface & Background
// ============================================

export const SemanticColors = {
  light: {
    // Backgrounds
    background: {
      default: PrimitiveColors.neutral[0],      // #FFFFFF
      secondary: PrimitiveColors.neutral[5],    // #F8F9FA
      tertiary: PrimitiveColors.neutral[10],    // #F1F3F4
    },
    
    // Surfaces (Cards, Modals, etc) - Con elevación
    surface: {
      level0: PrimitiveColors.neutral[0],       // Base
      level1: PrimitiveColors.neutral[5],       // Elevado
      level2: PrimitiveColors.neutral[10],      // Más elevado
      level3: PrimitiveColors.neutral[20],      // Popup/Modal
    },
    
    // Borders & Dividers
    border: {
      default: PrimitiveColors.neutral[30],     // #DADCE0
      subtle: PrimitiveColors.neutral[20],      // #E8EAED
      strong: PrimitiveColors.neutral[40],      // #BDC1C6
    },
    
    // Text
    text: {
      primary: PrimitiveColors.neutral[90],     // #202124
      secondary: PrimitiveColors.neutral[70],   // #5F6368
      tertiary: PrimitiveColors.neutral[60],    // #80868B
      disabled: PrimitiveColors.neutral[50],    // #9AA0A6
      inverse: PrimitiveColors.neutral[0],      // #FFFFFF
    },
    
    // Overlay & Backdrop
    overlay: {
      light: 'rgba(255, 255, 255, 0.7)',
      medium: 'rgba(255, 255, 255, 0.5)',
      heavy: 'rgba(255, 255, 255, 0.3)',
      scrim: 'rgba(0, 0, 0, 0.32)',
    },
    
    // Shadow
    shadow: {
      color: 'rgba(0, 0, 0, 0.15)',
      elevated: 'rgba(0, 0, 0, 0.25)',
    },
  },
  
  dark: {
    // Backgrounds - Evitar pure black
    background: {
      default: PrimitiveColors.neutral[95],     // #171717
      secondary: PrimitiveColors.neutral[90],   // #202124
      tertiary: PrimitiveColors.neutral[80],    // #3C4043
    },
    
    // Surfaces - Con elevación (más claros que background)
    surface: {
      level0: PrimitiveColors.neutral[95],      // Base
      level1: PrimitiveColors.neutral[90],      // Elevado
      level2: PrimitiveColors.neutral[80],      // Más elevado
      level3: PrimitiveColors.neutral[70],      // Popup/Modal
    },
    
    // Borders & Dividers
    border: {
      default: PrimitiveColors.neutral[70],     // #5F6368
      subtle: PrimitiveColors.neutral[80],      // #3C4043
      strong: PrimitiveColors.neutral[60],      // #80868B
    },
    
    // Text - Evitar pure white
    text: {
      primary: PrimitiveColors.neutral[10],     // #F1F3F4
      secondary: PrimitiveColors.neutral[40],   // #BDC1C6
      tertiary: PrimitiveColors.neutral[50],    // #9AA0A6
      disabled: PrimitiveColors.neutral[60],    // #80868B
      inverse: PrimitiveColors.neutral[90],     // #202124
    },
    
    // Overlay & Backdrop
    overlay: {
      light: 'rgba(255, 255, 255, 0.08)',
      medium: 'rgba(255, 255, 255, 0.12)',
      heavy: 'rgba(255, 255, 255, 0.16)',
      scrim: 'rgba(0, 0, 0, 0.6)',
    },
    
    // Shadow
    shadow: {
      color: 'rgba(0, 0, 0, 0.4)',
      elevated: 'rgba(0, 0, 0, 0.6)',
    },
  },
};

// ============================================
// COMPONENT TOKENS - Uso específico
// ============================================

export const ComponentTokens = {
  button: {
    light: {
      // Para botones con color del tema
      primaryBg: 'theme', // Usar color del tema
      primaryText: PrimitiveColors.neutral[0],
      
      // Para botones secundarios
      secondaryBg: PrimitiveColors.neutral[10],
      secondaryText: PrimitiveColors.neutral[90],
      
      // Para botones outline
      outlineBorder: PrimitiveColors.neutral[40],
      outlineText: PrimitiveColors.neutral[90],
    },
    dark: {
      primaryBg: 'theme',
      primaryText: PrimitiveColors.neutral[10],
      
      secondaryBg: PrimitiveColors.neutral[80],
      secondaryText: PrimitiveColors.neutral[10],
      
      outlineBorder: PrimitiveColors.neutral[60],
      outlineText: PrimitiveColors.neutral[10],
    },
  },
  
  card: {
    light: {
      background: SemanticColors.light.surface.level1,
      border: SemanticColors.light.border.subtle,
      shadow: SemanticColors.light.shadow.color,
    },
    dark: {
      background: SemanticColors.dark.surface.level1,
      border: SemanticColors.dark.border.subtle,
      shadow: SemanticColors.dark.shadow.color,
    },
  },
  
  glassmorphism: {
    light: {
      background: 'rgba(255, 255, 255, 0.35)',
      border: 'rgba(0, 0, 0, 0.06)',           // Borde oscuro muy sutil
      innerGlow: 'rgba(255, 255, 255, 0.15)',
      iconBorder: 'rgba(0, 0, 0, 0.08)',       // Borde del ícono sutil
      outerRing: 'rgba(255, 255, 255, 0.25)',  // Anillo exterior sutil
    },
    dark: {
      background: 'rgba(255, 255, 255, 0.05)',
      border: 'rgba(255, 255, 255, 0.12)',     // Borde moderado
      innerGlow: 'rgba(255, 255, 255, 0.08)',
      iconBorder: 'rgba(255, 255, 255, 0.15)',  // Borde del ícono moderado
      outerRing: 'rgba(255, 255, 255, 0.08)',   // Anillo exterior muy sutil
    },
  },
};

// ============================================
// THEME ADAPTATION UTILITIES
// ============================================

/**
 * Ajusta la opacidad del color del tema según el modo
 */
export function adaptThemeColor(color: string, mode: 'light' | 'dark'): string {
  if (mode === 'dark') {
    // En dark mode, reducir saturación para evitar fatiga visual
    return `${color}B3`; // 70% opacity
  }
  return color; // 100% en light mode
}

/**
 * Obtiene el color de overlay apropiado para glassmorphism
 */
export function getGlassOverlay(
  mode: 'light' | 'dark',
  intensity: 'light' | 'medium' | 'heavy' = 'medium'
): string {
  return SemanticColors[mode].overlay[intensity];
}

/**
 * Obtiene el color de superficie según el nivel de elevación
 */
export function getSurfaceColor(
  mode: 'light' | 'dark',
  elevation: 0 | 1 | 2 | 3 = 0
): string {
  const levels = ['level0', 'level1', 'level2', 'level3'] as const;
  return SemanticColors[mode].surface[levels[elevation]];
}

/**
 * Obtiene el color de texto según la jerarquía
 */
export function getTextColor(
  mode: 'light' | 'dark',
  variant: 'primary' | 'secondary' | 'tertiary' | 'disabled' | 'inverse' = 'primary'
): string {
  return SemanticColors[mode].text[variant];
}

/**
 * Obtiene colores para botones con gradiente del tema
 */
export function getButtonGradient(
  themeColor: string,
  secondaryColor: string,
  accentColor: string,
  mode: 'light' | 'dark'
): string[] {
  if (mode === 'dark') {
    return [
      `${themeColor}B3`,      // 70%
      `${secondaryColor}B3`,  // 70%
      `${accentColor}99`,     // 60%
    ];
  }
  return [themeColor, secondaryColor, accentColor];
}
