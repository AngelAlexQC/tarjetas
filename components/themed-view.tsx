import { View, type ViewProps } from 'react-native';

import { SurfaceLevel, useAppTheme } from '@/hooks/use-app-theme';

// Tipo que acepta tanto números como strings para surface
type SurfaceLevelInput = SurfaceLevel | 'level0' | 'level1' | 'level2' | 'level3';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  surface?: SurfaceLevelInput;
};

// Mapeo de nombres de nivel a números
const surfaceLevelMap: Record<string, SurfaceLevel> = {
  level0: 0,
  level1: 1,
  level2: 2,
  level3: 3,
};

export function ThemedView({ 
  style, 
  lightColor, 
  darkColor, 
  surface = 0,
  ...otherProps 
}: ThemedViewProps) {
  const theme = useAppTheme();
  
  // Convertir surface a número si es string (para compatibilidad)
  const surfaceLevel: SurfaceLevel = typeof surface === 'string' 
    ? surfaceLevelMap[surface] ?? 0 
    : surface;
  
  // Prioridad: custom colors > surface level > default background
  const backgroundColor = lightColor || darkColor 
    ? (theme.isDark ? darkColor : lightColor) || theme.helpers.getSurface(surfaceLevel)
    : theme.helpers.getSurface(surfaceLevel);

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
