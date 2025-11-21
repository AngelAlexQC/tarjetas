import { CreditCard } from '@/components/cards/credit-card';
import { CardOperationHeader } from '@/components/cards/operations/card-operation-header';
import { OperationResultScreen } from '@/components/cards/operations/operation-result-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedButton } from '@/components/ui/themed-button';
import { cardService } from '@/features/cards/services/card-service';
import { OperationResult } from '@/features/cards/types/card-operations';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function ReplaceCardScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const card = cardService.getCardById(id!);
  const insets = useSafeAreaInsets();

  const [reason, setReason] = useState<'damaged' | 'lost' | 'stolen' | null>(null);
  const [result, setResult] = useState<OperationResult | null>(null);

  const handleReplace = () => {
    // Simulate API call
    setTimeout(() => {
      setResult({
        success: true,
        title: 'Solicitud Recibida',
        message: 'Tu nueva tarjeta será enviada a tu dirección registrada en 3-5 días hábiles.',
        receiptId: `REP-${Math.floor(Math.random() * 10000)}`,
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
          { label: 'Motivo', value: reason === 'damaged' ? 'Deterioro' : reason === 'lost' ? 'Pérdida' : 'Robo' },
          { label: 'Dirección Envío', value: 'Av. Amazonas N34-123' },
          { label: 'Costo', value: '$0.00' },
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
      <CardOperationHeader
        title="Reposición de Tarjeta"
        card={card}
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          {card && <CreditCard card={card} width={300} />}
        </View>
        <ThemedView style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Motivo de la reposición</ThemedText>
          
          <TouchableOpacity 
            style={[
              styles.option, 
              reason === 'damaged' && { borderColor: theme.tenant.mainColor, borderWidth: 2 }
            ]}
            onPress={() => setReason('damaged')}
          >
            <ThemedText type="defaultSemiBold">Deterioro</ThemedText>
            <ThemedText style={{ color: theme.colors.textSecondary, fontSize: 12 }}>El chip o la banda no funcionan</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.option, 
              reason === 'lost' && { borderColor: theme.tenant.mainColor, borderWidth: 2 }
            ]}
            onPress={() => setReason('lost')}
          >
            <ThemedText type="defaultSemiBold">Pérdida</ThemedText>
            <ThemedText style={{ color: theme.colors.textSecondary, fontSize: 12 }}>No encuentro mi tarjeta</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.option, 
              reason === 'stolen' && { borderColor: theme.tenant.mainColor, borderWidth: 2 }
            ]}
            onPress={() => setReason('stolen')}
          >
            <ThemedText type="defaultSemiBold">Robo</ThemedText>
            <ThemedText style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Me robaron la tarjeta</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={[styles.infoCard, { backgroundColor: theme.colors.surfaceElevated }]}>
          <ThemedText type="defaultSemiBold" style={{ marginBottom: 4 }}>Dirección de Envío</ThemedText>
          <ThemedText style={{ fontSize: 13, opacity: 0.8 }}>
            Av. Amazonas N34-123 y Pereira{'\n'}
            Quito, Ecuador
          </ThemedText>
          <ThemedText style={{ fontSize: 12, color: theme.tenant.mainColor, marginTop: 8 }}>
            Cambiar dirección
          </ThemedText>
        </ThemedView>

        <ThemedText style={styles.costText}>
          Costo de reposición: $5.00 + IVA
        </ThemedText>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: theme.colors.background }]}>
        <ThemedButton 
          title="Solicitar Reposición" 
          onPress={handleReplace}
          disabled={!reason}
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
  card: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  option: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
  },
  costText: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 12,
    opacity: 0.7,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)',
  },
});

export default ReplaceCardScreen;
