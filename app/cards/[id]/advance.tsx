import { CreditCard } from '@/components/cards/credit-card';
import { BiometricGuard } from '@/components/cards/operations/biometric-guard';
import { CardOperationHeader } from '@/components/cards/operations/card-operation-header';
import { OperationResultScreen } from '@/components/cards/operations/operation-result-screen';
import { SummaryPanel } from '@/components/cards/summary-panel';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FinancialIcons } from '@/components/ui/financial-icons';
import { PoweredBy } from '@/components/ui/powered-by';
import { cardService } from '@/features/cards/services/card-service';
import { OperationResult } from '@/features/cards/types/card-operations';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowRight, DollarSign, Info } from 'lucide-react-native';
import React, { useMemo, useRef, useState } from 'react';
import { InputAccessoryView, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { SlideInLeft, SlideInRight, SlideOutLeft, SlideOutRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Mock Accounts
const ACCOUNTS = [
  { id: '1', type: 'Ahorros', number: '•••• 1234', balance: 1500.00 },
  { id: '2', type: 'Corriente', number: '•••• 5678', balance: 320.50 },
];

const TERMS = [3, 6, 9, 12, 24];

type Step = 'form' | 'summary' | 'validation';

export default function AdvanceScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const card = cardService.getCardById(id!);
  const insets = useSafeAreaInsets();
  
  const [step, setStep] = useState<Step>('form');
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [amount, setAmount] = useState('');
  const [selectedTerm, setSelectedTerm] = useState(12);
  const [selectedAccount, setSelectedAccount] = useState(ACCOUNTS[0].id);
  
  // Validation Form State
  const [cvv, setCvv] = useState('');
  const [expiry, setExpiry] = useState('');
  const cvvRef = useRef<TextInput>(null);
  
  const [showBiometrics, setShowBiometrics] = useState(false);
  const [result, setResult] = useState<OperationResult | null>(null);

  // Calculations
  const calculations = useMemo(() => {
    const val = parseFloat(amount) || 0;
    const rate = 0.16; // 16% annual
    const interest = val * rate * (selectedTerm / 12);
    const total = val + interest;
    const monthly = total / selectedTerm;
    
    return { val, interest, total, monthly };
  }, [amount, selectedTerm]);

  const handleExpiryChange = (text: string) => {
    // Remove non-numeric characters
    const cleaned = text.replace(/[^0-9]/g, '');
    
    // Format as MM/YY
    let formatted = cleaned;
    if (cleaned.length >= 2) {
      formatted = cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    
    setExpiry(formatted);

    // Auto-focus next field when complete (4 digits)
    if (cleaned.length === 4) {
      cvvRef.current?.focus();
    }
  };

  const handleNext = () => {
    setDirection('forward');
    if (step === 'form') {
      if (!amount || parseFloat(amount) <= 0) return;
      setStep('summary');
    } else if (step === 'summary') {
      setStep('validation');
    } else if (step === 'validation') {
      if (cvv.length < 3 || expiry.length < 4) return;
      setShowBiometrics(true);
    }
  };

  const handleBack = () => {
    setDirection('back');
    if (step === 'validation') setStep('summary');
    else if (step === 'summary') setStep('form');
    else router.back();
  };

  const onBiometricSuccess = () => {
    setShowBiometrics(false);
    setTimeout(() => {
      setResult({
        success: true,
        title: 'Avance Exitoso',
        message: `Se han acreditado $${parseFloat(amount).toFixed(2)} en tu cuenta.`,
        receiptId: `ADV-${Math.floor(Math.random() * 10000)}`,
      });
    }, 1000);
  };

  if (result) {
    return (
      <OperationResultScreen 
        result={result} 
        onClose={() => router.back()}
        card={card}
        transactionDetails={[
          { label: 'Monto Avance', value: `$${parseFloat(amount).toFixed(2)}`, isAmount: true },
          { label: 'Plazo', value: `${selectedTerm} meses` },
          { label: 'Cuenta Destino', value: ACCOUNTS.find(a => a.id === selectedAccount)?.number || '****' },
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
    <ThemedView style={styles.container} surface="level1">
      <Animated.View exiting={SlideOutLeft} style={{ flex: 1 }}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <CardOperationHeader 
            title="Avance de Efectivo" 
            card={card} 
            onBack={handleBack} 
            isModal={step === 'form'} 
          />

          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              {card && <CreditCard card={card} width={300} />}
            </View>

            <Animated.View 
              key={step}
              entering={direction === 'forward' ? SlideInRight.duration(300) : SlideInLeft.duration(300)} 
              exiting={direction === 'forward' ? SlideOutLeft.duration(300) : SlideOutRight.duration(300)}
              style={styles.stepContainer}
            >
              {step === 'form' && (
                <>
                  <ThemedText style={styles.sectionTitle}>Monto a solicitar</ThemedText>
                  <View style={[styles.inputContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
                    <DollarSign size={20} color={theme.colors.textSecondary} />
                    <TextInput
                      style={[styles.input, { color: theme.colors.text }]}
                      placeholder="0.00"
                      placeholderTextColor={theme.colors.textDisabled}
                      keyboardType="decimal-pad"
                      returnKeyType="done"
                      value={amount}
                      onChangeText={setAmount}
                      inputAccessoryViewID="uniqueID"
                    />
                  </View>

                  <ThemedText style={styles.sectionTitle}>Plazo (meses)</ThemedText>
                  <View style={styles.termsGrid}>
                    {TERMS.map(t => (
                      <TouchableOpacity
                        key={t}
                        style={[
                          styles.termCard,
                          { 
                            borderColor: selectedTerm === t ? theme.tenant.mainColor : theme.colors.border,
                            backgroundColor: selectedTerm === t ? theme.colors.surfaceHigher : theme.colors.surface
                          }
                        ]}
                        onPress={() => setSelectedTerm(t)}
                      >
                        <ThemedText style={{ fontWeight: selectedTerm === t ? 'bold' : 'normal' }}>{t}</ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <ThemedText style={styles.sectionTitle}>Cuenta de destino</ThemedText>
                  {ACCOUNTS.map(acc => (
                    <TouchableOpacity
                      key={acc.id}
                      style={[
                        styles.accountCard,
                        { 
                          borderColor: selectedAccount === acc.id ? theme.tenant.mainColor : theme.colors.border,
                          backgroundColor: selectedAccount === acc.id ? theme.colors.surfaceHigher : theme.colors.surface
                        }
                      ]}
                      onPress={() => setSelectedAccount(acc.id)}
                    >
                      <View style={[styles.iconBox, { backgroundColor: theme.colors.surfaceHigher }]}>
                        <FinancialIcons.wallet size={24} color={theme.colors.textSecondary} />
                      </View>
                      <View>
                        <ThemedText type="defaultSemiBold">Cuenta {acc.type}</ThemedText>
                        <ThemedText style={{ opacity: 0.6 }}>{acc.number} - Saldo: ${acc.balance}</ThemedText>
                      </View>
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {step === 'summary' && (
                <>
                  <SummaryPanel 
                    title="Resumen de la solicitud"
                    items={[
                      { label: 'Monto Solicitado', value: `$${calculations.val.toFixed(2)}` },
                      { label: 'Interés Aprox. (16%)', value: `$${calculations.interest.toFixed(2)}` },
                      { label: 'Total a Pagar', value: `$${calculations.total.toFixed(2)}` },
                      { label: 'Cuota Mensual', value: `$${calculations.monthly.toFixed(2)}`, isTotal: true },
                    ]}
                    style={{ marginBottom: 24 }}
                  />

                  <ThemedText type="subtitle" style={{ marginBottom: 16 }}>Tabla de Amortización (Proyección)</ThemedText>
                  <View style={[styles.table, { borderColor: theme.colors.border }]}>
                    <View style={[styles.tableHeader, { backgroundColor: theme.colors.surfaceHigher }]}>
                      <ThemedText style={styles.col1}>Mes</ThemedText>
                      <ThemedText style={styles.col2}>Cuota</ThemedText>
                      <ThemedText style={styles.col3}>Saldo</ThemedText>
                    </View>
                    {Array.from({ length: Math.min(selectedTerm, 5) }).map((_, i) => (
                      <View key={i} style={[styles.tableRow, { borderBottomColor: theme.colors.borderSubtle }]}>
                        <ThemedText style={styles.col1}>{i + 1}</ThemedText>
                        <ThemedText style={styles.col2}>${calculations.monthly.toFixed(2)}</ThemedText>
                        <ThemedText style={styles.col3}>
                          ${(calculations.total - (calculations.monthly * (i + 1))).toFixed(2)}
                        </ThemedText>
                      </View>
                    ))}
                    {selectedTerm > 5 && (
                      <View style={styles.tableRow}>
                        <ThemedText style={{ opacity: 0.5, fontStyle: 'italic' }}>... {selectedTerm - 5} cuotas más</ThemedText>
                      </View>
                    )}
                  </View>
                </>
              )}

              {step === 'validation' && (
                <>
                  <ThemedText type="subtitle">Validación de Seguridad</ThemedText>
                  <ThemedText style={{ opacity: 0.7, marginBottom: 24 }}>
                    Ingresa los datos de tu tarjeta para confirmar.
                  </ThemedText>

                  <View style={styles.formGroup}>
                    <ThemedText style={styles.label}>Fecha de Expiración (MM/YY)</ThemedText>
                    <TextInput
                      style={[styles.inputField, { borderColor: theme.colors.border, color: theme.colors.text, backgroundColor: theme.colors.surface }]}
                      placeholder="MM/YY"
                      placeholderTextColor={theme.colors.textDisabled}
                      value={expiry}
                      onChangeText={handleExpiryChange}
                      maxLength={5}
                      keyboardType="number-pad"
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={() => cvvRef.current?.focus()}
                      inputAccessoryViewID="uniqueID"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <ThemedText style={styles.label}>Código de Seguridad (CVV)</ThemedText>
                    <TextInput
                      ref={cvvRef}
                      style={[styles.inputField, { borderColor: theme.colors.border, color: theme.colors.text, backgroundColor: theme.colors.surface }]}
                      placeholder="123"
                      placeholderTextColor={theme.colors.textDisabled}
                      value={cvv}
                      onChangeText={setCvv}
                      maxLength={4}
                      secureTextEntry
                      keyboardType="number-pad"
                      returnKeyType="done"
                      inputAccessoryViewID="uniqueID"
                    />
                  </View>

                  <View style={styles.infoBox}>
                    <Info size={20} color={theme.tenant.mainColor} />
                    <ThemedText style={{ flex: 1, fontSize: 12 }}>
                      Al continuar, aceptas los términos y condiciones del servicio de Avance de Efectivo.
                    </ThemedText>
                  </View>
                </>
              )}
            </Animated.View>
            <PoweredBy style={{ marginTop: 40 }} />
          </ScrollView>

          <View style={[styles.footer, { backgroundColor: theme.colors.surface, paddingBottom: insets.bottom + 20 }]}>
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: theme.tenant.mainColor, opacity: (step === 'form' && !amount) ? 0.5 : 1 }
              ]}
              onPress={handleNext}
              disabled={step === 'form' && !amount}
            >
              <ThemedText style={styles.buttonText}>
                {step === 'validation' ? 'Confirmar y Acreditar' : 'Continuar'}
              </ThemedText>
              <ArrowRight size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>

        <BiometricGuard
        isVisible={showBiometrics}
        onSuccess={onBiometricSuccess}
        onCancel={() => setShowBiometrics(false)}
        reason="Confirma el avance de efectivo"
      />
      {Platform.OS === 'ios' && <InputAccessoryView nativeID="uniqueID" />}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  content: {
    padding: 20,
    paddingBottom: 20,
    flexGrow: 1,
  },
  stepContainer: {
    gap: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  termsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  termCard: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
    marginBottom: 8,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCard: {
    padding: 20,
    borderRadius: 16,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(150,150,150,0.2)',
    marginVertical: 8,
  },
  table: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    padding: 12,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  col1: { width: '20%', textAlign: 'center' },
  col2: { width: '40%', textAlign: 'right' },
  col3: { width: '40%', textAlign: 'right' },
  
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    opacity: 0.8,
  },
  inputField: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'rgba(150,150,150,0.1)',
    borderRadius: 12,
    gap: 12,
    alignItems: 'center',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  button: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
