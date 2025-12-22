import { OTPScreen } from '@/components/otp-screen';
import { AuthLogoHeader } from '@/components/ui/auth-logo-header';
import { useRegister } from '@/hooks'; // Keep useRegister from original hooks
import { ThemedText } from '@/ui/primitives/themed-text';
import { ArrowLeft } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Pasos importados
import { RegisterAccountSetupStep } from '@/components/auth/register-account-setup-step';
import { RegisterClientVerificationStep } from '@/components/auth/register-client-verification-step';
import { RegisterIdentificationStep } from '@/components/auth/register-identification-step';
import { isValidEmail, isValidPassword, isValidPhone } from '@/country/common/validators';
import { ThemedButton } from '@/ui/primitives/themed-button';
import { useAppTheme, useResponsiveLayout } from '@/ui/theming';
import { Ionicons } from '@expo/vector-icons';

type Step = 'identification' | 'client-verification' | 'account-setup' | 'otp' | 'success';

interface RegisterScreenProps {
  onBack: () => void;
  onSuccess: () => void;
}

// Hook personalizado para la lógica del nuevo flujo
function useRegisterFlow() {
  const { register, verifyEmail, resendCode, validateClient } = useRegister();
  const [step, setStep] = useState<Step>('identification');
  
  // State for Step 1
  const [documentId, setDocumentId] = useState('');
  const [birthDate, setBirthDate] = useState('');
  
  // State for Step 2
  const [clientName, setClientName] = useState('');
  
  // State for Step 3
  const [accountData, setAccountData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  // Common State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [_verificationCode, _setVerificationCode] = useState('');

  // Step 1: Validate Identity
  const handleValidateClient = useCallback(async () => {
    setError('');
    setIsLoading(true);
    try {
      // Usamos CC por defecto para este ejemplo, pero podría ser configurable
      const result = await validateClient({
        documentType: 'CC', 
        documentId, 
        birthDate
      });
      
      if (result.success && result.data?.clientName) {
        setClientName(result.data.clientName);
        setStep('client-verification');
      } else {
        setError(result.error || result.data?.message || 'Cliente no encontrado o datos incorrectos');
      }
    } catch (e: any) {
      setError(e.message || 'Error al validar cliente');
    } finally {
      setIsLoading(false);
    }
  }, [documentId, birthDate, validateClient]);

  // Step 2: Confirm Identity
  const handleConfirmIdentity = () => setStep('account-setup');

  // Step 3: Create Account
  const handleCreateAccount = useCallback(async () => {
    setError('');
    
    // Validations
    if (!isValidEmail(accountData.email)) {
      setError('Email inválido');
      return;
    }
    if (!isValidPhone(accountData.phone)) {
      setError('Teléfono inválido');
      return;
    }
    if (accountData.username.length < 4) {
      setError('El usuario debe tener al menos 4 caracteres');
      return;
    }
    if (!isValidPassword(accountData.password)) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (accountData.password !== accountData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    try {
      const result = await register({
        fullName: clientName, // Use validated name
        email: accountData.email,
        phone: accountData.phone,
        username: accountData.username,
        password: accountData.password,
        documentId,
        documentType: 'CC'
      });

      if (result.success) {
        setStep('otp');
      } else {
        setError(result.error || 'Error al crear cuenta');
      }
    } catch (_e: unknown) {
      setError('Error al crear cuenta');
    } finally {
      setIsLoading(false);
    }
  }, [accountData, clientName, documentId, register]);

  // Step 4: OTP
  const handleVerifyOtp = useCallback(async (code: string) => { // Accept code as arg
    setError('');
    if (code.length !== 6) {
        setError('El código debe tener 6 dígitos');
        return;
    }
    setIsLoading(true);
    try {
      const result = await verifyEmail({
        email: accountData.email,
        code: code
      });
      
      if (result.success) {
        setStep('success');
      } else {
        setError(result.error || 'Código incorrecto');
      }
    } catch (_e: unknown) {
      setError('Código incorrecto');
    } finally {
      setIsLoading(false);
    }
  }, [accountData.email, verifyEmail]);

  const handleResendOtp = useCallback(async () => {
     setIsLoading(true);
     await resendCode(accountData.email);
     setIsLoading(false);
  }, [accountData.email, resendCode]);

  return {
    step, setStep,
    documentId, setDocumentId,
    birthDate, setBirthDate,
    clientName, 
    accountData, setAccountData,
    isLoading, error, setError,
    handleValidateClient,
    handleConfirmIdentity,
    handleCreateAccount,
    handleVerifyOtp,
    handleResendOtp
  };
}

export function RegisterScreen({ onBack, onSuccess }: RegisterScreenProps) {
  const { colors } = useAppTheme();
  const { horizontalPadding } = useResponsiveLayout();
  const insets = useSafeAreaInsets();
  
  const logic = useRegisterFlow();
  const containerMaxWidth = Math.min(800, 420);

  const renderContent = () => {
    switch (logic.step) {
      case 'identification':
        return (
          <RegisterIdentificationStep
            documentId={logic.documentId}
            setDocumentId={logic.setDocumentId}
            birthDate={logic.birthDate}
            setBirthDate={logic.setBirthDate}
            onContinue={logic.handleValidateClient}
            isLoading={logic.isLoading}
          />
        );
      case 'client-verification':
        return (
          <RegisterClientVerificationStep
            clientName={logic.clientName}
            onConfirm={logic.handleConfirmIdentity}
            onBack={() => logic.setStep('identification')}
          />
        );
      case 'account-setup':
        return (
          <RegisterAccountSetupStep
            formData={logic.accountData}
            setFormData={logic.setAccountData}
            onSubmit={logic.handleCreateAccount}
            isLoading={logic.isLoading}
            error={logic.error}
            setError={logic.setError}
          />
        );
      case 'otp':
        return (
           <OTPScreen 
            email={logic.accountData.email} 
            onVerify={logic.handleVerifyOtp}
            onResend={logic.handleResendOtp}
            isLoading={logic.isLoading} 
            error={logic.error} 
            setError={logic.setError} 
          />
        );
      case 'success':
        return (
           <Animated.View entering={FadeInUp.duration(600)} style={styles.successContainer}>
              <View style={[styles.successCircle, { backgroundColor: '#10b981' }]}>
                <Ionicons name="checkmark" size={48} color="#FFFFFF" />
              </View>
              <ThemedText type="subtitle" style={styles.successTitle}>
                ¡Registro Completo!
              </ThemedText>
              <ThemedText style={[styles.successDesc, { color: colors.textSecondary }]}>
                 Tu cuenta ha sido creada y verificada exitosamente.
              </ThemedText>
              <ThemedButton 
                title="Iniciar Sesión" 
                onPress={onSuccess} 
                variant="primary" 
                style={{ width: '100%', marginTop: 20 }}
              />
           </Animated.View>
        );
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 20,
            paddingBottom: insets.bottom + 20,
            paddingHorizontal: horizontalPadding,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {logic.step !== 'success' && (
          <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
            <Pressable onPress={logic.step === 'identification' ? onBack : () => logic.setStep('identification')} style={styles.backButton}>
              <ArrowLeft size={24} color={colors.text} />
            </Pressable>
          </Animated.View>
        )}

        <Animated.View
          entering={FadeInUp.duration(600)}
          style={[styles.content, { maxWidth: containerMaxWidth }]}
        >
          <AuthLogoHeader size="medium" />
          {renderContent()}
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
  successContainer: {
    width: '100%',
    alignItems: 'center',
    padding: 20,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    marginBottom: 10,
    textAlign: 'center',
  },
  successDesc: {
    textAlign: 'center',
    marginBottom: 20,
  },
});
