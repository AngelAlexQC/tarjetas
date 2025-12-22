import { ThemedText } from '@/ui/primitives/themed-text';
import { ThemedButton } from '@/ui/primitives/themed-button';
import { ThemedInput } from '@/ui/primitives/themed-input';
import { useAppTheme } from '@/ui/theming';
import { Calendar, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface RegisterIdentificationStepProps {
  documentId: string;
  setDocumentId: (text: string) => void;
  birthDate: string;
  setBirthDate: (text: string) => void;
  onContinue: () => void;
  isLoading: boolean;
}

export function RegisterIdentificationStep({
  documentId,
  setDocumentId,
  birthDate,
  setBirthDate,
  onContinue,
  isLoading,
}: RegisterIdentificationStepProps) {
  const theme = useAppTheme();
  const [dateError, setDateError] = useState('');

  // Mascara de fecha DD/MM/AAAA
  const handleDateChange = (text: string) => {
    // Eliminar caracteres no numericos
    const cleaned = text.replace(/[^0-9]/g, '');
    let formatted = cleaned;

    if (cleaned.length > 2) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    if (cleaned.length > 4) {
      formatted = formatted.slice(0, 5) + '/' + formatted.slice(5, 9);
    }

    setBirthDate(formatted);
    
    // Validacion simple al vuelo
    if (cleaned.length === 8) {
      const day = parseInt(cleaned.slice(0, 2));
      const month = parseInt(cleaned.slice(2, 4));
      const year = parseInt(cleaned.slice(4, 9));
      
      if (day > 31 || month > 12 || year < 1900 || year > new Date().getFullYear()) {
        setDateError('Fecha inválida');
      } else {
        setDateError('');
      }
    } else {
      setDateError('');
    }
  };

  const isValid = documentId.length >= 8 && birthDate.length === 10 && !dateError;

  return (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>
          Identifícate
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Ingresa tus datos para validar tu identidad en el banco.
        </ThemedText>
      </View>

      <View style={styles.form}>
        <ThemedInput
          label="Número de Identificación"
          value={documentId}
          onChangeText={(text: string) => setDocumentId(text.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          maxLength={13}
          returnKeyType="done"
          placeholder="Ej: 1712345678"
          icon={<User size={20} color={theme.colors.textSecondary} />}
        />

        <ThemedInput
          label="Fecha de Nacimiento"
          value={birthDate}
          onChangeText={handleDateChange}
          keyboardType="number-pad"
          maxLength={10}
          returnKeyType="done"
          placeholder="DD/MM/AAAA"
          error={dateError}
          icon={<Calendar size={20} color={theme.colors.textSecondary} />}
        />

        <ThemedButton
          title="Continuar"
          onPress={onContinue}
          variant="primary"
          loading={isLoading}
          disabled={!isValid || isLoading}
          style={styles.button}
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
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 14,
  },
  form: {
    gap: 16,
  },
  button: {
    marginTop: 8,
  },
});
