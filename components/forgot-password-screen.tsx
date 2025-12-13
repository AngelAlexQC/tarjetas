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

// Helper function to show error alerts
const showErrorAlert = (title: string, message: string) => {
  Alert.alert(title, message, [{ text: 'OK' }]);
};

// Helper function to handle validation errors
const handleValidationError = (
  errorMessage: string,
  alertTitle: string,
  setError: (error: string) => void
) => {
  setError(errorMessage);
  showErrorAlert(alertTitle, errorMessage);
};

// Helper function to handle async operation errors
const handleAsyncError = (
  error: string | undefined,
  defaultMessage: string,
  alertTitle: string,
  setError: (error: string) => void
) => {
  const errorMessage = error || defaultMessage;
  setError(errorMessage);
  showErrorAlert(alertTitle, errorMessage);
};

// Helper function to render step content based on current step
function getStepContent(
  step: Step,
  state: {
    email: string;
    setEmail: (value: string) => void;
    code: string;
    setCode: (value: string) => void;
    newPassword: string;
    setNewPassword: (value: string) => void;
    confirmPassword: string;
    setConfirmPassword: (value: string) => void;
    error: string;
    setError: (value: string) => void;
    isLoading: boolean;
  },
  handlers: {
    handleSendCode: () => void;
    handleVerifyCode: () => void;
    handleResetPassword: () => void;
    handleResendCode: () => void;
    onChangeEmail: () => void;
    onSuccess: () => void;
  }
) {
  switch (step) {
    case 'email':
      return (
        <EmailStep
          email={state.email}
          setEmail={state.setEmail}
          error={state.error}
          setError={state.setError}
          isLoading={state.isLoading}
          onSubmit={handlers.handleSendCode}
        />
      );
    case 'code':
      return (
        <CodeStep
          email={state.email}
          code={state.code}
          setCode={state.setCode}
          error={state.error}
          setError={state.setError}
          isLoading={state.isLoading}
          onVerify={handlers.handleVerifyCode}
          onResend={handlers.handleResendCode}
          onChangeEmail={handlers.onChangeEmail}
        />
      );
    case 'newPassword':
      return (
        <NewPasswordStep
          newPassword={state.newPassword}
          setNewPassword={state.setNewPassword}
          confirmPassword={state.confirmPassword}
          setConfirmPassword={state.setConfirmPassword}
          error={state.error}
          setError={state.setError}
          isLoading={state.isLoading}
          onSubmit={handlers.handleResetPassword}
        />
      );
    case 'success':
      return <SuccessStep onSuccess={handlers.onSuccess} />;
    default:
      return null;
  }
}

// Helper component to render the back button header
interface BackHeaderProps {
  onBack: () => void;
  showBackButton: boolean;
}

function BackHeader({ onBack, showBackButton }: BackHeaderProps) {
  const theme = useAppTheme();
  
  if (!showBackButton) {
    return null;
  }
  
  return (
    <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
      <Pressable onPress={onBack} style={styles.backButton}>
        <ArrowLeft size={24} color={theme.colors.text} />
      </Pressable>
    </Animated.View>
  );
}

