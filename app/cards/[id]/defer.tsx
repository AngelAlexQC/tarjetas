import { CreditCard } from '@/components/cards/credit-card';
import { BiometricGuard } from '@/components/cards/operations/biometric-guard';
import { CardOperationHeader } from '@/components/cards/operations/card-operation-header';
import { MonthCard, ProgressHeader, TransactionSelectItem } from '@/components/cards/operations/defer-components';
import { OperationResultScreen } from '@/components/cards/operations/operation-result-screen';
import { SummaryPanel } from '@/components/cards/summary-panel';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { PoweredBy } from '@/components/ui/powered-by';
import { useCardDefer, useCardOperation, useCardQueries } from '@/hooks/cards';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { OperationResult, Transaction } from '@/repositories';
import { generateSecureReceiptId } from '@/utils/secure-random';
import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { SlideInLeft, SlideInRight, SlideOutLeft, SlideOutRight } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DEFER_MONTHS = [3, 6, 9, 12, 24];
type Step = 'select' | 'term' | 'summary';

// eslint-disable-next-line max-lines-per-function, complexity
export default function DeferScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { card, isLoadingCard } = useCardOperation();
  const { getDeferrableTransactions } = useCardQueries();
  const { simulation, confirmDefer, simulateDefer } = useCardDefer();
  const insets = useSafeAreaInsets();
  
  const [step, setStep] = useState<Step>('select');
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [selectedTxIds, setSelectedTxIds] = useState<Set<string>>(new Set());
  const [selectedMonths, setSelectedMonths] = useState<number>(3);
  const [showBiometrics, setShowBiometrics] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<OperationResult | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);

  const loadTransactions = useCallback(async () => {
    if (!card?.id) return;
    setIsLoadingTransactions(true);
    const data = await getDeferrableTransactions(card.id);
    setTransactions(data);
    setIsLoadingTransactions(false);
  }, [card?.id, getDeferrableTransactions]);

  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  const selectedTransactions = useMemo(() => transactions.filter(t => selectedTxIds.has(t.id)), [selectedTxIds, transactions]);
  const totalAmount = useMemo(() => selectedTransactions.reduce((sum, t) => sum + t.amount, 0), [selectedTransactions]);
  const monthlyPayment = useMemo(() => {
    if (simulation) return simulation.monthlyFee;
    const interest = 0.15;
    return (totalAmount * (1 + (interest * (selectedMonths / 12)))) / selectedMonths;
  }, [totalAmount, selectedMonths, simulation]);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedTxIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedTxIds(newSet);
  };

  const navigateToTermStep = () => {
    setStep('term');
  };

  const navigateToSummaryStep = () => {
    if (card?.id && totalAmount > 0) {
      simulateDefer(card.id, totalAmount, selectedMonths);
    }
    setStep('summary');
  };

  const handleNext = () => {
    setDirection('forward');
    const stepActions: Record<Step, () => void> = {
      select: navigateToTermStep,
      term: navigateToSummaryStep,
      summary: () => setShowBiometrics(true),
    };
    stepActions[step]();
  };

  const handleBack = () => {
    setDirection('back');
    const backSteps: Record<Step, Step | null> = {
      summary: 'term',
      term: 'select',
      select: null,
    };
    
    const prevStep = backSteps[step];
    if (prevStep) {
      setStep(prevStep);
    } else {
      router.back();
    }
  };

  const onBiometricSuccess = async () => {
    setShowBiometrics(false);
    setIsProcessing(true);
    
    if (!card?.id) { 
      setIsProcessing(false);
      return;
    }
    
    const deferResult = await confirmDefer({ 
      cardId: card.id, 
      transactionIds: Array.from(selectedTxIds), 
      months: selectedMonths 
    });
    
    setIsProcessing(false);
    setResult({
      success: deferResult.success,
      title: deferResult.success ? 'Diferido Exitoso' : 'Error',
      message: deferResult.message,
      receiptId: deferResult.success ? generateSecureReceiptId('DEF') : undefined,
    });
  };

  if (isLoadingCard || isLoadingTransactions) return <LoadingScreen message="Cargando opciones de diferidos..." />;
  if (isProcessing) return <LoadingScreen message="Procesando diferido..." />;

  if (result) {
    return (
      <OperationResultScreen result={result} onClose={() => router.back()} card={card}
        transactionDetails={[
          { label: 'Monto Diferido', value: `$${totalAmount.toFixed(2)}`, isAmount: true },
          { label: 'Plazo', value: `${selectedMonths} meses` },
          { label: 'Cuota Aprox.', value: `$${monthlyPayment.toFixed(2)}` },
        ]}
      >
        {card && <View style={{ transform: [{ scale: 0.8 }], alignItems: 'center' }}><CreditCard card={card} /></View>}
      </OperationResultScreen>
    );
  }

  return (
    <ThemedView style={styles.container} surface={1}>
      <Animated.View exiting={SlideOutLeft} style={{ flex: 1 }}>
        <CardOperationHeader title="Diferir Consumos" card={card} onBack={handleBack} isModal={step === 'select'} />
        <ProgressHeader step={step} />

        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
          <View style={{ alignItems: 'center', marginBottom: 24 }}>{card && <CreditCard card={card} width={300} />}</View>
          
          <Animated.View key={step} entering={direction === 'forward' ? SlideInRight.duration(300) : SlideInLeft.duration(300)} exiting={direction === 'forward' ? SlideOutLeft.duration(300) : SlideOutRight.duration(300)} style={styles.stepContainer}>
            {step === 'select' && (
              <>
                <ThemedText type="title" style={styles.title}>Selecciona consumos</ThemedText>
                <ThemedText style={styles.subtitle}>Elige las compras que deseas diferir.</ThemedText>
                <View style={styles.listContainer}>
                  {transactions.map(item => <TransactionSelectItem key={item.id} item={item} isSelected={selectedTxIds.has(item.id)} onToggle={toggleSelection} />)}
                </View>
              </>
            )}
            {step === 'term' && (
              <>
                <ThemedText type="title" style={styles.title}>Elige el plazo</ThemedText>
                <ThemedText style={styles.subtitle}>Total a diferir: ${totalAmount.toFixed(2)}</ThemedText>
                <View style={styles.monthsGrid}>
                  {DEFER_MONTHS.map(m => <MonthCard key={m} months={m} isSelected={selectedMonths === m} onSelect={setSelectedMonths} />)}
                </View>
              </>
            )}
            {step === 'summary' && (
              <>
                <ThemedText type="title" style={styles.title}>Resumen</ThemedText>
                <ThemedText style={styles.subtitle}>Confirma los detalles de tu solicitud.</ThemedText>
                <SummaryPanel items={[
                  { label: 'Monto Total', value: `$${totalAmount.toFixed(2)}` },
                  { label: 'Plazo', value: `${selectedMonths} meses` },
                  { label: 'Cuota Mensual Aprox.', value: `$${monthlyPayment.toFixed(2)}`, isTotal: true },
                ]} />
                <ThemedText style={styles.disclaimer}>* Incluye intereses aproximados del 15% anual. El valor final puede variar en tu estado de cuenta.</ThemedText>
              </>
            )}
          </Animated.View>
          <PoweredBy style={{ marginTop: 40 }} />
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: theme.colors.surface, paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.totalFooter}>
            <ThemedText>Total seleccionado:</ThemedText>
            <ThemedText type="title">${totalAmount.toFixed(2)}</ThemedText>
          </View>
          <TouchableOpacity style={[styles.button, { backgroundColor: theme.tenant.mainColor, opacity: totalAmount > 0 ? 1 : 0.5 }]} disabled={totalAmount === 0} onPress={handleNext}>
            <ThemedText style={{ color: theme.colors.textInverse, fontWeight: 'bold', fontSize: 16 }}>{step === 'summary' ? 'Confirmar Diferido' : 'Siguiente'}</ThemedText>
            {step !== 'summary' && <ArrowRight size={20} color={theme.colors.textInverse} />}
          </TouchableOpacity>
        </View>
      </Animated.View>

      <BiometricGuard isVisible={showBiometrics} onSuccess={onBiometricSuccess} onCancel={() => setShowBiometrics(false)} reason="Confirma para diferir tus consumos" />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 20, flexGrow: 1 },
  stepContainer: { gap: 20 },
  title: { fontSize: 24, marginBottom: 4 },
  subtitle: { opacity: 0.7, marginBottom: 16 },
  listContainer: { gap: 12 },
  monthsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  disclaimer: { fontSize: 12, opacity: 0.6, marginTop: 8, fontStyle: 'italic' },
  footer: { padding: 20, paddingBottom: 40 },
  totalFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  button: { height: 56, borderRadius: 28, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.30, shadowRadius: 4.65, elevation: 8 },
});

