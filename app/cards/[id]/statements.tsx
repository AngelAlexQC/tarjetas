import { CreditCard } from '@/components/cards/credit-card';
import { CardOperationHeader } from '@/components/cards/operations/card-operation-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FinancialIcons } from '@/components/ui/financial-icons';
import { cardService } from '@/features/cards/services/card-service';
import { useAppTheme } from '@/hooks/use-app-theme';
import { printToFileAsync } from 'expo-print';
import { useLocalSearchParams } from 'expo-router';
import { shareAsync } from 'expo-sharing';
import { ArrowDownToLine, Calendar, Check, ChevronDown } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Mock Data
type TransactionType = 'purchase' | 'payment' | 'transfer' | 'fee';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
}

const MOCK_TRANSACTIONS: Transaction[] = Array.from({ length: 50 }).map((_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - i);
  const types: TransactionType[] = ['purchase', 'purchase', 'purchase', 'payment', 'transfer'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  return {
    id: `tx-${i}`,
    date: date.toISOString().split('T')[0],
    description: type === 'payment' ? 'Pago de Tarjeta' : `Comercio Ejemplo ${i}`,
    amount: type === 'payment' ? Math.random() * 500 : Math.random() * 100,
    type,
    category: type === 'payment' ? 'financial' : 'shopping',
  };
});

const DATE_RANGES = [
  { id: '30', label: 'Últimos 30 días' },
  { id: '60', label: 'Últimos 60 días' },
  { id: '90', label: 'Últimos 90 días' },
  { id: 'current', label: 'Mes Actual' },
  { id: 'last', label: 'Mes Anterior' },
];

