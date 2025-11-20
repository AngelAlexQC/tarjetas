/**
 * @deprecated Este hook está obsoleto. Usa `useAppTheme()` en su lugar.
 * 
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
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
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
