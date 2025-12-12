import { CreditCard } from '@/components/cards/credit-card';
import { BiometricGuard } from '@/components/cards/operations/biometric-guard';
import { CardOperationHeader } from '@/components/cards/operations/card-operation-header';
import { OperationResultScreen } from '@/components/cards/operations/operation-result-screen';
import { PaymentOption, SourceAccountCard } from '@/components/cards/operations/pay-components';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { PoweredBy } from '@/components/ui/powered-by';
import { ThemedButton } from '@/components/ui/themed-button';
import { ThemedInput } from '@/components/ui/themed-input';
import { useCardQueries } from '@/hooks/cards';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useKeyboard } from '@/hooks/use-keyboard';
import type { Card, OperationResult } from '@/repositories';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PayCardScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCardById } = useCardQueries();
  const [card, setCard] = useState<Card | undefined>();
  const [isLoadingCard, setIsLoadingCard] = useState(true);
  const insets = useSafeAreaInsets();
  useKeyboard();

  useEffect(() => {
    if (id) {
      getCardById(id).then((fetchedCard) => {
        setCard(fetchedCard);
        setIsLoadingCard(false);
      });
    }
  }, [id, getCardById]);

  const [amount, setAmount] = useState('');
  const [selectedOption, setSelectedOption] = useState<'total' | 'minimum' | 'other'>('total');
  const [showBiometrics, setShowBiometrics] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<OperationResult | null>(null);

  const totalDebt = 1250.50;
  const minPayment = 125.00;

  const handlePay = () => setShowBiometrics(true);

  const onBiometricSuccess = () => {
    setShowBiometrics(false);
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setResult({
        success: true,
        title: 'Pago Exitoso',
        message: `Has pagado $${amount || totalDebt} a tu tarjeta.`,
        receiptId: `PAY-${Math.floor(Math.random() * 10000)}`,
      });
    }, 2000);
  };

  if (isLoadingCard) return <LoadingScreen message="Cargando datos de pago..." />;
  if (isProcessing) return <LoadingScreen message="Procesando pago..." />;

  if (result) {
    return (
      <OperationResultScreen
        result={result}
        onClose={() => router.back()}
        card={card}
        transactionDetails={[
          { label: 'Monto Pagado', value: `$${parseFloat(amount || totalDebt.toString()).toFixed(2)}`, isAmount: true },
          { label: 'Fecha', value: new Date().toLocaleDateString() },
          { label: 'Cuenta Origen', value: 'Ahorros **** 1234' },
          { label: 'Tarjeta Destino', value: `**** ${card?.cardNumber.slice(-4)}` },
        ]}
      >
        {card && (
          <View style={{ transform: [{ scale: 0.8 }], alignItems: 'center' }}>
            <CreditCard card={card} />
          </View>
        )}
      </OperationResultScreen>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }} keyboardVerticalOffset={0}>
        <CardOperationHeader title="Pagar Tarjeta" card={card} onBack={() => router.back()} />

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            {card && <CreditCard card={card} width={300} />}
          </View>
          
          <ThemedView style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Selecciona el monto</ThemedText>
            
            <PaymentOption
              title="Pago Total"
              subtitle="Deuda a la fecha"
              amount={totalDebt}
              selected={selectedOption === 'total'}
              onPress={() => { setSelectedOption('total'); setAmount(totalDebt.toString()); }}
            />
            <PaymentOption
              title="Pago Mínimo"
              subtitle="Evita mora"
              amount={minPayment}
              selected={selectedOption === 'minimum'}
              onPress={() => { setSelectedOption('minimum'); setAmount(minPayment.toString()); }}
            />
            <TouchableOpacity 
              style={[styles.otherOption, selectedOption === 'other' && { borderColor: theme.tenant.mainColor, borderWidth: 2 }]}
              onPress={() => setSelectedOption('other')}
            >
              <ThemedText type="defaultSemiBold">Otro Valor</ThemedText>
            </TouchableOpacity>

            {selectedOption === 'other' && (
              <ThemedInput
                label="Monto a pagar"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                containerStyle={{ marginTop: 16 }}
              />
            )}
          </ThemedView>

          <ThemedView style={[styles.card, { backgroundColor: theme.colors.surface, marginTop: 16 }]}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Cuenta de Origen</ThemedText>
            <SourceAccountCard icon="💰" title="Cuenta de Ahorros" details="**** 1234 • Saldo: $5,430.00" />
          </ThemedView>
          <PoweredBy style={{ marginTop: 40 }} />
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <ThemedButton title="Pagar Ahora" onPress={handlePay} disabled={!amount && selectedOption === 'other'} />
        </View>
      </KeyboardAvoidingView>

      <BiometricGuard
        isVisible={showBiometrics}
        onSuccess={onBiometricSuccess}
        onCancel={() => setShowBiometrics(false)}
        reason="Confirmar pago de tarjeta"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 20, flexGrow: 1 },
  card: { padding: 16, borderRadius: 16 },
  sectionTitle: { marginBottom: 16 },
  otherOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: 'rgba(150, 150, 150, 0.1)' },
});
