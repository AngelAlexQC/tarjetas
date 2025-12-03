import { ThemedText } from '@/components/themed-text';
import { AuthLogoHeader } from '@/components/ui/auth-logo-header';
import { ThemedButton } from '@/components/ui/themed-button';
import { ThemedInput } from '@/components/ui/themed-input';
import { FeedbackColors } from '@/constants';
import { useAppTheme, useRegister, useResponsiveLayout } from '@/hooks';
import { isValidEmail, isValidPassword, isValidPhone } from '@/utils';
import { Ionicons } from '@expo/vector-icons';
import { ArrowLeft, Mail, Phone, ShieldCheck, User, UserPlus } from 'lucide-react-native';
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

type Step = 'form' | 'verification' | 'success';

interface RegisterScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

// Componente para el formulario de registro
interface RegisterFormProps {
  formData: {
    fullName: string;
    email: string;
    phone: string;
    username: string;
    password: string;
    confirmPassword: string;
  };
  setFormData: (data: RegisterFormProps['formData']) => void;
  acceptedTerms: boolean;
  setAcceptedTerms: (value: boolean) => void;
  error: string;
  setError: (value: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
}

function RegisterForm({ 
  formData, setFormData, acceptedTerms, setAcceptedTerms, 
  error, setError, isLoading, onSubmit 
}: RegisterFormProps) {
  const theme = useAppTheme();
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureConfirmEntry, setSecureConfirmEntry] = useState(true);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
    setError('');
  };
  
  return (
    <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.form}>
      <View style={styles.stepInfo}>
        <View style={[styles.iconCircle, { backgroundColor: `${theme.tenant.mainColor}15` }]}>
          <UserPlus size={32} color={theme.tenant.mainColor} />
        </View>
        <ThemedText type="subtitle" style={styles.stepTitle}>
          Crear cuenta
        </ThemedText>
        <ThemedText style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
          Completa tus datos para registrarte en la plataforma.
        </ThemedText>
      </View>

      <ThemedInput
        label="Nombre completo"
        placeholder="Juan Pérez"
        value={formData.fullName}
        onChangeText={(text) => updateField('fullName', text)}
        autoCapitalize="words"
        icon={<User size={20} color={theme.colors.textSecondary} />}
      />

      <ThemedInput
        label="Correo electrónico"
        placeholder="correo@ejemplo.com"
        value={formData.email}
        onChangeText={(text) => updateField('email', text)}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        icon={<Mail size={20} color={theme.colors.textSecondary} />}
      />

      <ThemedInput
        label="Teléfono"
        placeholder="+593 999 999 999"
        value={formData.phone}
        onChangeText={(text) => updateField('phone', text)}
        keyboardType="phone-pad"
        icon={<Phone size={20} color={theme.colors.textSecondary} />}
      />

      <ThemedInput
        label="Nombre de usuario"
        placeholder="juanperez"
        value={formData.username}
        onChangeText={(text) => updateField('username', text.toLowerCase().replace(/\s/g, ''))}
        autoCapitalize="none"
        autoCorrect={false}
        icon={<User size={20} color={theme.colors.textSecondary} />}
      />

      <View>
        <ThemedInput
          label="Contraseña"
          placeholder="••••••••••••"
          value={formData.password}
          onChangeText={(text) => updateField('password', text)}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
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
          value={formData.confirmPassword}
          onChangeText={(text) => updateField('confirmPassword', text)}
          secureTextEntry={secureConfirmEntry}
          autoCapitalize="none"
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

      <Pressable 
        onPress={() => setAcceptedTerms(!acceptedTerms)}
        style={styles.termsRow}
      >
        <Ionicons
          name={acceptedTerms ? 'checkbox' : 'square-outline'}
          size={24}
          color={theme.tenant.mainColor}
        />
        <ThemedText style={styles.termsText}>
          Acepto los{' '}
          <ThemedText style={[styles.termsLink, { color: theme.tenant.mainColor }]}>
            términos y condiciones
          </ThemedText>
          {' '}y la{' '}
          <ThemedText style={[styles.termsLink, { color: theme.tenant.mainColor }]}>
            política de privacidad
          </ThemedText>
        </ThemedText>
      </Pressable>

      {error && (
        <Animated.View entering={FadeInDown.duration(300)}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </Animated.View>
      )}

      <ThemedButton
        title="Crear Cuenta"
        onPress={onSubmit}
        variant="primary"
        loading={isLoading}
        disabled={isLoading || !acceptedTerms}
        style={styles.actionButton}
      />
    </Animated.View>
  );
}

// Componente para el paso de verificación
interface VerificationStepProps {
  email: string;
  code: string;
  setCode: (value: string) => void;
  error: string;
  setError: (value: string) => void;
  isLoading: boolean;
  onVerify: () => void;
  onResend: () => void;
}

