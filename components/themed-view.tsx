import { View, type ViewProps } from 'react-native';

import { SurfaceLevel, useAppTheme } from '@/hooks/use-app-theme';

export type ThemedViewProps = ViewProps & {
  /** Nivel de superficie (0-3) para el color de fondo */
  surface?: SurfaceLevel;
};

/**
 * View con soporte de tema automático.
 * El color de fondo se ajusta según el nivel de superficie y el modo (light/dark).
 */
export function ThemedView({ 
  style, 
  surface = 0,
  ...otherProps 
}: ThemedViewProps) {
  const theme = useAppTheme();
  const backgroundColor = theme.helpers.getSurface(surface);

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
