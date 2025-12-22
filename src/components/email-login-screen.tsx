import { AuthLogoHeader } from '@/components/ui/auth-logo-header';
import { FeedbackColors } from '@/constants';
import { useAuth } from '@/contexts/auth-context';
import { useAppTheme, useResponsiveLayout } from '@/hooks';
import { ThemedButton } from '@/ui/primitives/themed-button';
import { ThemedInput } from '@/ui/primitives/themed-input';
import { ThemedText } from '@/ui/primitives/themed-text';
import { isValidEmail, loggers } from '@/utils';
import { Ionicons } from '@expo/vector-icons';
import { ArrowLeft, LockKeyhole, Mail } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
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

const log = loggers.auth;

interface EmailLoginScreenProps {
  onBack: () => void;
  onLoginSuccess: () => void;
  onForgotPassword: () => void;
}

// Hook personalizado para la lógica de login con email
function useEmailLoginLogic(onLoginSuccess: () => void) {
  const { login, rememberUsername, getRememberedUsername } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberUser, setRememberUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar usuario recordado al montar
  React.useEffect(() => {
    const loadRemembered = async () => {
      const remembered = await getRememberedUsername();
      if (remembered && isValidEmail(remembered)) {
        setEmail(remembered);
        setRememberUser(true);
      }
    };
    loadRemembered();
  }, [getRememberedUsername]);

  const handleLogin = useCallback(async () => {
    setError('');
    
    if (!email.trim()) {
      setError('Ingresa tu correo electrónico');
      return;
    }
    
    if (!isValidEmail(email.trim())) {
      setError('Ingresa un correo electrónico válido');
      return;
    }
    
    if (!password) {
      setError('Ingresa tu contraseña');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await login(email.trim(), password);
      
      if (result.success) {
        if (rememberUser) {
          await rememberUsername(email.trim());
        }
        onLoginSuccess();
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      log.error('Error inesperado en login:', err);
      setError('Error inesperado. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, [email, password, rememberUser, login, rememberUsername, onLoginSuccess]);

  return {
    email, setEmail,
    password, setPassword,
    rememberUser, setRememberUser,
    isLoading, error, setError,
    handleLogin,
  };
}

export function EmailLoginScreen({ onBack, onLoginSuccess, onForgotPassword }: EmailLoginScreenProps) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const insets = useSafeAreaInsets();
  
  const {
    email, setEmail,
    password, setPassword,
    rememberUser, setRememberUser,
    isLoading, error, setError,
    handleLogin,
  } = useEmailLoginLogic(onLoginSuccess);
  
  const [secureTextEntry, setSecureTextEntry] = useState(true);
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
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 20,
            paddingHorizontal: layout.horizontalPadding,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
          <Pressable onPress={onBack} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </Pressable>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(600)}
          style={[styles.content, { maxWidth: containerMaxWidth }]}
        >
          <AuthLogoHeader size="large" showSubtitle />

          <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.form}>
            <View style={styles.stepInfo}>
              <View style={[styles.iconCircle, { backgroundColor: `${theme.tenant.mainColor}15` }]}>
                <Mail size={32} color={theme.tenant.mainColor} />
              </View>
              <ThemedText type="subtitle" style={styles.stepTitle}>
                Iniciar con Email
              </ThemedText>
              <ThemedText style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
                Ingresa tu correo electrónico y contraseña para acceder.
              </ThemedText>
            </View>

            <ThemedInput
              label="Correo electrónico"
              placeholder="correo@ejemplo.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
              autoComplete="email"
              icon={<Mail size={20} color={theme.colors.textSecondary} />}
            />

            <View>
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
                textContentType="password"
                autoComplete="password"
                icon={<LockKeyhole size={20} color={theme.colors.textSecondary} />}
              />
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
            </View>

            {error && (
              <Animated.View entering={FadeInDown.duration(300)}>
                <ThemedText style={styles.errorText}>{error}</ThemedText>
              </Animated.View>
            )}

            <View style={styles.linksRow}>
              <Pressable onPress={onForgotPassword}>
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
              <ThemedText style={styles.rememberText}>Recordar mi correo</ThemedText>
            </Pressable>

            <ThemedButton
              title="Iniciar Sesión"
              onPress={handleLogin}
              variant="primary"
              loading={isLoading}
              disabled={isLoading || !email || !password}
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
    alignItems: 'center',
  },
  header: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  form: {
    width: '100%',
    gap: 16,
  },
  stepInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  stepDescription: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  togglePassword: {
    position: 'absolute',
    right: 16,
    top: 38,
  },
  errorText: {
    color: FeedbackColors.error,
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
  loginButton: {
    marginTop: 8,
  },
});
