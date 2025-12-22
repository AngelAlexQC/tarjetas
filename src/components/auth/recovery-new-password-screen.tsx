
import { ThemedText } from '@/components/themed-text';
import { ThemedButton } from '@/components/ui/themed-button';
import { ThemedInput } from '@/components/ui/themed-input';
import { FeedbackColors } from '@/constants';
import { useAppTheme } from '@/hooks';
import { Ionicons } from '@expo/vector-icons';
import { KeyRound } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface RecoveryNewPasswordScreenProps {
  newPassword: string;
  setNewPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;
  error: string;
  setError: (value: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
}

export function RecoveryNewPasswordScreen({ 
  newPassword, setNewPassword, confirmPassword, setConfirmPassword, 
  error, setError, isLoading, onSubmit 
}: RecoveryNewPasswordScreenProps) {
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
          textContentType="newPassword"
          autoComplete="password-new"
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
          textContentType="newPassword"
          autoComplete="password-new"
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

const styles = StyleSheet.create({
  form: { width: '100%', gap: 16 },
  stepInfo: { alignItems: 'center', marginBottom: 24 },
  iconCircle: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  stepTitle: { textAlign: 'center', marginBottom: 8 },
  stepDescription: { textAlign: 'center', fontSize: 14, lineHeight: 20, paddingHorizontal: 16 },
  togglePassword: { position: 'absolute', right: 16, top: 38 },
  errorText: { color: FeedbackColors.error, fontSize: 14, textAlign: 'center', marginTop: -8 },
  actionButton: { marginTop: 8 },
});
