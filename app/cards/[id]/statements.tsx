import { CreditCard } from '@/components/cards/credit-card';
import { CardOperationHeader } from '@/components/cards/operations/card-operation-header';
import { DateRangeButton, DateRangeModal, FilterChip, TransactionItem } from '@/components/cards/operations/statements-components';
import { SummaryPanel } from '@/components/cards/summary-panel';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { PoweredBy } from '@/components/ui/powered-by';
import { useCardOperation, useCardQueries } from '@/hooks/cards';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useStatementExport } from '@/hooks/use-statement-export';
import type { Statement, Transaction } from '@/repositories';
import { useRouter } from 'expo-router';
import { Download } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DATE_RANGES = [
  { id: 'current', label: 'Mes Actual' },
  { id: 'previous', label: 'Mes Anterior' },
  { id: '3months', label: 'Últimos 3 meses' },
  { id: '6months', label: 'Últimos 6 meses' },
  { id: 'year', label: 'Último año' },
];

type TransactionWithType = Transaction & { type: 'purchase' | 'payment' | 'transfer' | 'fee' };

export default function StatementsScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { card, isLoadingCard } = useCardOperation();
  const { getStatement } = useCardQueries();
  const { isExporting, exportToPdf } = useStatementExport();
  
  const [selectedRange, setSelectedRange] = useState(DATE_RANGES[0]);
  const [showRangeModal, setShowRangeModal] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'purchase' | 'payment'>('all');
  const [statement, setStatement] = useState<Statement | null>(null);
  const [isLoadingStatement, setIsLoadingStatement] = useState(true);

  const loadStatement = useCallback(async () => {
    if (!card?.id) return;
    setIsLoadingStatement(true);
    const data = await getStatement(card.id);
    setStatement(data);
    setIsLoadingStatement(false);
  }, [card?.id, selectedRange.id, getStatement]);

  useEffect(() => { loadStatement(); }, [loadStatement]);

  const transactions = useMemo(() => {
    if (!statement) return [];
    const txs = statement.transactions.map(t => ({ ...t, type: t.amount < 0 ? 'payment' : 'purchase' } as TransactionWithType));
    if (filterType === 'all') return txs;
    return txs.filter(t => t.type === filterType);
  }, [statement, filterType]);

  const summary = useMemo(() => {
    const payments = transactions.filter(t => t.type === 'payment').reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const purchases = transactions.filter(t => t.type !== 'payment').reduce((sum, t) => sum + t.amount, 0);
    return { payments, purchases, balance: purchases - payments };
  }, [transactions]);

  const handleExport = () => {
    exportToPdf({ rangeLabel: selectedRange.label, cardNumber: card?.cardNumber, transactions });
  };

  const handleRangeSelect = (range: typeof DATE_RANGES[0]) => { setSelectedRange(range); setShowRangeModal(false); };

  if (isLoadingCard || isLoadingStatement) return <LoadingScreen message="Cargando estado de cuenta..." />;

  return (
    <ThemedView style={styles.container} surface={1}>
      <CardOperationHeader title="Estado de Cuenta" card={card} onBack={() => router.back()} />

      <View style={styles.filters}>
        <DateRangeButton selectedRange={selectedRange} onPress={() => setShowRangeModal(true)} />
        <View style={styles.chipGroup}>
          <FilterChip label="Todos" selected={filterType === 'all'} onPress={() => setFilterType('all')} theme={theme} />
          <FilterChip label="Consumos" selected={filterType === 'purchase'} onPress={() => setFilterType('purchase')} theme={theme} />
          <FilterChip label="Pagos" selected={filterType === 'payment'} onPress={() => setFilterType('payment')} theme={theme} />
        </View>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            <View style={{ alignItems: 'center', marginBottom: 24 }}>{card && <CreditCard card={card} width={300} />}</View>
            <SummaryPanel items={[
              { label: 'Consumos', value: `$${summary.purchases.toFixed(2)}` },
              { label: 'Pagos', value: `$${summary.payments.toFixed(2)}` },
              { label: 'Saldo', value: `$${summary.balance.toFixed(2)}`, isTotal: true },
            ]} style={{ marginBottom: 24 }} />
            <ThemedText type="subtitle" style={{ marginBottom: 16 }}>Movimientos</ThemedText>
          </View>
        }
        renderItem={({ item }) => <TransactionItem item={item} />}
        ListEmptyComponent={<ThemedText style={styles.empty}>No hay movimientos en este periodo.</ThemedText>}
        ListFooterComponent={<PoweredBy style={{ marginTop: 40, marginBottom: insets.bottom + 100 }} />}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity style={[styles.exportButton, { backgroundColor: theme.tenant.mainColor }]} onPress={handleExport} disabled={isExporting}>
          {isExporting ? <ActivityIndicator color="#FFF" /> : (
            <>
              <Download size={20} color="#FFF" />
              <ThemedText style={{ color: '#FFF', fontWeight: 'bold' }}>Descargar PDF</ThemedText>
            </>
          )}
        </TouchableOpacity>
      </View>

      <DateRangeModal visible={showRangeModal} ranges={DATE_RANGES} selectedRange={selectedRange} onSelect={handleRangeSelect} onClose={() => setShowRangeModal(false)} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filters: { paddingHorizontal: 20, paddingVertical: 12, gap: 12 },
  chipGroup: { flexDirection: 'row', gap: 8 },
  content: { paddingHorizontal: 20 },
  headerContent: { marginBottom: 16 },
  empty: { textAlign: 'center', opacity: 0.6, paddingVertical: 40 },
  footer: { padding: 20, paddingBottom: 40, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  exportButton: { height: 56, borderRadius: 28, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65, elevation: 8 },
});
