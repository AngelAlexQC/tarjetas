import { CreditCard } from '@/components/cards/credit-card';
import { BiometricGuard } from '@/components/cards/operations/biometric-guard';
import { CardOperationHeader } from '@/components/cards/operations/card-operation-header';
import { OperationResultScreen } from '@/components/cards/operations/operation-result-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { PoweredBy } from '@/components/ui/powered-by';
import { useCardOperation } from '@/hooks/cards';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { OperationResult } from '@/repositories';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';


export default function DynamicCvvScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { card, isLoadingCard } = useCardOperation();

  const [showBiometrics, setShowBiometrics] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cvv, setCvv] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (cvv && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setCvv(null); // Expired
    }
    return () => clearInterval(timer);
  }, [cvv, timeLeft]);

  const onBiometricSuccess = () => {
    setShowBiometrics(false);
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCvv(Math.floor(100 + Math.random() * 900).toString());
      setTimeLeft(300);
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (isLoadingCard) {
    return <LoadingScreen message="Cargando código de seguridad..." />;
  }

  if (isProcessing) {
    return <LoadingScreen message="Generando CVV dinámico..." />;
  }

  if (cvv) {
    const resultData: OperationResult = {
      success: true,
      title: 'CVV Generado',
      message: 'Utiliza este código para tu compra en línea.',
    };

    return (
      <OperationResultScreen
        result={resultData}
        onClose={() => router.back()}
        card={card}
      >
        <View style={{ alignItems: 'center', width: '100%' }}>
          <View style={[styles.cvvBox, { backgroundColor: theme.colors.surfaceElevated }]}>
            <ThemedText type="title" style={{ fontSize: 48, lineHeight: 56, letterSpacing: 8 }}>{cvv}</ThemedText>
          </View>

          <View style={styles.timerContainer}>
            <ThemedText type="defaultSemiBold" style={{ fontSize: 24, color: timeLeft < 60 ? '#F44336' : theme.colors.text }}>
              {formatTime(timeLeft)}
            </ThemedText>
            <ThemedText style={{ fontSize: 12, color: theme.colors.textSecondary }}>Tiempo restante</ThemedText>
          </View>

          <ThemedText style={[styles.infoText, { marginBottom: 24 }]}>
            Este código es válido para una sola compra o hasta que el tiempo expire.
          </ThemedText>

          {card && (
            <View style={{ transform: [{ scale: 0.8 }], alignItems: 'center' }}>
              <CreditCard card={card} />
            </View>
          )}
        </View>
      </OperationResultScreen>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <CardOperationHeader
        title="CVV Dinámico"
        onBack={() => router.back()}
      />

      <View style={styles.content}>
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          {card && <CreditCard card={card} width={300} />}
        </View>
        {cvv ? (
          <View style={styles.cvvContainer}>
            <ThemedText style={{ color: theme.colors.textSecondary, marginBottom: 8 }}>
              Tu código de seguridad es:
            </ThemedText>
            
            <View style={[styles.cvvBox, { backgroundColor: theme.colors.surfaceElevated }]}>
              <ThemedText type="title" style={{ fontSize: 48, lineHeight: 56, letterSpacing: 8 }}>{cvv}</ThemedText>
            </View>

            <View style={styles.timerContainer}>
              <ThemedText type="defaultSemiBold" style={{ fontSize: 24, color: timeLeft < 60 ? '#F44336' : theme.colors.text }}>
                {formatTime(timeLeft)}
              </ThemedText>
              <ThemedText style={{ fontSize: 12, color: theme.colors.textSecondary }}>Tiempo restante</ThemedText>
            </View>

            <ThemedText style={styles.infoText}>
              Este código es válido para una sola compra o hasta que el tiempo expire.
            </ThemedText>
          </View>
        ) : (
          <View style={styles.placeholder}>
            <ThemedText>Autenticación requerida para ver el CVV</ThemedText>
          </View>
        )}
        <PoweredBy style={{ marginTop: 40 }} />
      </View>

      <BiometricGuard
        isVisible={showBiometrics}
        onSuccess={onBiometricSuccess}
        onCancel={() => router.back()}
        reason="Ver CVV Dinámico"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  cvvContainer: {
    width: '100%',
    alignItems: 'center',
  },
  cvvBox: {
    padding: 32,
    borderRadius: 24,
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  infoText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  placeholder: {
    opacity: 0,
  },
});
