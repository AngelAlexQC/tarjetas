/**
 * @deprecated Este hook está obsoleto. Usa `useAppTheme()` en su lugar.
 * 
 * MIGRACIÓN:
 * ```
 * // Antes:
 * const color = useThemeColor({ light: '#000', dark: '#fff' }, 'text');
 * 
 * // Ahora:
 * const theme = useAppTheme();
 * const color = theme.colors.text.primary; // o secondary, tertiary, etc.
 * ```
 * 
 * Este archivo se mantiene solo para compatibilidad temporal.
 */

import { useAppTheme } from '@/hooks/use-app-theme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  _colorName: string
) {
  const theme = useAppTheme();
  const colorFromProps = props[theme.mode];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    // Fallback al color de texto primario
    return theme.colors.text.primary;
  }
}
