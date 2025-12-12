import { ThemedText } from '@/components/themed-text';
import { AuthLogoHeader } from '@/components/ui/auth-logo-header';
import { ThemedButton } from '@/components/ui/themed-button';
import { ThemedInput } from '@/components/ui/themed-input';
import { FeedbackColors } from '@/constants';
import { useAppTheme, usePasswordRecovery, useResponsiveLayout } from '@/hooks';
import { isValidEmail, isValidPassword } from '@/utils';
import { Ionicons } from '@expo/vector-icons';
import { ArrowLeft, KeyRound, Mail, ShieldCheck } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
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

type Step = 'email' | 'code' | 'newPassword' | 'success';

interface ForgotPasswordScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

// Componente para el paso de email
interface EmailStepProps {
  email: string;
  setEmail: (value: string) => void;
  error: string;
  setError: (value: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
}

function EmailStep({ email, setEmail, error, setError, isLoading, onSubmit }: EmailStepProps) {
  const theme = useAppTheme();
  
  return (
    <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.form}>
      <View style={styles.stepInfo}>
        <View style={[styles.iconCircle, { backgroundColor: `${theme.tenant.mainColor}15` }]}>
          <Mail size={32} color={theme.tenant.mainColor} />
        </View>
        <ThemedText type="subtitle" style={styles.stepTitle}>
          Recupera tu contraseña
        </ThemedText>
        <ThemedText style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
          Ingresa el correo electrónico asociado a tu cuenta y te enviaremos un código de verificación.
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
        icon={<Mail size={20} color={theme.colors.textSecondary} />}
        error={error && !email ? 'Campo requerido' : undefined}
      />

      {error && (
        <Animated.View entering={FadeInDown.duration(300)}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </Animated.View>
      )}

      <ThemedButton
        title="Enviar Código"
        onPress={onSubmit}
        variant="primary"
        loading={isLoading}
        disabled={isLoading || !email}
        style={styles.actionButton}
      />
    </Animated.View>
  );
}

// Componente para el paso de código
interface CodeStepProps {
  email: string;
  code: string;
  setCode: (value: string) => void;
  error: string;
  setError: (value: string) => void;
  isLoading: boolean;
  onVerify: () => void;
  onResend: () => void;
  onChangeEmail: () => void;
}

function CodeStep({ email, code, setCode, error, setError, isLoading, onVerify, onResend, onChangeEmail }: CodeStepProps) {
  const theme = useAppTheme();
  
  return (
    <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.form}>
      <View style={styles.stepInfo}>
        <View style={[styles.iconCircle, { backgroundColor: `${theme.tenant.mainColor}15` }]}>
          <ShieldCheck size={32} color={theme.tenant.mainColor} />
        </View>
        <ThemedText type="subtitle" style={styles.stepTitle}>
          Verifica tu identidad
        </ThemedText>
        <ThemedText style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
          Hemos enviado un código de 6 dígitos a {email}
        </ThemedText>
      </View>

      <ThemedInput
        label="Código de verificación"
        placeholder="000000"
        value={code}
        onChangeText={(text) => {
          setCode(text.replace(/[^0-9]/g, '').slice(0, 6));
          setError('');
        }}
        keyboardType="number-pad"
        maxLength={6}
        icon={<ShieldCheck size={20} color={theme.colors.textSecondary} />}
      />

      {error && (
        <Animated.View entering={FadeInDown.duration(300)}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </Animated.View>
      )}

      <Pressable onPress={onResend} disabled={isLoading}>
        <ThemedText style={[styles.link, { color: theme.tenant.mainColor }]}>
          ¿No recibiste el código? Reenviar
        </ThemedText>
      </Pressable>

      <ThemedButton
        title="Verificar Código"
        onPress={onVerify}
        variant="primary"
        loading={isLoading}
        disabled={isLoading || code.length !== 6}
        style={styles.actionButton}
      />

      <ThemedButton
        title="Cambiar correo"
        onPress={onChangeEmail}
        variant="outline"
        disabled={isLoading}
        style={styles.secondaryButton}
      />
    </Animated.View>
  );
}