export default function StatementsScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const card = cardService.getCardById(id!);
  
  const [selectedRange, setSelectedRange] = useState(DATE_RANGES[0]);
  const [showRangeModal, setShowRangeModal] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'purchase' | 'payment'>('all');
  const [isExporting, setIsExporting] = useState(false);

  // Filter logic
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let startDate = new Date();
    
    if (selectedRange.id === '30') startDate.setDate(now.getDate() - 30);
    else if (selectedRange.id === '60') startDate.setDate(now.getDate() - 60);
    else if (selectedRange.id === '90') startDate.setDate(now.getDate() - 90);
    else if (selectedRange.id === 'current') startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    else if (selectedRange.id === 'last') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      now.setDate(0); // End of last month
    }

    return MOCK_TRANSACTIONS.filter(t => {
      const tDate = new Date(t.date);
      const dateMatch = tDate >= startDate && tDate <= now;
      
      if (!dateMatch) return false;
      
      if (filterType === 'all') return true;
      if (filterType === 'payment') return t.type === 'payment';
      if (filterType === 'purchase') return t.type !== 'payment';
      
      return true;
    });
  }, [selectedRange, filterType]);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      const html = `
        <html>
          <head>
            <style>
              body { font-family: Helvetica, Arial, sans-serif; padding: 20px; }
              h1 { color: ${theme.tenant.mainColor}; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .amount { text-align: right; }
              .header { margin-bottom: 30px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Estado de Cuenta</h1>
              <p><strong>Tarjeta:</strong> •••• 9010</p>
              <p><strong>Periodo:</strong> ${selectedRange.label}</p>
              <p><strong>Fecha de emisión:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Tipo</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                ${filteredTransactions.map(t => `
                  <tr>
                    <td>${t.date}</td>
                    <td>${t.description}</td>
                    <td>${t.type === 'payment' ? 'Pago' : 'Consumo'}</td>
                    <td class="amount" style="color: ${t.type === 'payment' ? 'green' : 'black'}">
                      ${t.type === 'payment' ? '-' : ''}$${t.amount.toFixed(2)}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;

      const { uri } = await printToFileAsync({ html });
      await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo generar el estado de cuenta');
    } finally {
      setIsExporting(false);
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isPayment = item.type === 'payment';
    const Icon = isPayment ? FinancialIcons.money : FinancialIcons.wallet;
    
    return (
      <View style={[styles.txItem, { borderBottomColor: theme.colors.borderSubtle }]}>
        <View style={[styles.iconBox, { backgroundColor: isPayment ? theme.colors.surfaceHigher : theme.colors.surface }]}>
          <Icon size={20} color={isPayment ? theme.tenant.mainColor : theme.colors.textSecondary} />
        </View>
        <View style={styles.txContent}>
          <ThemedText type="defaultSemiBold">{item.description}</ThemedText>
          <ThemedText style={styles.date}>{item.date}</ThemedText>
        </View>
        <ThemedText 
          type="defaultSemiBold" 
          style={{ color: isPayment ? '#4CAF50' : theme.colors.text }}
        >
          {isPayment ? '+' : '-'}${item.amount.toFixed(2)}
        </ThemedText>
      </View>
    );
  };

  function FilterChip({ label, selected, onPress, theme }: any) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.chip,
          { 
            backgroundColor: selected ? theme.tenant.mainColor : 'transparent',
            borderColor: selected ? theme.tenant.mainColor : theme.colors.border,
          }
        ]}
      >
        <ThemedText style={{ color: selected ? '#FFF' : theme.colors.text, fontSize: 12, fontWeight: selected ? 'bold' : 'normal' }}>
          {label}
        </ThemedText>
      </TouchableOpacity>
    );
  }

  return (
    <ThemedView style={styles.container} surface="level1">
      <CardOperationHeader title="Estados de Cuenta" card={card} isModal />

      <View style={{ alignItems: 'center', marginVertical: 16 }}>
        {card && <CreditCard card={card} width={300} />}
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <View style={styles.filterRow}>
          <TouchableOpacity 
            style={[styles.filterButton, { borderColor: theme.colors.border }]}
            onPress={() => setShowRangeModal(true)}
          >
            <Calendar size={16} color={theme.colors.textSecondary} />
            <ThemedText>{selectedRange.label}</ThemedText>
            <ChevronDown size={16} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1, marginLeft: 8 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <FilterChip 
                label="Todos" 
                selected={filterType === 'all'} 
                onPress={() => setFilterType('all')} 
                theme={theme}
              />
              <FilterChip 
                label="Compras" 
                selected={filterType === 'purchase'} 
                onPress={() => setFilterType('purchase')} 
                theme={theme}
              />
              <FilterChip 
                label="Pagos" 
                selected={filterType === 'payment'} 
                onPress={() => setFilterType('payment')} 
                theme={theme}
              />
            </View>
          </ScrollView>
        </View>
        
        <View style={styles.statsContainer}>
          <ThemedText style={styles.statsLabel}>Movimientos: {filteredTransactions.length}</ThemedText>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <ThemedText>No hay movimientos en este periodo</ThemedText>
          </View>
        }
      />

      {/* Export Button */}
      <View style={[styles.footer, { backgroundColor: theme.colors.surface, paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={[styles.exportButton, { backgroundColor: theme.tenant.mainColor }]}
          onPress={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <ArrowDownToLine size={20} color="#FFF" />
              <ThemedText style={styles.exportButtonText}>Exportar PDF</ThemedText>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Range Modal */}
      <Modal
        visible={showRangeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRangeModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowRangeModal(false)}>
          <Animated.View 
            entering={SlideInDown} 
            exiting={SlideOutDown}
            style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}
          >
            <ThemedText type="subtitle" style={styles.modalTitle}>Seleccionar Periodo</ThemedText>
            {DATE_RANGES.map(range => (
              <TouchableOpacity
                key={range.id}
                style={[
                  styles.rangeOption, 
                  { backgroundColor: selectedRange.id === range.id ? theme.colors.surfaceHigher : 'transparent' }
                ]}
                onPress={() => {
                  setSelectedRange(range);
                  setShowRangeModal(false);
                }}
              >
                <ThemedText style={{ fontWeight: selectedRange.id === range.id ? 'bold' : 'normal' }}>
                  {range.label}
                </ThemedText>
                {selectedRange.id === range.id && (
                  <Check size={20} color={theme.tenant.mainColor} />
                )}
              </TouchableOpacity>
            ))}
          </Animated.View>
        </Pressable>
      </Modal>
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
  cardPreviewContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  cardPreview: {
    borderRadius: 16,
    padding: 20,
    height: 100,
    justifyContent: 'space-between',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  cardNumber: {
    color: '#FFF',
    fontSize: 18,
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  cardName: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardExp: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  statsLabel: {
    opacity: 0.6,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 140,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txContent: {
    flex: 1,
  },
  date: {
    fontSize: 12,
    opacity: 0.6,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  exportButton: {
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
  exportButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    gap: 16,
  },
  modalTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  rangeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
});
