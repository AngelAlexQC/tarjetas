import { ThemedText } from '@/components/themed-text';
import { ThemedButton } from '@/components/ui/themed-button';
import { ThemedInput } from '@/components/ui/themed-input';
import { useAuth } from '@/contexts/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LockKeyhole, Mail, User } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const insets = useSafeAreaInsets();
  const { login, getRememberedUsername, rememberUsername } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberUser, setRememberUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  // Cargar usuario recordado al montar
  const loadRememberedUsername = useCallback(async () => {
    const remembered = await getRememberedUsername();
    if (remembered) {
      setUsername(remembered);
      setRememberUser(true);
    }
  }, [getRememberedUsername]);

  useEffect(() => {
    loadRememberedUsername();
  }, [loadRememberedUsername]);

  const handleLogin = async () => {
    setError('');
    setIsLoading(true);

    try {
      const result = await login(username.trim(), password);

      if (result.success) {
        // Guardar o limpiar usuario recordado
        if (rememberUser) {
          await rememberUsername(username.trim());
        }

        // Llamar al callback de éxito
        onLoginSuccess();
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch {
      setError('Error inesperado. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // TODO: Implementar pantalla de recuperación
    console.log('Forgot password');
  };

  const handleRegister = () => {
    // TODO: Implementar pantalla de registro
    console.log('Register');
  };

  const handleEmailLogin = () => {
    // TODO: Implementar login con email directo
    console.log('Email login');
  };

  // Estilos específicos por plataforma
  const containerMaxWidth = Math.min(layout.screenWidth * 0.9, 420);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 40,
            paddingBottom: insets.bottom + 20,
            paddingHorizontal: layout.horizontalPadding,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          entering={FadeInUp.duration(600)}
          style={[styles.content, { maxWidth: containerMaxWidth }]}
        >
          {/* Logo de Libélula */}
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/icon.png')}
              style={styles.logo}
              contentFit="contain"
            />
            <ThemedText type="title" style={styles.brandText}>
              LIBÉLULA
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Agilidad Tecnológica
            </ThemedText>
          </View>

          {/* Formulario */}
          <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.form}>
            {/* Campo Usuario */}
            <ThemedInput
              label="Nombre de usuario"
              placeholder="Sofi"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                setError('');
              }}
              autoCapitalize="none"
              autoCorrect={false}
              icon={<User size={20} color={theme.colors.textSecondary} />}
              error={error && !username ? 'Campo requerido' : undefined}
            />

            {/* Campo Contraseña */}
            <ThemedInput
              label="Contraseña"
              placeholder="••••••••••••"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError('');
              }}
              secureTextEntry={secureTextEntry}
              autoCapitalize="none"
              icon={<LockKeyhole size={20} color={theme.colors.textSecondary} />}
              error={error && !password ? 'Campo requerido' : undefined}
            />

            {/* Toggle de visibilidad de contraseña */}
            <Pressable
              onPress={() => setSecureTextEntry(!secureTextEntry)}
              style={styles.togglePassword}
            >
              <Ionicons
                name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={theme.colors.textSecondary}
              />
            </Pressable>

            {/* Error general */}
            {error && (
              <Animated.View entering={FadeInDown.duration(300)}>
                <ThemedText style={styles.errorText}>{error}</ThemedText>
              </Animated.View>
            )}

            {/* Links auxiliares */}
            <View style={styles.linksRow}>
              <Pressable onPress={handleForgotPassword}>
                <ThemedText style={[styles.link, { color: theme.tenant.mainColor }]}>
                  Olvidé mi contraseña
                </ThemedText>
              </Pressable>
            </View>

            <Pressable 
              onPress={() => setRememberUser(!rememberUser)}
              style={styles.rememberRow}
            >
              <Ionicons
                name={rememberUser ? 'checkbox' : 'square-outline'}
                size={24}
                color={theme.tenant.mainColor}
              />
              <ThemedText style={styles.rememberText}>Recordar mi usuario</ThemedText>
            </Pressable>

            <Pressable onPress={handleRegister}>
              <ThemedText style={[styles.link, { color: theme.tenant.mainColor }]}>
                Registro
              </ThemedText>
            </Pressable>

            {/* Botón Email (opcional) */}
            <ThemedButton
              title="Ingrese con tu email"
              onPress={handleEmailLogin}
              variant="outline"
              icon={<Mail size={20} color={theme.tenant.mainColor} />}
              style={styles.emailButton}
            />

            {/* Botón Continuar */}
            <ThemedButton
              title="Continuar"
              onPress={handleLogin}
              variant="primary"
              loading={isLoading}
              disabled={isLoading || !username || !password}
              style={styles.loginButton}
            />
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 16,
  },
  brandText: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    width: '100%',
    gap: 16,
  },
  togglePassword: {
    position: 'absolute',
    right: 16,
    top: 105,
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    textAlign: 'center',
    marginTop: -8,
  },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  link: {
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: -8,
  },
  rememberText: {
    fontSize: 14,
  },
  emailButton: {
    marginTop: 8,
  },
  loginButton: {
    marginTop: 8,
  },
});
