
import { ThemedText } from '@/components/themed-text';
import { ThemedButton } from '@/components/ui/themed-button';
import { useAppTheme } from '@/hooks';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface RecoverySuccessScreenProps {
  onSuccess: () => void;
}

export function RecoverySuccessScreen({ onSuccess }: RecoverySuccessScreenProps) {
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

const styles = StyleSheet.create({
  form: { width: '100%', gap: 16 },
  stepInfo: { alignItems: 'center', marginBottom: 24 },
  successCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  stepTitle: { textAlign: 'center', marginBottom: 8 },
  stepDescription: { textAlign: 'center', fontSize: 14, lineHeight: 20, paddingHorizontal: 16 },
  actionButton: { marginTop: 8 },
});
