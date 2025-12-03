import { ThemedText } from '@/components/themed-text';
import { AuthLogoHeader } from '@/components/ui/auth-logo-header';
import { ThemedButton } from '@/components/ui/themed-button';
import { ThemedInput } from '@/components/ui/themed-input';
import { FeedbackColors } from '@/constants';
import { useAuth } from '@/contexts/auth-context';
import { useAppTheme, useResponsiveLayout } from '@/hooks';
import { loggers } from '@/utils';
import { Ionicons } from '@expo/vector-icons';
import { LockKeyhole, Mail, User } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
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

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onForgotPassword?: () => void;
  onRegister?: () => void;
  onEmailLogin?: () => void;
}

// Hook personalizado para la lógica de login
function useLoginLogic(onLoginSuccess: () => void) {
  const { login, getRememberedUsername, rememberUsername, clearRememberedUsername } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberUser, setRememberUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar usuario recordado al montar
  useEffect(() => {
    const loadRemembered = async () => {
      const remembered = await getRememberedUsername();
      if (remembered) {
        setUsername(remembered);
        setRememberUser(true);
      }
    };
    loadRemembered();
  }, [getRememberedUsername]);

  const handleLogin = useCallback(async () => {
    setError('');
    setIsLoading(true);

    try {
      const result = await login(username.trim(), password);

      if (result.success) {
        if (rememberUser) {
          await rememberUsername(username.trim());
        } else {
          await clearRememberedUsername();
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
  }, [username, password, rememberUser, login, rememberUsername, clearRememberedUsername, onLoginSuccess]);

  return {
    username, setUsername,
    password, setPassword,
    rememberUser, setRememberUser,
    isLoading, error, setError,
    handleLogin,
  };
}

export function LoginScreen({ 
  onLoginSuccess, 
  onForgotPassword, 
  onRegister, 
  onEmailLogin 
}: LoginScreenProps) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const insets = useSafeAreaInsets();

  const {
    username, setUsername,
    password, setPassword,
    rememberUser, setRememberUser,
    isLoading, error, setError,
    handleLogin,
  } = useLoginLogic(onLoginSuccess);

  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const handleForgotPassword = () => {
    if (onForgotPassword) {
      onForgotPassword();
    } else {
      Alert.alert(
        'Recuperar Contraseña',
        'Por favor contacta a tu institución financiera para recuperar tu contraseña.',
        [{ text: 'Entendido' }]
      );
    }
  };

  const handleRegister = () => {
    if (onRegister) {
      onRegister();
    } else {
      Alert.alert(
        'Registro',
        'Para crear una cuenta, visita la sucursal más cercana de tu institución financiera o descarga la app de registro.',
        [{ text: 'Entendido' }]
      );
    }
  };

  const handleEmailLogin = () => {
    if (onEmailLogin) {
      onEmailLogin();
    } else {
      Alert.alert(
        'Próximamente',
        'El inicio de sesión con email estará disponible pronto.',
        [{ text: 'Entendido' }]
      );
    }
  };

  const containerMaxWidth = Math.min(layout.screenWidth * 0.9, 420);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20, paddingHorizontal: layout.horizontalPadding },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInUp.duration(600)} style={[styles.content, { maxWidth: containerMaxWidth }]}>
          <AuthLogoHeader size="large" showSubtitle />
          <LoginForm
            username={username}
            setUsername={(text) => { setUsername(text); setError(''); }}
            password={password}
            setPassword={(text) => { setPassword(text); setError(''); }}
            rememberUser={rememberUser}
            setRememberUser={setRememberUser}
            secureTextEntry={secureTextEntry}
            setSecureTextEntry={setSecureTextEntry}
            isLoading={isLoading}
            error={error}
            onLogin={handleLogin}
            onForgotPassword={handleForgotPassword}
            onRegister={handleRegister}
            onEmailLogin={handleEmailLogin}
          />
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Componente del formulario de login
interface LoginFormProps {
  username: string;
  setUsername: (text: string) => void;
  password: string;
  setPassword: (text: string) => void;
  rememberUser: boolean;
  setRememberUser: (value: boolean) => void;
  secureTextEntry: boolean;
  setSecureTextEntry: (value: boolean) => void;
  isLoading: boolean;
  error: string;
  onLogin: () => void;
  onForgotPassword: () => void;
  onRegister: () => void;
  onEmailLogin: () => void;
}

function LoginForm({
  username, setUsername, password, setPassword, rememberUser, setRememberUser,
  secureTextEntry, setSecureTextEntry, isLoading, error, onLogin, onForgotPassword, onRegister, onEmailLogin,
}: LoginFormProps) {
  const theme = useAppTheme();

  return (
    <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.form}>
      <ThemedInput
        label="Nombre de usuario"
        placeholder="Sofi"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        icon={<User size={20} color={theme.colors.textSecondary} />}
        error={error && !username ? 'Campo requerido' : undefined}
      />

      <ThemedInput
        label="Contraseña"
        placeholder="••••••••••••"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        icon={<LockKeyhole size={20} color={theme.colors.textSecondary} />}
        error={error && !password ? 'Campo requerido' : undefined}
      />

      <Pressable onPress={() => setSecureTextEntry(!secureTextEntry)} style={styles.togglePassword}>
        <Ionicons name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.colors.textSecondary} />
      </Pressable>

      {error && (
        <Animated.View entering={FadeInDown.duration(300)}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </Animated.View>
      )}

      <View style={styles.linksRow}>
        <Pressable onPress={onForgotPassword}>
          <ThemedText style={[styles.link, { color: theme.tenant.mainColor }]}>Olvidé mi contraseña</ThemedText>
        </Pressable>
      </View>

      <Pressable onPress={() => setRememberUser(!rememberUser)} style={styles.rememberRow}>
        <Ionicons name={rememberUser ? 'checkbox' : 'square-outline'} size={24} color={theme.tenant.mainColor} />
        <ThemedText style={styles.rememberText}>Recordar mi usuario</ThemedText>
      </Pressable>

      <Pressable onPress={onRegister}>
        <ThemedText style={[styles.link, { color: theme.tenant.mainColor }]}>Registro</ThemedText>
      </Pressable>

      <ThemedButton
        title="Ingrese con tu email"
        onPress={onEmailLogin}
        variant="outline"
        icon={<Mail size={20} color={theme.tenant.mainColor} />}
        style={styles.emailButton}
      />

      <ThemedButton
        title="Continuar"
        onPress={onLogin}
        variant="primary"
        loading={isLoading}
        disabled={isLoading || !username || !password}
        style={styles.loginButton}
      />
    </Animated.View>
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
  emailButton: {
    marginTop: 8,
  },
  loginButton: {
    marginTop: 8,
  },
});
