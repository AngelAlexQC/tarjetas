import { CreditCard } from '@/components/cards/credit-card';
import { BiometricGuard } from '@/components/cards/operations/biometric-guard';
import { CardOperationHeader } from '@/components/cards/operations/card-operation-header';
import { OperationResultScreen } from '@/components/cards/operations/operation-result-screen';
import { ThemedText } from '@/ui/primitives/themed-text';
import { ThemedView } from '@/ui/primitives/themed-view';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { OptionCard } from '@/components/ui/option-card';
import { PoweredBy } from '@/components/ui/powered-by';
import { ThemedButton } from '@/ui/primitives/themed-button';
import { useCardMutations, useCardOperation } from '@/domain/cards/hooks';
import { useAppTheme } from '@/ui/theming';
import type { BlockType } from '@/domain/cards/types/card.schema';
import { useRouter } from 'expo-router';
import { AlertTriangle, Lock, PauseCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, SlideOutLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BlockCardScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Hooks especializados
  const { card, cardId, isLoadingCard, isProcessing, result, executeOperation } = useCardOperation();
  const { blockCard } = useCardMutations();
  
  // Estado local de UI
  const [selectedType, setSelectedType] = useState<BlockType | null>(null);
  const [showBiometrics, setShowBiometrics] = useState(false);

  const handleBlock = () => {
    if (!selectedType) return;
    setShowBiometrics(true);
  };

  const onBiometricSuccess = async () => {
    setShowBiometrics(false);
    
    await executeOperation(
      () => blockCard({ cardId: cardId!, type: selectedType! }),
      selectedType === 'temporary' ? 'Tarjeta Pausada' : 'Tarjeta Bloqueada',
      { receiptPrefix: 'BLK' }
    );
  };

  if (isLoadingCard) {
    return <LoadingScreen message="Cargando opciones de bloqueo..." />;
  }

  if (isProcessing) {
    return <LoadingScreen message="Bloqueando tarjeta..." />;
  }

  if (result) {
    return (
      <OperationResultScreen 
        result={result} 
        onClose={() => router.back()}
        card={card}
        transactionDetails={[
          { label: 'Tipo Bloqueo', value: selectedType === 'temporary' ? 'Temporal' : 'Definitivo' },
          { label: 'Estado', value: 'Inactiva' },
          { label: 'Fecha', value: new Date().toLocaleDateString() },
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
    <ThemedView style={styles.container} surface={1}>
      <Animated.View exiting={SlideOutLeft} style={{ flex: 1 }}>
        <CardOperationHeader title="Bloquear Tarjeta" card={card} isModal />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          {card && <CreditCard card={card} width={300} />}
        </View>
        <ThemedText style={styles.description}>
          Selecciona el tipo de bloqueo que deseas aplicar a tu tarjeta.
        </ThemedText>

        <View style={styles.optionsContainer}>
          <OptionCard
            title="Bloqueo Temporal"
            description="Pausa tu tarjeta si no la encuentras. Puedes reactivarla cuando quieras."
            icon={<PauseCircle />}
            selected={selectedType === 'temporary'}
            onPress={() => setSelectedType('temporary')}
            iconColor={theme.tenant.accentColor}
          />

          <OptionCard
            title="Bloqueo Definitivo"
            description="Reportar como robada o perdida. Se cancelará la tarjeta actual y se emitirá una nueva."
            icon={<Lock />}
            selected={selectedType === 'permanent'}
            onPress={() => setSelectedType('permanent')}
            iconColor="#F44336"
          />
        </View>

        {selectedType === 'permanent' && (
          <Animated.View entering={FadeInDown} style={[styles.warningBox, { backgroundColor: '#FFEBEE' }]}>
            <AlertTriangle size={24} color="#D32F2F" />
            <ThemedText style={[styles.warningText, { color: '#D32F2F' }]}>
              Esta acción es irreversible. Tu tarjeta actual dejará de funcionar inmediatamente.
            </ThemedText>
          </Animated.View>
        )}
        <PoweredBy style={{ marginTop: 40 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20, backgroundColor: theme.colors.surface }]}>
        <ThemedButton
          title="Bloquear Tarjeta"
          onPress={handleBlock}
          disabled={!selectedType}
          variant="danger"
        />
      </View>
      </Animated.View>

      <BiometricGuard
        isVisible={showBiometrics}
        onSuccess={onBiometricSuccess}
        onCancel={() => setShowBiometrics(false)}
        reason={selectedType === 'permanent' ? 'Confirma el bloqueo definitivo' : 'Confirma el bloqueo temporal'}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 24,
    paddingBottom: 20,
    flexGrow: 1,
  },
  description: {
    textAlign: 'center',
    marginBottom: 10,
  },
  optionsContainer: {
    gap: 16,
  },
  warningBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    alignItems: 'center',
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    backgroundColor: 'transparent', // Will be overridden by theme in component if needed, or we can set it here
  },
  button: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
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
