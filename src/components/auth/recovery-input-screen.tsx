
import { ThemedText } from '@/components/themed-text';
import { ThemedButton } from '@/components/ui/themed-button';
import { ThemedInput } from '@/components/ui/themed-input';
import { FeedbackColors } from '@/constants';
import { useAppTheme } from '@/hooks';
import { Calendar, CreditCard, Hash } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface RecoveryInputScreenProps {
  formData: {
    accountNumber: string;
    birthDate: string;
    constitutionDate: string;
    cardPin: string;
    verificationMethod: 'dob' | 'pin'; // 'constitution' could be merged with 'dob' as 'date'
  };
  setFormData: (data: Partial<RecoveryInputScreenProps['formData']> & RecoveryInputScreenProps['formData']) => void;
  error: string;
  setError: (value: string) => void;
  isLoading: boolean;
  onSubmit: () => void;
}

export function RecoveryInputScreen({ formData, setFormData, error, setError, isLoading, onSubmit }: RecoveryInputScreenProps) {
  const theme = useAppTheme();
  
  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setError('');
  };

  const toggleMethod = () => {
    const newMethod = formData.verificationMethod === 'dob' ? 'pin' : 'dob';
    setFormData({ ...formData, verificationMethod: newMethod, birthDate: '', constitutionDate: '', cardPin: '' });
    setError('');
  };

  return (
    <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.form}>
      <View style={styles.stepInfo}>
        <View style={[styles.iconCircle, { backgroundColor: `${theme.tenant.mainColor}15` }]}>
          <Hash size={32} color={theme.tenant.mainColor} />
        </View>
        <ThemedText type="subtitle" style={styles.stepTitle}>
          Validar Identidad
        </ThemedText>
        <ThemedText style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
          Ingresa tu número de cuenta y un método de verificación para recuperar tu acceso.
        </ThemedText>
      </View>

      <ThemedInput
        label="Número de cuenta / Documento"
        placeholder="1234567890"
        value={formData.accountNumber}
        onChangeText={(text) => updateField('accountNumber', text)}
        keyboardType="number-pad"
        icon={<Hash size={20} color={theme.colors.textSecondary} />}
      />

      {formData.verificationMethod === 'dob' ? (
        <ThemedInput
          label="Fecha de nacimiento o constitución"
          placeholder="DD/MM/AAAA"
          value={formData.birthDate || formData.constitutionDate}
          onChangeText={(text) => updateField('birthDate', text)} // Simplified for now
          keyboardType="numbers-and-punctuation"
          icon={<Calendar size={20} color={theme.colors.textSecondary} />}
          helperText="Ejemplo: 01/01/1990"
        />
      ) : (
        <ThemedInput
          label="PIN de Tarjeta"
          placeholder="••••"
          value={formData.cardPin}
          onChangeText={(text) => updateField('cardPin', text.replace(/[^0-9]/g, '').slice(0, 4))}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={4}
          icon={<CreditCard size={20} color={theme.colors.textSecondary} />}
        />
      )}

      {error && (
        <Animated.View entering={FadeInDown.duration(300)}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </Animated.View>
      )}

      <Pressable onPress={toggleMethod} disabled={isLoading}>
        <ThemedText style={[styles.link, { color: theme.tenant.mainColor }]}>
          {formData.verificationMethod === 'dob' 
            ? 'Validar con PIN de tarjeta' 
            : 'Validar con fecha de nacimiento'}
        </ThemedText>
      </Pressable>

      <ThemedButton
        title="Enviar Código"
        onPress={onSubmit}
        variant="primary"
        loading={isLoading}
        // Basic validation check for disabling
        disabled={isLoading || !formData.accountNumber || (formData.verificationMethod === 'pin' && formData.cardPin.length !== 4) || (formData.verificationMethod === 'dob' && (formData.birthDate || formData.constitutionDate).length < 8)}
        style={styles.actionButton}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