// Componente para el paso de nueva contraseña
interface NewPasswordStepProps {
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  error: string;
  setError: (value: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
}

function NewPasswordStep({ 
  newPassword, setNewPassword, confirmPassword, setConfirmPassword, 
  error, setError, isLoading, onSubmit 
}: NewPasswordStepProps) {
  const theme = useAppTheme();
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureConfirmEntry, setSecureConfirmEntry] = useState(true);
  
  return (
    <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.form}>
      <View style={styles.stepInfo}>
        <View style={[styles.iconCircle, { backgroundColor: `${theme.tenant.mainColor}15` }]}>
          <KeyRound size={32} color={theme.tenant.mainColor} />
        </View>
        <ThemedText type="subtitle" style={styles.stepTitle}>
          Nueva contraseña
        </ThemedText>
        <ThemedText style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
          Crea una contraseña segura de al menos 8 caracteres.
        </ThemedText>
      </View>

      <View>
        <ThemedInput
          label="Nueva contraseña"
          placeholder="••••••••••••"
          value={newPassword}
          onChangeText={(text) => {
            setNewPassword(text);
            setError('');
          }}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          icon={<KeyRound size={20} color={theme.colors.textSecondary} />}
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

      <View>
        <ThemedInput
          label="Confirmar contraseña"
          placeholder="••••••••••••"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setError('');
          }}
          secureTextEntry={secureConfirmEntry}
          autoCapitalize="none"
          icon={<KeyRound size={20} color={theme.colors.textSecondary} />}
        />
        <Pressable
          onPress={() => setSecureConfirmEntry(!secureConfirmEntry)}
          style={styles.togglePassword}
        >
          <Ionicons
            name={secureConfirmEntry ? 'eye-off-outline' : 'eye-outline'}
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

      <ThemedButton
        title="Cambiar Contraseña"
        onPress={onSubmit}
        variant="primary"
        loading={isLoading}
        disabled={isLoading || !newPassword || !confirmPassword}
        style={styles.actionButton}
      />
    </Animated.View>
  );
}

// Componente para el paso de éxito
interface SuccessStepProps {
  onSuccess: () => void;
}

function SuccessStep({ onSuccess }: SuccessStepProps) {
  const theme = useAppTheme();
  
  return (
    <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.form}>
      <View style={styles.stepInfo}>
        <View style={[styles.successCircle, { backgroundColor: '#10b981' }]}>
          <Ionicons name="checkmark" size={48} color="#FFFFFF" />
        </View>
        <ThemedText type="subtitle" style={styles.stepTitle}>
          ¡Contraseña actualizada!
        </ThemedText>
        <ThemedText style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
          Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
        </ThemedText>
      </View>

      <ThemedButton
        title="Iniciar Sesión"
        onPress={onSuccess}
        variant="primary"
        style={styles.actionButton}
      />
    </Animated.View>
  );
}

