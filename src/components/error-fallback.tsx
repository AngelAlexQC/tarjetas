/**
 * Error Fallback Component
 *
 * UI de fallback cuando ocurre un error en la aplicación.
 * Se usa con los ErrorBoundary de Expo Router.
 *
 * Características:
 * - Muestra mensaje de error amigable
 * - Botón para reintentar
 * - Opción para reportar el error
 * - Diseño consistente con el tema de la app
 */

import { useAppTheme } from '@/ui/theming';
import { loggers } from '@/core/logging';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const log = loggers.ui;

export interface ErrorFallbackProps {
  /** El error que ocurrió */
  error: Error;
  /** Función para reintentar la operación */
  retry: () => void;
  /** Título personalizado (opcional) */
  title?: string;
  /** Si es true, muestra el botón de ir al inicio */
  showHomeButton?: boolean;
  /** Callback cuando se presiona ir al inicio */
  onGoHome?: () => void;
}

export function ErrorFallback({
  error,
  retry,
  title = 'Algo salió mal',
  showHomeButton = false,
  onGoHome,
}: ErrorFallbackProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  // Loguear el error cuando se monta el componente
  useEffect(() => {
    log.error('ErrorBoundary caught error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    // TODO: Aquí se puede integrar con Sentry u otro servicio de crash reporting
    // Sentry.captureException(error);
  }, [error]);

  // Obtener un mensaje de error amigable
  const getErrorMessage = (): string => {
    // No mostrar stack traces o mensajes técnicos al usuario
    if (__DEV__) {
      return error.message;
    }

    // En producción, mostrar mensaje genérico
    return 'Ha ocurrido un error inesperado. Por favor, intenta de nuevo.';
  };

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
        <AlertTriangle size={48} color="#F59E0B" />
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>

      {/* Error Message */}
      <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
        {getErrorMessage()}
      </Text>

      {/* Debug info en desarrollo */}
      {__DEV__ && (
        <View
          style={[
            styles.debugContainer,
            { backgroundColor: theme.colors.surfaceHigher },
          ]}
        >
          <Text style={[styles.debugTitle, { color: theme.colors.text }]}>
            Debug Info:
          </Text>
          <Text
            style={[styles.debugText, { color: theme.colors.textSecondary }]}
            numberOfLines={5}
          >
            {error.stack || error.message}
          </Text>
        </View>
      )}

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        {/* Retry Button */}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.primaryButton,
            { backgroundColor: theme.tenant.mainColor },
            pressed && styles.buttonPressed,
          ]}
          onPress={retry}
        >
          <RefreshCw size={20} color="#FFFFFF" />
          <Text style={styles.primaryButtonText}>Intentar de nuevo</Text>
        </Pressable>

        {/* Home Button (opcional) */}
        {showHomeButton && onGoHome && (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.secondaryButton,
              {
                borderColor: theme.colors.border,
                backgroundColor: pressed
                  ? theme.colors.surfaceHigher
                  : 'transparent',
              },
            ]}
            onPress={onGoHome}
          >
            <Home size={20} color={theme.colors.text} />
            <Text style={[styles.secondaryButtonText, { color: theme.colors.text }]}>
              Ir al inicio
            </Text>
          </Pressable>
        )}
      </View>
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
  debugContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  debugText: {
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  primaryButton: {
    // backgroundColor se aplica dinámicamente
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
