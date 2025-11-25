import { CreditCard } from '@/components/cards/credit-card';
import { CardOperationHeader } from '@/components/cards/operations/card-operation-header';
import { OperationResultScreen } from '@/components/cards/operations/operation-result-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PoweredBy } from '@/components/ui/powered-by';
import { ThemedButton } from '@/components/ui/themed-button';
import { ThemedInput } from '@/components/ui/themed-input';
import { cardService } from '@/features/cards/services/card-service';
import { OperationResult } from '@/features/cards/types/card-operations';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useKeyboard } from '@/hooks/use-keyboard';
import { cardRepository$ } from '@/repositories';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TravelNoticeScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const card = cardService.getCardById(id!);
  const insets = useSafeAreaInsets();
  const { isKeyboardVisible } = useKeyboard();

  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [result, setResult] = useState<OperationResult | null>(null);

  const handleSave = async () => {
    try {
      const repo = cardRepository$();
      const response = await repo.createTravelNotice({
        cardId: id!,
        destination,
        startDate,
        endDate,
      });
      
      // Extraer receiptId del data si existe
      const receiptData = response.data as { receiptId?: string } | undefined;
      
      setResult({
        success: response.success,
        title: response.success ? 'Aviso Registrado' : 'Error',
        message: response.message,
        receiptId: receiptData?.receiptId,
      });
    } catch (error) {
      setResult({
        success: false,
        title: 'Error',
        message: error instanceof Error ? error.message : 'Error al registrar aviso de viaje',
      });
    }
  };

  if (result) {
    return (
      <OperationResultScreen
        result={result}
        onClose={() => router.back()}
        card={card}
        transactionDetails={[
          { label: 'Destino', value: destination },
          { label: 'Fecha Salida', value: startDate },
          { label: 'Fecha Retorno', value: endDate },
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <CardOperationHeader
          title="Aviso de Viaje"
          card={card}
          onBack={() => router.back()}
        />

        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={[styles.content, { paddingBottom: 20 }]}
        >
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            {card && <CreditCard card={card} width={300} />}
          </View>
          <ThemedView style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Detalles del Viaje</ThemedText>
          
          <ThemedInput
            label="Destino (País/Ciudad)"
            value={destination}
            onChangeText={setDestination}
            placeholder="Ej. Estados Unidos"
            containerStyle={{ marginBottom: 16 }}
          />

          <View style={styles.row}>
            <ThemedInput
              label="Fecha Salida"
              value={startDate}
              onChangeText={setStartDate}
              placeholder="DD/MM/AAAA"
              keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
              containerStyle={{ flex: 1, marginRight: 8 }}
            />
            <ThemedInput
              label="Fecha Retorno"
              value={endDate}
              onChangeText={setEndDate}
              placeholder="DD/MM/AAAA"
              keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'}
              containerStyle={{ flex: 1, marginLeft: 8 }}
            />
          </View>
        </ThemedView>

        <ThemedView style={[styles.infoCard, { backgroundColor: theme.colors.surfaceElevated }]}>
          <ThemedText type="defaultSemiBold" style={{ marginBottom: 4 }}>Información Importante</ThemedText>
          <ThemedText style={{ fontSize: 13, opacity: 0.8 }}>
            • Registra tu viaje al menos 24 horas antes de salir.
            {'\n'}• Asegúrate de que tu tarjeta esté activa y con cupo disponible.
            {'\n'}• Los consumos en el exterior pueden estar sujetos a impuestos locales.
          </ThemedText>
        </ThemedView>
        <PoweredBy style={{ marginTop: 40 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: isKeyboardVisible ? 16 : insets.bottom + 16, backgroundColor: theme.colors.background }]}>
        <ThemedButton 
          title="Registrar Aviso" 
          onPress={handleSave}
          disabled={!destination || !startDate || !endDate}
        />
      </View>
      </KeyboardAvoidingView>
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
  row: {
    flexDirection: 'row',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)',
  },
});
