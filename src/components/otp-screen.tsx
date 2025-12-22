import { FeedbackColors } from '@/constants';
import { ThemedButton } from '@/ui/primitives/themed-button';
import { ThemedText } from '@/ui/primitives/themed-text';
import { useAppTheme } from '@/ui/theming';
import { ShieldCheck } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface OTPScreenProps {
  email: string;
  onVerify: (code: string) => void;
  onResend: () => void;
  isLoading: boolean;
  error: string;
  setError: (value: string) => void;
}

export function OTPScreen({ email, onVerify, onResend, isLoading, error, setError }: OTPScreenProps) {
  const theme = useAppTheme();
  const [code, setCode] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleCodeChange = (text: string) => {
    const newCode = text.replace(/[^0-9]/g, '').slice(0, 6);
    setCode(newCode);
    setError('');
    
    if (newCode.length === 6) {
      onVerify(newCode);
    }
  };

  return (
    <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: `${theme.tenant.mainColor}15` }]}>
          <ShieldCheck size={32} color={theme.tenant.mainColor} />
        </View>
        <ThemedText type="subtitle" style={styles.title}>
          Verifica tu cuenta
        </ThemedText>
        <ThemedText style={[styles.description, { color: theme.colors.textSecondary }]}>
          Hemos enviado un código de 6 dígitos a {email}
        </ThemedText>
      </View>

      <Pressable style={styles.inputWrapper} onPress={() => inputRef.current?.focus()}>
        <View style={styles.codeContainer}>
          {[...Array(6)].map((_, index) => (
            <View
              key={index}
              style={[
                styles.codeBox,
                { 
                  borderColor: error ? FeedbackColors.error : theme.colors.border,
                  backgroundColor: theme.colors.surface,
                },
                code.length === index && { borderColor: theme.tenant.mainColor, borderWidth: 2 }
              ]}
            >
              <ThemedText style={styles.codeText}>
                {code[index] || ''}
              </ThemedText>
            </View>
          ))}
        </View>
        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={handleCodeChange}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          maxLength={6}
          style={styles.hiddenInput}
          autoFocus
        />
      </Pressable>

      {error ? (
        <Animated.View entering={FadeInDown.duration(300)}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </Animated.View>
      ) : null}

      <Pressable onPress={onResend} disabled={isLoading} style={styles.resendButton}>
        <ThemedText style={[styles.link, { color: theme.tenant.mainColor }]}>
          ¿No recibiste el código? Reenviar
        </ThemedText>
      </Pressable>

      <ThemedButton
        title="Verificar"
        onPress={() => onVerify(code)}
        variant="primary"
        loading={isLoading}
        disabled={isLoading || code.length !== 6}
        style={styles.verifyButton}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    gap: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  inputWrapper: {
    width: '100%',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  codeBox: {
    width: 44,
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeText: {
    fontSize: 24,
    fontWeight: '600',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  errorText: {
    color: FeedbackColors.error,
    fontSize: 14,
    textAlign: 'center',
  },
  resendButton: {
    padding: 8,
  },
  link: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  verifyButton: {
    width: '100%',
  },
});
