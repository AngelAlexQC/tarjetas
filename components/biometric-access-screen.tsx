import { ThemedText } from '@/components/themed-text';
import { ThemedButton } from '@/components/ui/themed-button';
import { useAuth } from '@/contexts/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Fingerprint, ShieldCheck } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BiometricAccessScreenProps {
  onSuccess: () => void;
  onUsePassword: () => void;
  userName?: string;
}

export function BiometricAccessScreen({ onSuccess, onUsePassword, userName }: BiometricAccessScreenProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { authenticateWithBiometric } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authenticate = useCallback(async () => {
    setIsAuthenticating(true);
    setError(null);

    try {
      const result = await authenticateWithBiometric();

      if (result.success) {
        setTimeout(() => {
          setIsAuthenticating(false);
          onSuccess();
        }, 500);
      } else {
        setIsAuthenticating(false);
        setError(result.error || 'Error en la autenticación');
      }
    } catch (err) {
      console.error('Biometric error:', err);
      setIsAuthenticating(false);
      setError('Error inesperado');
    }
  }, [authenticateWithBiometric, onSuccess]);

  useEffect(() => {
    // Iniciar autenticación automáticamente al montar
    const timer = setTimeout(() => {
      authenticate();
    }, 500);

    return () => clearTimeout(timer);
  }, [authenticate]);

  const biometricType = Platform.OS === 'ios' ? 'Face ID / Touch ID' : 'Huella Digital';
  const Icon = Platform.OS === 'ios' ? ShieldCheck : Fingerprint;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animated.View
        entering={FadeIn.duration(600)}
        style={[
          styles.content,
          {
            paddingTop: insets.top + 80,
            paddingBottom: insets.bottom + 40,
          },
        ]}
      >
        {/* Icono de biométrica */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={[styles.iconContainer, { backgroundColor: `${theme.tenant.mainColor}15` }]}
        >
          {isAuthenticating ? (
            <ActivityIndicator size="large" color={theme.tenant.mainColor} />
          ) : (
            <Icon size={64} color={theme.tenant.mainColor} />
          )}
        </Animated.View>

        {/* Saludo */}
        {userName && (
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <ThemedText type="title" style={styles.greeting}>
              ¡Hola, {userName}!
            </ThemedText>
          </Animated.View>
        )}

        {/* Título */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <ThemedText type="subtitle" style={styles.title}>
            {isAuthenticating ? 'Verificando identidad...' : 'Acceso Biométrico'}
          </ThemedText>
        </Animated.View>

        {/* Descripción */}
        <Animated.View entering={FadeInDown.delay(500).springify()}>
          <ThemedText style={[styles.description, { color: theme.colors.textSecondary }]}>
            {isAuthenticating
              ? `Usa tu ${biometricType} para continuar`
              : error
              ? error
              : 'Toca el botón para autenticarte'}
          </ThemedText>
        </Animated.View>

        {/* Botones */}
        <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.buttons}>
          {!isAuthenticating && (
            <>
              <ThemedButton
                title="Intentar de nuevo"
                onPress={authenticate}
                variant="primary"
                style={styles.button}
              />
              <ThemedButton
                title="Usar contraseña"
                onPress={onUsePassword}
                variant="outline"
                style={styles.button}
              />
            </>
          )}
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 20,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  buttons: {
    width: '100%',
    maxWidth: 320,
    gap: 12,
    marginTop: 20,
  },
  button: {
    width: '100%',
  },
});
