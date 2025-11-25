import { CreditCard } from '@/components/cards/credit-card';
import { BiometricGuard } from '@/components/cards/operations/biometric-guard';
import { CardOperationHeader } from '@/components/cards/operations/card-operation-header';
import { OperationResultScreen } from '@/components/cards/operations/operation-result-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { PoweredBy } from '@/components/ui/powered-by';
import { ThemedButton } from '@/components/ui/themed-button';
import { ThemedInput } from '@/components/ui/themed-input';
import { OperationResult } from '@/features/cards/types/card-operations';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useCards } from '@/hooks/use-cards';
import { useKeyboard } from '@/hooks/use-keyboard';
import type { Card } from '@/repositories';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CardlessAtmScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCardById } = useCards();
  const [card, setCard] = useState<Card | undefined>();
  const [isLoadingCard, setIsLoadingCard] = useState(true);
  const insets = useSafeAreaInsets();
  useKeyboard(); // Solo para efectos secundarios del hook

  useEffect(() => {
    if (id) {
      getCardById(id).then((fetchedCard) => {
        setCard(fetchedCard);
        setIsLoadingCard(false);
      });
    }
  }, [id, getCardById]);

  const [amount, setAmount] = useState('');
  const [showBiometrics, setShowBiometrics] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const handleGenerate = () => {
    if (!amount) return;
    setShowBiometrics(true);
  };

  const onBiometricSuccess = () => {
    setShowBiometrics(false);
    setIsProcessing(true);
    // Simulate code generation
    setTimeout(() => {
      setIsProcessing(false);
      setGeneratedCode(Math.floor(100000 + Math.random() * 900000).toString());
    }, 2000);
  };

  if (isLoadingCard) {
    return <LoadingScreen message="Cargando retiro sin tarjeta..." />;
  }

  if (isProcessing) {
    return <LoadingScreen message="Generando código de retiro..." />;
  }

  if (generatedCode) {
    const resultData: OperationResult = {
      success: true,
      title: 'Retiro Generado',
      message: 'Ingresa este código en cualquier cajero automático.',
      receiptId: `ATM-${Math.floor(Math.random() * 10000)}`,
    };

    return (
      <OperationResultScreen
        result={resultData}
        onClose={() => router.back()}
        card={card}
        transactionDetails={[
          { label: 'Monto Retiro', value: `$${parseFloat(amount).toFixed(2)}`, isAmount: true },
          { label: 'Costo Transacción', value: '$0.50' },
          { label: 'Validez', value: '30 minutos' },
        ]}
      >
        <View style={{ alignItems: 'center', width: '100%' }}>
           <View style={{ backgroundColor: theme.colors.surfaceElevated, padding: 16, borderRadius: 12, marginBottom: 8, width: '100%', alignItems: 'center' }}>
            <ThemedText type="title" style={{ fontSize: 32, letterSpacing: 4 }}>{generatedCode}</ThemedText>
            <ThemedText style={{ fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 }}>Código de Retiro</ThemedText>
           </View>
           <ThemedText style={{ color: '#F44336', fontSize: 12 }}>Expira en 30:00 minutos</ThemedText>
           
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <CardOperationHeader
          title="Retiro sin Tarjeta"
          card={card}
          onBack={() => router.back()}
        />

        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={styles.content}
        >
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            {card && <CreditCard card={card} width={300} />}
          </View>
          <ThemedView style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>¿Cuánto deseas retirar?</ThemedText>
          
          <View style={styles.amountGrid}>
            {[20, 50, 100, 200].map((val) => (
              <TouchableOpacity
                key={val}
                style={[
                  styles.amountButton,
                  amount === val.toString() && { borderColor: theme.tenant.mainColor, backgroundColor: theme.tenant.mainColor + '20' }
                ]}
                onPress={() => setAmount(val.toString())}
              >
                <ThemedText type="defaultSemiBold">${val}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          <ThemedInput
            label="Otro valor"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            containerStyle={{ marginTop: 16 }}
          />
        </ThemedView>

        <ThemedText style={styles.infoText}>
          El código generado tendrá una validez de 30 minutos.
        </ThemedText>
        <PoweredBy style={{ marginTop: 40 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <ThemedButton 
          title="Generar Código" 
          onPress={handleGenerate}
          disabled={!amount}
        />
      </View>
      </KeyboardAvoidingView>

      <BiometricGuard
        isVisible={showBiometrics}
        onSuccess={onBiometricSuccess}
        onCancel={() => setShowBiometrics(false)}
        reason="Generar código de retiro"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  card: {
    padding: 16,
    borderRadius: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amountButton: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  infoText: {
    marginTop: 16,
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  codeBox: {
    padding: 24,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
});
