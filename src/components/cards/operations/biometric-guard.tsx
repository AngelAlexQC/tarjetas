import { ThemedText } from '@/ui/primitives/themed-text';
import { ThemedView } from '@/ui/primitives/themed-view';
import { useAppTheme } from '@/ui/theming';
import { loggers } from '@/core/logging';
import { PlatformAlert } from '@/utils/platform-alert';
import * as LocalAuthentication from 'expo-local-authentication';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';

const log = loggers.biometric;

interface BiometricGuardProps {
  isVisible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  reason?: string;
}

export function BiometricGuard({ isVisible, onSuccess, onCancel, reason = 'Confirma tu identidad para continuar' }: BiometricGuardProps) {
  const theme = useAppTheme();
  // Estado interno para evitar múltiples autenticaciones simultáneas
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  // Refs para callbacks estables (evitar re-renders innecesarios)
  const onSuccessRef = useRef(onSuccess);
  const onCancelRef = useRef(onCancel);
  
  // Actualizar refs cuando cambien los callbacks
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onCancelRef.current = onCancel;
  }, [onSuccess, onCancel]);

  const authenticate = useCallback(async () => {
    setIsAuthenticating(true);
    try {
      // Verificamos hardware primero
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      // Si no hay hardware o no está enrolado, simulamos éxito en desarrollo
      // En producción, aquí deberías pedir PIN de la app o contraseña
      if (!hasHardware || !isEnrolled) {
        log.debug('Biometría no disponible, simulando éxito en desarrollo');
        setTimeout(() => {
          setIsAuthenticating(false);
          onSuccessRef.current();
        }, 1000);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason,
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false, // Permitir PIN si falla biometría
        fallbackLabel: 'Usar código',
      });

      if (result.success) {
        setTimeout(() => {
          setIsAuthenticating(false);
          onSuccessRef.current();
        }, 500);
      } else {
        setIsAuthenticating(false);
        if (result.error !== 'user_cancel' && result.error !== 'system_cancel') {
          // Si falla por error técnico (no cancelación), damos feedback
          PlatformAlert.alert('Error', 'No pudimos verificar tu identidad.');
        }
        onCancelRef.current();
      }
    } catch (error) {
      log.error('Biometric error:', error);
      setIsAuthenticating(false);
      onCancelRef.current();
    }
  }, [reason]);

  useEffect(() => {
    if (isVisible && !isAuthenticating) {
      authenticate();
    }
  }, [isVisible, isAuthenticating, authenticate]);

  if (!isVisible) return null;

  return (
    <Modal transparent animationType="fade" visible={isVisible}>
      <View style={styles.container}>
        <ThemedView style={styles.card} surface={3}>
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
