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

  // Breakpoints basados en el ancho
  const isSmall = width < 360;
  const isMedium = width >= 360 && width < 768;
  const isLarge = width >= 768;

  // Padding horizontal adaptativo
  const horizontalPadding = isSmall ? 12 : isMedium ? 16 : isLandscape ? 32 : 24;
  
  // Ancho máximo de contenido
  const contentMaxWidth = isLarge ? 1024 : '100%';

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
