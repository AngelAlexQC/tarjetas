import { ThemedText } from '@/components/themed-text';
import { ThemedButton } from '@/components/ui/themed-button';
import { ThemedInput } from '@/components/ui/themed-input';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Ionicons } from '@expo/vector-icons';
import { Lock, Mail, Phone, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface RegisterAccountSetupStepProps {
  formData: {
    email: string;
    phone: string;
    username: string;
    password: string;
    confirmPassword: string;
  };
  setFormData: (data: any) => void;
  onSubmit: () => void;
  isLoading: boolean;
  error: string;
  setError: (error: string) => void;
}

export function RegisterAccountSetupStep({
  formData,
  setFormData,
  onSubmit,
  isLoading,
  error,
  setError,
}: RegisterAccountSetupStepProps) {
  const theme = useAppTheme();
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureConfirmEntry, setSecureConfirmEntry] = useState(true);

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setError('');
  };

  return (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>
          Crea tu cuenta
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Configura tus credenciales de acceso y contacto.
        </ThemedText>
      </View>

      <View style={styles.form}>
        <ThemedInput
          label="Correo electrónico"
          placeholder="correo@ejemplo.com"
          value={formData.email}
          onChangeText={(text) => updateField('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
          textContentType="emailAddress"
          autoComplete="email"
          icon={<Mail size={20} color={theme.colors.textSecondary} />}
        />

        <ThemedInput
          label="Teléfono"
          placeholder="+593 999 999 999"
          value={formData.phone}
          onChangeText={(text) => updateField('phone', text)}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          autoComplete="tel"
          icon={<Phone size={20} color={theme.colors.textSecondary} />}
        />

        <ThemedInput
          label="Nombre de usuario"
          placeholder="juanperez"
          value={formData.username}
          onChangeText={(text) => updateField('username', text.toLowerCase().replace(/\s/g, ''))}
          autoCapitalize="none"
          textContentType="username"
          autoComplete="username"
          icon={<User size={20} color={theme.colors.textSecondary} />}
        />

        <ThemedInput
          label="Contraseña"
          placeholder="••••••••••••"
          value={formData.password}
          onChangeText={(text) => updateField('password', text)}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          textContentType="newPassword"
          autoComplete="password-new"
          rightIcon={
            <Pressable onPress={() => setSecureTextEntry(!secureTextEntry)}>
              <Ionicons 
                name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'} 
                size={20} 
                color={theme.colors.textSecondary} 
              />
            </Pressable>
          }
          icon={<Lock size={20} color={theme.colors.textSecondary} />}
        />

        <ThemedInput
          label="Confirmar contraseña"
          placeholder="••••••••••••"
          value={formData.confirmPassword}
          onChangeText={(text) => updateField('confirmPassword', text)}
          secureTextEntry={secureConfirmEntry}
          autoCapitalize="none"
          textContentType="newPassword"
          autoComplete="password-new"
          rightIcon={
            <Pressable onPress={() => setSecureConfirmEntry(!secureConfirmEntry)}>
              <Ionicons 
                name={secureConfirmEntry ? 'eye-off-outline' : 'eye-outline'} 
                size={20} 
                color={theme.colors.textSecondary} 
              />
            </Pressable>
          }
          icon={<Lock size={20} color={theme.colors.textSecondary} />}
        />

        {error ? (
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        ) : null}

        <ThemedButton
          title="Finalizar Registro"
          onPress={onSubmit}
          variant="primary"
          loading={isLoading}
          disabled={isLoading}
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
    gap: 6,
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
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
  },
});
