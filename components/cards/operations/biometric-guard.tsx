import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppTheme } from '@/hooks/use-app-theme';
import * as LocalAuthentication from 'expo-local-authentication';
import { LucideIcon, ScanFace, Fingerprint } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';

interface BiometricGuardProps {
  isVisible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  reason?: string;
}

export function BiometricGuard({ isVisible, onSuccess, onCancel, reason = 'Confirma tu identidad para continuar' }: BiometricGuardProps) {
  const theme = useAppTheme();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [biometricType, setBiometricType] = useState<LocalAuthentication.AuthenticationType | null>(null);

  useEffect(() => {
    if (isVisible) {
      checkBiometrics();
    }
  }, [isVisible]);

  const checkBiometrics = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      // Fallback to device passcode or just bypass in dev if needed
      // For this demo, we'll simulate a success after a delay if no biometrics
      authenticate();
      return;
    }

    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      setBiometricType(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      setBiometricType(LocalAuthentication.AuthenticationType.FINGERPRINT);
    }
    
    authenticate();
  };

  const authenticate = async () => {
    setIsAuthenticating(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        fallbackLabel: 'Usar código de acceso',
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
      });

      if (result.success) {
        // Small delay for UX
        setTimeout(() => {
          setIsAuthenticating(false);
          onSuccess();
        }, 500);
      } else {
        setIsAuthenticating(false);
        if (result.error !== 'user_cancel') {
          Alert.alert('Error de autenticación', 'No pudimos verificar tu identidad.');
          onCancel();
        } else {
          onCancel();
        }
      }
    } catch (error) {
      console.error(error);
      setIsAuthenticating(false);
      onCancel();
    }
  };

  if (!isVisible) return null;

  // We render a transparent overlay because the system biometric prompt is native
  // But we can show a loading state or a "waiting" UI behind it
  return (
    <Modal transparent animationType="fade" visible={isVisible}>
      <View style={styles.container}>
        <ThemedView style={styles.card} surface="level3">
          <ActivityIndicator size="large" color={theme.tenant.mainColor} />
          <ThemedText style={styles.text}>Verificando identidad...</ThemedText>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 16,
    minWidth: 200,
  },
  text: {
    marginTop: 8,
    fontWeight: '500',
  }
});