// Custom hook for password recovery handlers
function usePasswordRecoveryHandlers(
  email: string,
  code: string,
  newPassword: string,
  confirmPassword: string,
  setStep: (step: Step) => void,
  setError: (error: string) => void,
  setIsLoading: (loading: boolean) => void
) {
  const { sendRecoveryCode, verifyCode, resetPassword } = usePasswordRecovery();

  const handleSendCode = useCallback(async () => {
    setError('');
    
    if (!email.trim()) {
      handleValidationError('Ingresa tu correo electrónico', 'Campo requerido', setError);
      return;
    }
    
    if (!isValidEmail(email.trim())) {
      handleValidationError('Ingresa un correo electrónico válido', 'Correo inválido', setError);
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await sendRecoveryCode({ email: email.trim() });
      if (result.success) {
        setStep('code');
      } else {
        handleAsyncError(result.error, 'Error al enviar el código. Intenta de nuevo.', 'Error', setError);
      }
    } catch {
      handleAsyncError(undefined, 'Error al enviar el código. Intenta de nuevo.', 'Error', setError);
    } finally {
      setIsLoading(false);
    }
  }, [email, sendRecoveryCode, setError, setIsLoading, setStep]);

  const handleVerifyCode = useCallback(async () => {
    setError('');
    
    if (!code.trim()) {
      handleValidationError('Ingresa el código de verificación', 'Campo requerido', setError);
      return;
    }
    
    if (code.trim().length !== 6) {
      handleValidationError('El código debe tener 6 dígitos', 'Código incompleto', setError);
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await verifyCode({ email: email.trim(), code: code.trim() });
      if (result.success) {
        setStep('newPassword');
      } else {
        handleAsyncError(result.error, 'Código incorrecto. Intenta de nuevo.', 'Error de verificación', setError);
      }
    } catch {
      handleAsyncError(undefined, 'Código incorrecto. Intenta de nuevo.', 'Error', setError);
    } finally {
      setIsLoading(false);
    }
  }, [code, email, verifyCode, setError, setIsLoading, setStep]);

  const handleResetPassword = useCallback(async () => {
    setError('');
    
    if (!newPassword.trim()) {
      handleValidationError('Ingresa tu nueva contraseña', 'Campo requerido', setError);
      return;
    }
    
    if (!isValidPassword(newPassword)) {
      handleValidationError('La contraseña debe tener al menos 8 caracteres', 'Contraseña inválida', setError);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      handleValidationError('Las contraseñas no coinciden', 'Error', setError);
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
        handleAsyncError(result.error, 'Error al cambiar la contraseña. Intenta de nuevo.', 'Error', setError);
      }
    } catch {
      handleAsyncError(undefined, 'Error al cambiar la contraseña. Intenta de nuevo.', 'Error', setError);
    } finally {
      setIsLoading(false);
    }
  }, [newPassword, confirmPassword, email, code, resetPassword, setError, setIsLoading, setStep]);

  const handleResendCode = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await sendRecoveryCode({ email: email.trim() });
      if (result.success) {
        setError('');
        showErrorAlert('Código reenviado', 'Se ha enviado un nuevo código a tu correo');
      } else {
        handleAsyncError(result.error, 'Error al reenviar el código.', 'Error', setError);
      }
    } catch {
      handleAsyncError(undefined, 'Error al reenviar el código.', 'Error', setError);
    } finally {
      setIsLoading(false);
    }
  }, [email, sendRecoveryCode, setError, setIsLoading]);

  return {
    handleSendCode,
    handleVerifyCode,
    handleResetPassword,
    handleResendCode,
  };
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

export function ForgotPasswordScreen({ onBack, onSuccess }: ForgotPasswordScreenProps) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    handleSendCode,
    handleVerifyCode,
    handleResetPassword,
    handleResendCode,
  } = usePasswordRecoveryHandlers(
    email,
    code,
    newPassword,
    confirmPassword,
    setStep,
    setError,
    setIsLoading
  );

  const containerMaxWidth = Math.min(layout.screenWidth * 0.9, 420);
  const stepContent = getStepContent(
    step,
    {
      email,
      setEmail,
      code,
      setCode,
      newPassword,
      setNewPassword,
      confirmPassword,
      setConfirmPassword,
      error,
      setError,
      isLoading,
    },
    {
      handleSendCode,
      handleVerifyCode,
      handleResetPassword,
      handleResendCode,
      onChangeEmail: () => setStep('email'),
      onSuccess,
    }
  );

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
        <BackHeader onBack={onBack} showBackButton={step !== 'success'} />
        <Animated.View
          entering={FadeInUp.duration(600)}
          style={[styles.content, { maxWidth: containerMaxWidth }]}
        >
          <AuthLogoHeader size="medium" />
          {stepContent}
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
