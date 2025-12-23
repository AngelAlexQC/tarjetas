import { StyleSheet, Text, type TextProps } from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  variant?: 'primary' | 'secondary' | 'tertiary' | 'disabled' | 'inverse';
};

/**
 * Text con soporte de tema automático.
 * Soporta diferentes tipos (title, subtitle, link, etc.) y variantes de color.
 */
export function ThemedText({
  style,
  type = 'default',
  variant = 'primary',
  ...rest
}: ThemedTextProps) {
  const theme = useAppTheme();
  
  // Para links, usar el color primario del tenant
  const color = type === 'link' 
    ? theme.tenant.mainColor 
    : theme.helpers.getText(variant);

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    // Color se aplica dinámicamente en el componente
  },
});
