import { CreditCard } from '@/components/cards/credit-card';
import { CardOperationHeader } from '@/components/cards/operations/card-operation-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedButton } from '@/components/ui/themed-button';
import { cardService } from '@/features/cards/services/card-service';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function RewardsScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const card = cardService.getCardById(id!);
  const insets = useSafeAreaInsets();

  // Mock data
  const points = 12500;
  const history = [
    { id: 1, description: 'Compra Supermaxi', points: 150, date: '20 Nov' },
    { id: 2, description: 'Uber Eats', points: 45, date: '19 Nov' },
    { id: 3, description: 'Netflix', points: 12, date: '15 Nov' },
    { id: 4, description: 'Bono Bienvenida', points: 5000, date: '01 Nov' },
  ];

  return (
    <ThemedView style={styles.container}>
      <CardOperationHeader
        title="Mis Puntos"
        card={card}
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
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
              <ThemedText type="defaultSemiBold" style={{ color: theme.tenant.successColor }}>+{item.points}</ThemedText>
            </View>
          ))}
        </ThemedView>
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