function VerificationStep({ 
  email, code, setCode, error, setError, isLoading, onVerify, onResend 
}: VerificationStepProps) {
  const theme = useAppTheme();
  
  return (
    <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.form}>
      <View style={styles.stepInfo}>
        <View style={[styles.iconCircle, { backgroundColor: `${theme.tenant.mainColor}15` }]}>
          <ShieldCheck size={32} color={theme.tenant.mainColor} />
        </View>
        <ThemedText type="subtitle" style={styles.stepTitle}>
          Verifica tu cuenta
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
        title="Verificar"
        onPress={onVerify}
        variant="primary"
        loading={isLoading}
        disabled={isLoading || code.length !== 6}
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
          ¡Cuenta creada!
        </ThemedText>
        <ThemedText style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
          Tu cuenta ha sido creada exitosamente. Ya puedes iniciar sesión.
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

// Función de validación externa
interface FormData {
  fullName: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  confirmPassword: string;
}

const validateRegistrationForm = (formData: FormData, acceptedTerms: boolean): string | null => {
  if (!formData.fullName.trim()) return 'Ingresa tu nombre completo';
  if (!formData.email.trim() || !isValidEmail(formData.email.trim())) return 'Ingresa un correo electrónico válido';
  if (!formData.phone.trim() || !isValidPhone(formData.phone)) return 'Ingresa un número de teléfono válido';
  if (!formData.username.trim() || formData.username.length < 4) return 'El usuario debe tener al menos 4 caracteres';
  if (!isValidPassword(formData.password)) return 'La contraseña debe tener al menos 8 caracteres';
  if (formData.password !== formData.confirmPassword) return 'Las contraseñas no coinciden';
  if (!acceptedTerms) return 'Debes aceptar los términos y condiciones';
  return null;
};

// Hook personalizado para la lógica de registro
function useRegisterLogic() {
  const { register, verifyEmail, resendCode } = useRegister();
  const [step, setStep] = useState<Step>('form');
  const [formData, setFormData] = useState<FormData>({
    fullName: '', email: '', phone: '', username: '', password: '', confirmPassword: '',
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = useCallback(async () => {
    setError('');
    const validationError = validateRegistrationForm(formData, acceptedTerms);
    if (validationError) {
      setError(validationError);
      return;
    }
    setIsLoading(true);
    try {
      const result = await register({
        email: formData.email.trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        username: formData.username.trim(),
      });
      if (result.success) {
        setStep('verification');
      } else {
        setError(result.error || 'Error al crear la cuenta. Intenta de nuevo.');
      }
    } catch {
      setError('Error al crear la cuenta. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, [formData, acceptedTerms, register]);

  const handleVerify = useCallback(async () => {
    setError('');
    if (verificationCode.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }
    setIsLoading(true);
    try {
      const result = await verifyEmail({ 
        email: formData.email.trim(), 
        code: verificationCode 
      });
      if (result.success) {
        setStep('success');
      } else {
        setError(result.error || 'Código incorrecto. Intenta de nuevo.');
      }
    } catch {
      setError('Código incorrecto. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, [verificationCode, formData.email, verifyEmail]);

  const handleResendCode = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await resendCode(formData.email.trim());
      if (result.success) {
        setError('');
      } else {
        setError(result.error || 'Error al reenviar el código.');
      }
    } catch {
      setError('Error al reenviar el código.');
    } finally {
      setIsLoading(false);
    }
  }, [formData.email, resendCode]);

  return {
    step, setStep, formData, setFormData, verificationCode, setVerificationCode,
    acceptedTerms, setAcceptedTerms, isLoading, error, setError,
    handleRegister, handleVerify, handleResendCode,
  };
}

export function RegisterScreen({ onBack, onSuccess }: RegisterScreenProps) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const insets = useSafeAreaInsets();
  
  const logic = useRegisterLogic();
  const containerMaxWidth = Math.min(layout.screenWidth * 0.9, 420);

  const renderStepContent = () => {
    switch (logic.step) {
      case 'form':
        return (
          <RegisterForm 
            formData={logic.formData} 
            setFormData={logic.setFormData} 
            acceptedTerms={logic.acceptedTerms} 
            setAcceptedTerms={logic.setAcceptedTerms} 
            error={logic.error} 
            setError={logic.setError} 
            isLoading={logic.isLoading} 
            onSubmit={logic.handleRegister} 
          />
        );
      case 'verification':
        return (
          <VerificationStep 
            email={logic.formData.email} 
            code={logic.verificationCode} 
            setCode={logic.setVerificationCode} 
            error={logic.error} 
            setError={logic.setError} 
            isLoading={logic.isLoading} 
            onVerify={logic.handleVerify} 
            onResend={logic.handleResendCode} 
          />
        );
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
        {logic.step !== 'success' && (
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
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  termsLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
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
});
