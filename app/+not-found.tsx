/**
 * Not Found Screen (+not-found.tsx)
 *
 * Pantalla que se muestra cuando el usuario navega a una ruta que no existe.
 * Expo Router renderiza este componente automáticamente para rutas no encontradas.
 */

import { useAppTheme } from '@/hooks/use-app-theme';
import { Link } from 'expo-router';
import { FileQuestion, Home } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NotFoundScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top + 40,
          paddingBottom: insets.bottom + 20,
        },
      ]}
    >
      {/* Icon */}
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: theme.colors.surfaceHigher },
        ]}
      >
        <FileQuestion size={48} color={theme.tenant.mainColor} />
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Página no encontrada
      </Text>

      {/* Message */}
      <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
        La página que buscas no existe o ha sido movida.
      </Text>

      {/* Home Button */}
      <Link href="/" asChild>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.tenant.mainColor },
            pressed && styles.buttonPressed,
          ]}
        >
          <Home size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Ir al inicio</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 320,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    minWidth: 200,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
