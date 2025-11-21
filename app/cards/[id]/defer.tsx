import { BiometricGuard } from '@/components/cards/operations/biometric-guard';
import { CardOperationHeader } from '@/components/cards/operations/card-operation-header';
import { OperationResultScreen } from '@/components/cards/operations/operation-result-screen';
import { CreditCard } from '@/components/cards/credit-card';
import { SummaryPanel } from '@/components/cards/summary-panel';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FinancialIcons } from '@/components/ui/financial-icons';
import { cardService } from '@/features/cards/services/card-service';
import { OperationResult, Transaction } from '@/features/cards/types/card-operations';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowRight, Check } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Mock Data
const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2025-11-18', description: 'Supermaxi', amount: 156.50, currency: '$', category: 'shopping', canDefer: true },
  { id: '2', date: '2025-11-17', description: 'Uber Trip', amount: 12.25, currency: '$', category: 'transport', canDefer: true },
  { id: '3', date: '2025-11-15', description: 'Netflix', amount: 14.99, currency: '$', category: 'entertainment', canDefer: false }, // Too small/subscription
  { id: '4', date: '2025-11-14', description: 'Zara Fashion', amount: 89.90, currency: '$', category: 'shopping', canDefer: true },
  { id: '5', date: '2025-11-10', description: 'Restaurante El Cielo', amount: 45.00, currency: '$', category: 'food', canDefer: true },
];

const DEFER_MONTHS = [3, 6, 9, 12, 24];

type Step = 'select' | 'term' | 'summary';

