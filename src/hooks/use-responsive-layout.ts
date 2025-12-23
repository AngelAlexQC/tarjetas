import { BREAKPOINTS, CONTENT_MAX_WIDTH, HORIZONTAL_PADDING } from '@/constants/layout';
import { useWindowDimensions } from 'react-native';

interface ResponsiveLayout {
  contentMaxWidth: number | '100%';
  horizontalPadding: number;
  isSmall: boolean;
  isMedium: boolean;
  isLarge: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
}

export function useResponsiveLayout(): ResponsiveLayout {
  const { width, height } = useWindowDimensions();

  // Determinar orientación
  const isLandscape = width > height;
  const isPortrait = height > width;
  const orientation = isLandscape ? 'landscape' : 'portrait';

  // Breakpoints basados en el ancho (usando constantes)
  const isSmall = width < BREAKPOINTS.SMALL;
  const isMedium = width >= BREAKPOINTS.SMALL && width < BREAKPOINTS.MEDIUM;
  const isLarge = width >= BREAKPOINTS.MEDIUM;

  // Padding horizontal adaptativo (usando constantes)
  const horizontalPadding = isSmall
    ? HORIZONTAL_PADDING.SMALL
    : isMedium
      ? HORIZONTAL_PADDING.MEDIUM
      : isLandscape
        ? HORIZONTAL_PADDING.LANDSCAPE
        : HORIZONTAL_PADDING.LARGE;
  
  // Ancho máximo de contenido
  const contentMaxWidth = isLarge ? CONTENT_MAX_WIDTH.MAIN : '100%';

  return { 
    contentMaxWidth, 
    horizontalPadding, 
    isSmall, 
    isMedium, 
    isLarge,
    isLandscape,
    isPortrait,
    screenWidth: width,
    screenHeight: height,
    orientation
  };
}
