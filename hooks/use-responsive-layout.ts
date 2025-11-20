import { useWindowDimensions } from 'react-native';

interface ResponsiveLayout {
  contentMaxWidth: number | '100%';
  horizontalPadding: number;
  isSmall: boolean;
  isMedium: boolean;
  isLarge: boolean;
}

export function useResponsiveLayout(): ResponsiveLayout {
  const { width } = useWindowDimensions();

  const isSmall = width < 360;
  const isMedium = width >= 360 && width < 768;
  const isLarge = width >= 768;

  const horizontalPadding = isSmall ? 12 : isMedium ? 16 : 24;
  const contentMaxWidth = isLarge ? 1024 : '100%';

  return { contentMaxWidth, horizontalPadding, isSmall, isMedium, isLarge };
}
