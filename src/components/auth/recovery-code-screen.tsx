
import { ThemedText } from '@/ui/primitives/themed-text';
import { ThemedButton } from '@/ui/primitives/themed-button';
import { ThemedInput } from '@/ui/primitives/themed-input';
import { FeedbackColors } from '@/constants';
import { useAppTheme } from '@/hooks';
import { ShieldCheck } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface RecoveryCodeScreenProps {
  identifier?: string; // e.g., email or masked phone
  code: string;
  setCode: (value: string) => void;
  error: string;
  setError: (value: string) => void;
  isLoading: boolean;
  onVerify: () => void;
  onResend: () => void;
  onChangeIdentifier: () => void;
}

export function RecoveryCodeScreen({ 
  identifier, code, setCode, error, setError, isLoading, onVerify, onResend, onChangeIdentifier 
}: RecoveryCodeScreenProps) {
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
          Hemos enviado un código de 6 dígitos a tus medios de contacto registrados{identifier ? ` (${identifier})` : ''}.
        </ThemedText>
      </View>

      <ThemedInput
        label="Código de verificación"
        placeholder="000000"
        value={code}
        onChangeText={(text: string) => {
          setCode(text.replace(/[^0-9]/g, '').slice(0, 6));
          setError('');
        }}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
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
        title="Cambiar método"
        onPress={onChangeIdentifier}
        variant="outline"
        disabled={isLoading}
        style={styles.secondaryButton}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  form: { width: '100%', gap: 16 },
  stepInfo: { alignItems: 'center', marginBottom: 24 },
  iconCircle: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  stepTitle: { textAlign: 'center', marginBottom: 8 },
  stepDescription: { textAlign: 'center', fontSize: 14, lineHeight: 20, paddingHorizontal: 16 },
  errorText: { color: FeedbackColors.error, fontSize: 14, textAlign: 'center', marginTop: -8 },
  link: { fontSize: 14, fontWeight: '500', textAlign: 'center' },
  actionButton: { marginTop: 8 },
  secondaryButton: { marginTop: 4 },
});
