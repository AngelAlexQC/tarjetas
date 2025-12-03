import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedButton } from '@/components/ui/themed-button';
import { useAuth } from '@/contexts/auth-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Fingerprint, ShieldCheck } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';

interface BiometricEnableModalProps {
  isVisible: boolean;
  onEnable: () => void;
  onSkip: () => void;
}

export function BiometricEnableModal({ isVisible, onEnable, onSkip }: BiometricEnableModalProps) {
  const theme = useAppTheme();
  const { isBiometricAvailable } = useAuth();
  const [isEnabling, setIsEnabling] = useState(false);

  if (!isBiometricAvailable) {
    return null;
  }

  const handleEnable = async () => {
    setIsEnabling(true);
    try {
      await onEnable();
    } finally {
      setIsEnabling(false);
    }
  };

  const biometricType = Platform.OS === 'ios' ? 'Face ID / Touch ID' : 'Huella Digital';
  const Icon = Platform.OS === 'ios' ? ShieldCheck : Fingerprint;

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="fade"
      onRequestClose={onSkip}
    >
      <Animated.View 
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(300)}
        style={styles.overlay}
      >
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={styles.container}
        >
          <ThemedView style={[styles.card, { backgroundColor: theme.colors.surface }]} surface={2}>
            {/* Icono */}
            <View style={[styles.iconContainer, { backgroundColor: `${theme.tenant.mainColor}15` }]}>
              <Icon size={48} color={theme.tenant.mainColor} />
            </View>

            {/* Título */}
            <ThemedText type="subtitle" style={styles.title}>
              ¿Activar Acceso Rápido?
            </ThemedText>

            {/* Descripción */}
            <ThemedText style={[styles.description, { color: theme.colors.textSecondary }]}>
              Usa {biometricType} para acceder más rápido y de forma segura sin ingresar tu contraseña cada vez.
            </ThemedText>

            {/* Beneficios */}
            <View style={styles.benefits}>
              <View style={styles.benefitRow}>
                <View style={[styles.checkmark, { backgroundColor: theme.tenant.mainColor }]}>
                  <ThemedText style={styles.checkmarkText}>✓</ThemedText>
                </View>
                <ThemedText style={styles.benefitText}>Acceso instantáneo</ThemedText>
              </View>
              <View style={styles.benefitRow}>
                <View style={[styles.checkmark, { backgroundColor: theme.tenant.mainColor }]}>
                  <ThemedText style={styles.checkmarkText}>✓</ThemedText>
                </View>
                <ThemedText style={styles.benefitText}>Mayor seguridad</ThemedText>
              </View>
              <View style={styles.benefitRow}>
                <View style={[styles.checkmark, { backgroundColor: theme.tenant.mainColor }]}>
                  <ThemedText style={styles.checkmarkText}>✓</ThemedText>
                </View>
                <ThemedText style={styles.benefitText}>Sin contraseñas</ThemedText>
              </View>
            </View>

            {/* Botones */}
            <View style={styles.buttons}>
              <ThemedButton
                title="Activar Ahora"
                onPress={handleEnable}
                variant="primary"
                loading={isEnabling}
                disabled={isEnabling}
                style={styles.primaryButton}
              />
              <ThemedButton
                title="Más Tarde"
                onPress={onSkip}
                variant="outline"
                disabled={isEnabling}
                style={styles.secondaryButton}
              />
            </View>

            {/* Nota de seguridad */}
            <ThemedText style={[styles.note, { color: theme.colors.textSecondary }]}>
              Puedes cambiar esta configuración en cualquier momento desde ajustes.
            </ThemedText>
          </ThemedView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
  },
  card: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  benefits: {
    width: '100%',
    gap: 12,
    marginBottom: 28,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  benefitText: {
    fontSize: 15,
    flex: 1,
  },
  buttons: {
    width: '100%',
    gap: 12,
    marginBottom: 16,
  },
  primaryButton: {
    width: '100%',
  },
  secondaryButton: {
    width: '100%',
  },
  note: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});