// eslint-disable-next-line max-lines-per-function
export function ForgotPasswordScreen({ onBack, onSuccess }: ForgotPasswordScreenProps) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const insets = useSafeAreaInsets();
  const { sendRecoveryCode, verifyCode, resetPassword } = usePasswordRecovery();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = useCallback(async () => {
    setError('');
    if (!email.trim()) {
      const errorMessage = 'Ingresa tu correo electrónico';
      setError(errorMessage);
      Alert.alert('Campo requerido', errorMessage, [{ text: 'OK' }]);
      return;
    }
    if (!isValidEmail(email.trim())) {
      const errorMessage = 'Ingresa un correo electrónico válido';
      setError(errorMessage);
      Alert.alert('Correo inválido', errorMessage, [{ text: 'OK' }]);
      return;
    }
    setIsLoading(true);
    try {
      const result = await sendRecoveryCode({ email: email.trim() });
      if (result.success) {
        setStep('code');
      } else {
        const errorMessage = result.error || 'Error al enviar el código. Intenta de nuevo.';
        setError(errorMessage);
        Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
      }
    } catch {
      const errorMessage = 'Error al enviar el código. Intenta de nuevo.';
      setError(errorMessage);
      Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
    } finally {
      setIsLoading(false);
    }
  }, [email, sendRecoveryCode]);

  const handleVerifyCode = useCallback(async () => {
    setError('');
    if (!code.trim()) {
      const errorMessage = 'Ingresa el código de verificación';
      setError(errorMessage);
      Alert.alert('Campo requerido', errorMessage, [{ text: 'OK' }]);
      return;
    }
    if (code.trim().length !== 6) {
      const errorMessage = 'El código debe tener 6 dígitos';
      setError(errorMessage);
      Alert.alert('Código incompleto', errorMessage, [{ text: 'OK' }]);
      return;
    }
    setIsLoading(true);
    try {
      const result = await verifyCode({ email: email.trim(), code: code.trim() });
      if (result.success) {
        setStep('newPassword');
      } else {
        const errorMessage = result.error || 'Código incorrecto. Intenta de nuevo.';
        setError(errorMessage);
        Alert.alert('Error de verificación', errorMessage, [{ text: 'OK' }]);
      }
    } catch {
      const errorMessage = 'Código incorrecto. Intenta de nuevo.';
      setError(errorMessage);
      Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
    } finally {
      setIsLoading(false);
    }
  }, [code, email, verifyCode]);

  const handleResetPassword = useCallback(async () => {
    setError('');
    if (!newPassword.trim()) {
      const errorMessage = 'Ingresa tu nueva contraseña';
      setError(errorMessage);
      Alert.alert('Campo requerido', errorMessage, [{ text: 'OK' }]);
      return;
    }
    if (!isValidPassword(newPassword)) {
      const errorMessage = 'La contraseña debe tener al menos 8 caracteres';
      setError(errorMessage);
      Alert.alert('Contraseña inválida', errorMessage, [{ text: 'OK' }]);
      return;
    }
    if (newPassword !== confirmPassword) {
      const errorMessage = 'Las contraseñas no coinciden';
      setError(errorMessage);
      Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
      return;
    }
    setIsLoading(true);
    try {
      const result = await resetPassword({ 
        email: email.trim(), 
        code: code.trim(), 
        newPassword 
      });
      if (result.success) {
        setStep('success');
      } else {
        const errorMessage = result.error || 'Error al cambiar la contraseña. Intenta de nuevo.';
        setError(errorMessage);
        Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
      }
    } catch {
      const errorMessage = 'Error al cambiar la contraseña. Intenta de nuevo.';
      setError(errorMessage);
      Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
    } finally {
      setIsLoading(false);
    }
  }, [newPassword, confirmPassword, email, code, resetPassword]);

  const handleResendCode = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await sendRecoveryCode({ email: email.trim() });
      if (result.success) {
        setError('');
        Alert.alert('Código reenviado', 'Se ha enviado un nuevo código a tu correo', [{ text: 'OK' }]);
      } else {
        const errorMessage = result.error || 'Error al reenviar el código.';
        setError(errorMessage);
        Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
      }
    } catch {
      const errorMessage = 'Error al reenviar el código.';
      setError(errorMessage);
      Alert.alert('Error', errorMessage, [{ text: 'OK' }]);
    } finally {
      setIsLoading(false);
    }
  }, [email, sendRecoveryCode]);

  const containerMaxWidth = Math.min(layout.screenWidth * 0.9, 420);

  const renderStepContent = () => {
    switch (step) {
      case 'email':
        return <EmailStep email={email} setEmail={setEmail} error={error} setError={setError} isLoading={isLoading} onSubmit={handleSendCode} />;
      case 'code':
        return <CodeStep email={email} code={code} setCode={setCode} error={error} setError={setError} isLoading={isLoading} onVerify={handleVerifyCode} onResend={handleResendCode} onChangeEmail={() => setStep('email')} />;
      case 'newPassword':
        return <NewPasswordStep newPassword={newPassword} setNewPassword={setNewPassword} confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword} error={error} setError={setError} isLoading={isLoading} onSubmit={handleResetPassword} />;
      case 'success':
        return <SuccessStep onSuccess={onSuccess} />;
      default:
        return null;
    }
  };

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
        {step !== 'success' && (
          <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
            <Pressable onPress={onBack} style={styles.backButton}>
              <ArrowLeft size={24} color={theme.colors.text} />
            </Pressable>
          </Animated.View>
        )}

        <Animated.View
          entering={FadeInUp.duration(600)}
          style={[styles.content, { maxWidth: containerMaxWidth }]}
        >
          <AuthLogoHeader size="medium" />
          {renderStepContent()}
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
  form: {
    width: '100%',
    gap: 16,
  },
  stepInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
  link: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  actionButton: {
    marginTop: 8,
  },
  secondaryButton: {
    marginTop: 4,
  },
});