export default function DeferScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const card = cardService.getCardById(id!);
  const insets = useSafeAreaInsets();
  
  const [step, setStep] = useState<Step>('select');
  const [selectedTxIds, setSelectedTxIds] = useState<Set<string>>(new Set());
  const [selectedMonths, setSelectedMonths] = useState<number>(3);
  const [showBiometrics, setShowBiometrics] = useState(false);
  const [result, setResult] = useState<OperationResult | null>(null);

  // Derived state
  const selectedTransactions = useMemo(() => 
    MOCK_TRANSACTIONS.filter(t => selectedTxIds.has(t.id)), 
  [selectedTxIds]);

  const totalAmount = useMemo(() => 
    selectedTransactions.reduce((sum, t) => sum + t.amount, 0), 
  [selectedTransactions]);

  // Mock calculation
  const monthlyPayment = useMemo(() => {
    const interest = 0.15; // 15% annual mock
    const totalWithInterest = totalAmount * (1 + (interest * (selectedMonths / 12)));
    return totalWithInterest / selectedMonths;
  }, [totalAmount, selectedMonths]);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedTxIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedTxIds(newSet);
  };

  const handleNext = () => {
    if (step === 'select') setStep('term');
    else if (step === 'term') setStep('summary');
    else if (step === 'summary') setShowBiometrics(true);
  };

  const handleBack = () => {
    if (step === 'summary') setStep('term');
    else if (step === 'term') setStep('select');
    else router.back();
  };

  const onBiometricSuccess = () => {
    setShowBiometrics(false);
    setTimeout(() => {
      setResult({
        success: true,
        title: 'Diferido Exitoso',
        message: `Has diferido $${totalAmount.toFixed(2)} a ${selectedMonths} meses.`,
        receiptId: `DEF-${Math.floor(Math.random() * 10000)}`,
      });
    }, 1000);
  };

  if (result) {
    return <OperationResultScreen result={result} onClose={() => router.back()} />;
  }

  return (
    <ThemedView style={styles.container} surface="level1">
      <CardOperationHeader 
        title="Diferir Consumos" 
        card={card}
        onBack={handleBack}
        isModal
      />
      
      {/* Header Progress */}
      <View style={styles.progressHeader}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: step === 'select' ? '33%' : step === 'term' ? '66%' : '100%', backgroundColor: theme.tenant.mainColor }]} />
        </View>
        <ThemedText style={styles.stepText}>
          {step === 'select' ? '1/3' : step === 'term' ? '2/3' : '3/3'}
        </ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          {card && <CreditCard card={card} width={300} />}
        </View>
        <Animated.View 
          key={step}
          entering={SlideInRight.duration(300)} 
          exiting={SlideOutLeft.duration(300)}
          style={styles.stepContainer}
        >
          {step === 'select' && (
            <>
              <ThemedText type="title" style={styles.title}>Selecciona consumos</ThemedText>
              <ThemedText style={styles.subtitle}>Elige las compras que deseas diferir.</ThemedText>
              
              <View style={styles.listContainer}>
                {MOCK_TRANSACTIONS.map((item) => {
                  const isSelected = selectedTxIds.has(item.id);
                  const categoryIconMap: Record<string, keyof typeof FinancialIcons> = {
                    shopping: 'wallet',
                    transport: 'transfer',
                    entertainment: 'chart',
                    food: 'money',
                  };
                  const iconKey = categoryIconMap[item.category] || 'wallet';
                  const Icon = FinancialIcons[iconKey];
                  
                  return (
                    <Pressable 
                      key={item.id} 
                      onPress={() => item.canDefer && toggleSelection(item.id)}
                      style={[
                        styles.txItem, 
                        { opacity: item.canDefer ? 1 : 0.5, backgroundColor: isSelected ? theme.colors.surfaceHigher : 'transparent' }
                      ]}
                    >
                      <View style={[styles.checkbox, { borderColor: isSelected ? theme.tenant.mainColor : theme.colors.border, backgroundColor: isSelected ? theme.tenant.mainColor : 'transparent' }]}>
                        {isSelected && <Check size={14} color="#FFF" />}
                      </View>
                      
                      <View style={[styles.iconBox, { backgroundColor: theme.colors.surfaceHigher }]}>
                        <Icon size={20} color={theme.colors.textSecondary} />
                      </View>
                      
                      <View style={styles.txInfo}>
                        <ThemedText type="defaultSemiBold">{item.description}</ThemedText>
                        <ThemedText style={styles.date}>{item.date}</ThemedText>
                      </View>
                      
                      <ThemedText type="defaultSemiBold">{item.currency}{item.amount.toFixed(2)}</ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          {step === 'term' && (
            <>
              <ThemedText type="title" style={styles.title}>Elige el plazo</ThemedText>
              <ThemedText style={styles.subtitle}>Total a diferir: ${totalAmount.toFixed(2)}</ThemedText>
              
              <View style={styles.monthsGrid}>
                {DEFER_MONTHS.map((months) => {
                  const isSelected = selectedMonths === months;
                  return (
                    <TouchableOpacity
                      key={months}
                      onPress={() => setSelectedMonths(months)}
                      style={[
                        styles.monthCard,
                        { 
                          borderColor: isSelected ? theme.tenant.mainColor : theme.colors.border,
                          backgroundColor: isSelected ? theme.colors.surfaceHigher : theme.colors.surface
                        }
                      ]}
                    >
                      <ThemedText type="title" style={{ color: isSelected ? theme.tenant.mainColor : theme.colors.text }}>
                        {months}
                      </ThemedText>
                      <ThemedText>meses</ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {step === 'summary' && (
            <>
              <ThemedText type="title" style={styles.title}>Resumen</ThemedText>
              <ThemedText style={styles.subtitle}>Confirma los detalles de tu solicitud.</ThemedText>
              
              <SummaryPanel 
                items={[
                  { label: 'Monto Total', value: `$${totalAmount.toFixed(2)}` },
                  { label: 'Plazo', value: `${selectedMonths} meses` },
                  { label: 'Cuota Mensual Aprox.', value: `$${monthlyPayment.toFixed(2)}`, isTotal: true },
                ]}
              />
              <ThemedText style={styles.disclaimer}>
                * Incluye intereses aproximados del 15% anual. El valor final puede variar en tu estado de cuenta.
              </ThemedText>
            </>
          )}
        </Animated.View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.surface, paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.totalFooter}>
          <ThemedText>Total seleccionado:</ThemedText>
          <ThemedText type="title">${totalAmount.toFixed(2)}</ThemedText>
        </View>
        
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: theme.tenant.mainColor, opacity: totalAmount > 0 ? 1 : 0.5 }
          ]}
          disabled={totalAmount === 0}
          onPress={handleNext}
        >
          <ThemedText style={{ color: theme.colors.textInverse, fontWeight: 'bold', fontSize: 16 }}>
            {step === 'summary' ? 'Confirmar Diferido' : 'Siguiente'}
          </ThemedText>
          {step !== 'summary' && <ArrowRight size={20} color={theme.colors.textInverse} />}
        </TouchableOpacity>
      </View>

      <BiometricGuard
        isVisible={showBiometrics}
        onSuccess={onBiometricSuccess}
        onCancel={() => setShowBiometrics(false)}
        reason="Confirma para diferir tus consumos"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  progressContainer: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(150,150,150,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  stepText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  stepContainer: {
    gap: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 4,
  },
  subtitle: {
    opacity: 0.7,
    marginBottom: 16,
  },
  listContainer: {
    gap: 12,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txInfo: {
    flex: 1,
  },
  date: {
    fontSize: 12,
    opacity: 0.6,
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  monthCard: {
    width: '48%',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    padding: 24,
    borderRadius: 16,
    gap: 16,
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
  disclaimer: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 8,
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: 'transparent', // Should handle blur or solid background if needed, but simple for now
  },
  totalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  button: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  }
});
