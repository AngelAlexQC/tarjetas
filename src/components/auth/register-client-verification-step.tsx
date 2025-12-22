import { ThemedText } from '@/ui/primitives/themed-text';
import { ThemedButton } from '@/ui/primitives/themed-button';
import { useAppTheme } from '@/ui/theming';
import { Check, User } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface RegisterClientVerificationStepProps {
  clientName: string;
  onConfirm: () => void;
  onBack: () => void;
}

export function RegisterClientVerificationStep({
  clientName,
  onConfirm,
  onBack,
}: RegisterClientVerificationStepProps) {
  const theme = useAppTheme();

  return (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: `${theme.tenant.mainColor}15` }]}>
          <User size={40} color={theme.tenant.mainColor} />
        </View>
        <ThemedText type="subtitle" style={styles.title}>
          Confirma tu identidad
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Hemos encontrado el siguiente cliente asociado a tu identificación:
        </ThemedText>
      </View>

      <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
        <ThemedText style={styles.label}>Nombre del Cliente</ThemedText>
        <ThemedText type="title" style={{ color: theme.tenant.mainColor }}>
          {clientName}
        </ThemedText>
      </View>

      <View style={styles.actions}>
        <ThemedButton
          title="Este soy yo"
          onPress={onConfirm}
          variant="primary"
          icon={<Check size={20} color="#FFF" />}
        />
        <ThemedButton
          title="No soy yo"
          onPress={onBack}
          variant="outline"
          style={{ marginTop: 12 }}
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 24,
  },
  header: {
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
    paddingHorizontal: 20,
  },
  card: {
    padding: 24,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.7,
  },
  actions: {
    width: '100%',
    marginTop: 8,
  },
});
