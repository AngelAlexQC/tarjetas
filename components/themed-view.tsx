import { View, type ViewProps } from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  surface?: 'level0' | 'level1' | 'level2' | 'level3';
};

export function ThemedView({ 
  style, 
  lightColor, 
  darkColor, 
  surface = 'level0',
  ...otherProps 
}: ThemedViewProps) {
  const theme = useAppTheme();
  
  // Prioridad: custom colors > surface level > default background
  const backgroundColor = lightColor || darkColor 
    ? (theme.isDark ? darkColor : lightColor) || theme.helpers.getSurface(surface)
    : theme.helpers.getSurface(surface);

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
