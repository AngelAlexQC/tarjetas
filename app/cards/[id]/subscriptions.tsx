import { CardOperationHeader } from '@/components/cards/operations/card-operation-header';
import { CreditCard } from '@/components/cards/credit-card';
import { SummaryPanel } from '@/components/cards/summary-panel';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FinancialIcons } from '@/components/ui/financial-icons';
import { cardService } from '@/features/cards/services/card-service';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AlertCircle, PauseCircle, PlayCircle } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

// Mock Data
interface Subscription {
  id: string;
  name: string;
  plan: string;
  amount: number;
  currency: string;
  nextBilling: string;
  status: 'active' | 'paused';
  category: 'entertainment' | 'software' | 'shopping';
}

const MOCK_SUBSCRIPTIONS: Subscription[] = [
  { id: '1', name: 'Netflix', plan: 'Premium 4K', amount: 15.99, currency: '$', nextBilling: '2025-11-25', status: 'active', category: 'entertainment' },
  { id: '2', name: 'Spotify', plan: 'Duo Plan', amount: 12.99, currency: '$', nextBilling: '2025-11-28', status: 'active', category: 'entertainment' },
  { id: '3', name: 'Adobe Creative Cloud', plan: 'Photography', amount: 19.99, currency: '$', nextBilling: '2025-12-01', status: 'active', category: 'software' },
  { id: '4', name: 'Amazon Prime', plan: 'Annual', amount: 8.99, currency: '$', nextBilling: '2025-12-05', status: 'paused', category: 'shopping' },
  { id: '5', name: 'Microsoft 365', plan: 'Personal', amount: 6.99, currency: '$', nextBilling: '2025-12-10', status: 'active', category: 'software' },
];

export default function SubscriptionsScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const card = cardService.getCardById(id!);
  
  const [subscriptions, setSubscriptions] = useState(MOCK_SUBSCRIPTIONS);

  const totalMonthly = useMemo(() => 
    subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + s.amount, 0), 
  [subscriptions]);

  const handleToggleStatus = (id: string) => {
    const sub = subscriptions.find(s => s.id === id);
    if (!sub) return;

    const newStatus = sub.status === 'active' ? 'paused' : 'active';
    const action = newStatus === 'active' ? 'reactivar' : 'pausar';

    Alert.alert(
      `¿${action.charAt(0).toUpperCase() + action.slice(1)} suscripción?`,
      `¿Estás seguro que deseas ${action} el pago automático de ${sub.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          style: newStatus === 'active' ? 'default' : 'destructive',
          onPress: () => {
            setSubscriptions(prev => prev.map(s => 
              s.id === id ? { ...s, status: newStatus } : s
            ));
          }
        }
      ]
    );
  };

  const renderItem = ({ item, index }: { item: Subscription, index: number }) => {
    const isActive = item.status === 'active';
    
    return (
      <Animated.View 
        entering={FadeInDown.delay(index * 100)} 
        layout={Layout.springify()}
        style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: isActive ? theme.colors.surfaceHigher : theme.colors.surface }]}>
            {item.category === 'entertainment' ? <FinancialIcons.chart size={20} color={theme.colors.text} /> :
             item.category === 'software' ? <FinancialIcons.chart size={20} color={theme.colors.text} /> :
             <FinancialIcons.wallet size={20} color={theme.colors.text} />}
          </View>
          <View style={styles.cardInfo}>
            <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
            <ThemedText style={styles.planText}>{item.plan}</ThemedText>
          </View>
          <View style={styles.amountContainer}>
            <ThemedText type="defaultSemiBold">{item.currency}{item.amount.toFixed(2)}</ThemedText>
            <ThemedText style={styles.periodText}>/mes</ThemedText>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.colors.borderSubtle }]} />

        <View style={styles.cardFooter}>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: isActive ? '#4CAF50' : '#FF9800' }]} />
            <ThemedText style={{ fontSize: 12, color: isActive ? '#4CAF50' : '#FF9800', fontWeight: 'bold' }}>
              {isActive ? 'Activa' : 'Pausada'}
            </ThemedText>
          </View>
          
          <ThemedText style={styles.dateText}>Próx. cobro: {item.nextBilling}</ThemedText>

          <TouchableOpacity 
            onPress={() => handleToggleStatus(item.id)}
            style={[styles.actionButton, { backgroundColor: isActive ? 'rgba(255,0,0,0.1)' : 'rgba(76,175,80,0.1)' }]}
          >
            {isActive ? (
              <PauseCircle size={18} color="#D32F2F" />
            ) : (
              <PlayCircle size={18} color="#388E3C" />
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <ThemedView style={styles.container} surface="level1">
      <CardOperationHeader title="Suscripciones" card={card} isModal />

      <View style={{ alignItems: 'center', marginVertical: 16 }}>
        {card && <CreditCard card={card} width={300} />}
      </View>

      {/* Summary */}
      <View style={styles.summaryContainer}>
        <SummaryPanel 
          items={[
            { label: 'Total Mensual', value: `$${totalMonthly.toFixed(2)}`, isTotal: true }
          ]}
        />
        <ThemedText style={styles.summaryNote}>
          Gestiona tus pagos recurrentes y evita cobros no deseados.
        </ThemedText>
      </View>

      <FlatList
        data={subscriptions}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
  summaryContainer: {
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 4,
  },
  summaryAmount: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryNote: {
    fontSize: 12,
    opacity: 0.6,
    paddingHorizontal: 4,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
    gap: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  planText: {
    fontSize: 12,
    opacity: 0.6,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  periodText: {
    fontSize: 10,
    opacity: 0.6,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dateText: {
    fontSize: 12,
    opacity: 0.6,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
  },
});
