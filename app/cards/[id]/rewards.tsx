import { CreditCard } from '@/components/cards/credit-card';
import { CardOperationHeader } from '@/components/cards/operations/card-operation-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { PoweredBy } from '@/components/ui/powered-by';
import { ThemedButton } from '@/components/ui/themed-button';
import { useCardOperation, useCardQueries } from '@/hooks/cards';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { Rewards } from '@/repositories';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function RewardsScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { card, isLoadingCard } = useCardOperation();
  const { getRewards } = useCardQueries();
  const insets = useSafeAreaInsets();

  // Estado para datos de recompensas desde el repositorio
  const [rewards, setRewards] = useState<Rewards | null>(null);
  const [isLoadingRewards, setIsLoadingRewards] = useState(true);

  // Cargar recompensas desde el repositorio
  const loadRewards = useCallback(async () => {
    if (!card?.id) return;
    setIsLoadingRewards(true);
    const data = await getRewards(card.id);
    setRewards(data);
    setIsLoadingRewards(false);
  }, [card?.id, getRewards]);

  useEffect(() => {
    loadRewards();
  }, [loadRewards]);

  const points = rewards?.totalPoints ?? 0;
  const history = rewards?.history ?? [];

  if (isLoadingCard || isLoadingRewards) {
    return <LoadingScreen message="Cargando puntos..." />;
  }

  return (
    <ThemedView style={styles.container}>
      <CardOperationHeader
        title="Mis Puntos"
        card={card}
        onBack={() => router.back()}
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          {card && <CreditCard card={card} width={300} />}
        </View>
        <ThemedView style={[styles.balanceCard, { backgroundColor: theme.tenant.mainColor }]}>
          <ThemedText style={{ color: '#FFFFFF', opacity: 0.9 }}>Puntos Disponibles</ThemedText>
          <ThemedText type="title" style={{ color: '#FFFFFF', fontSize: 40, lineHeight: 48, marginVertical: 8 }}>
            {points.toLocaleString()}
          </ThemedText>
          <ThemedText style={{ color: '#FFFFFF', opacity: 0.9 }}>Equivalente a ${(points / 100).toFixed(2)}</ThemedText>
        </ThemedView>

        <ThemedView style={[styles.card, { backgroundColor: theme.colors.surface, marginTop: 24 }]}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Historial Reciente</ThemedText>
          
          {history.map((item, index) => (
            <View key={item.id} style={[
              styles.historyItem, 
              index < history.length - 1 && { borderBottomColor: theme.colors.border, borderBottomWidth: 1 }
            ]}>
              <View>
                <ThemedText type="defaultSemiBold">{item.description}</ThemedText>
                <ThemedText style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{item.date}</ThemedText>
              </View>
              <ThemedText type="defaultSemiBold" style={{ color: theme.tenant.mainColor }}>+{item.points}</ThemedText>
            </View>
          ))}
        </ThemedView>
        <PoweredBy style={{ marginTop: 40 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: theme.colors.background }]}>
        <ThemedButton 
          title="Canjear Puntos" 
          onPress={() => {}}
        />
      </View>
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
  balanceCard: {
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    padding: 16,
    borderRadius: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)',
  },
});

export default RewardsScreen;
