import { BiometricGuard } from '@/components/cards/operations/biometric-guard';
import { OperationResultScreen } from '@/components/cards/operations/operation-result-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BlockType, OperationResult } from '@/features/cards/types/card-operations';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useRouter } from 'expo-router';
import { AlertTriangle, Lock, PauseCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function BlockCardScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  
  const [selectedType, setSelectedType] = useState<BlockType | null>(null);
  const [showBiometrics, setShowBiometrics] = useState(false);
  const [result, setResult] = useState<OperationResult | null>(null);

  const handleBlock = () => {
    if (!selectedType) return;
    setShowBiometrics(true);
  };

  const onBiometricSuccess = () => {
    setShowBiometrics(false);
    // Simulate API call
    setTimeout(() => {
      setResult({
        success: true,
        title: selectedType === 'temporary' ? 'Tarjeta Pausada' : 'Tarjeta Bloqueada',
        message: selectedType === 'temporary' 
          ? 'Tu tarjeta ha sido pausada temporalmente. Puedes reactivarla en cualquier momento.'
          : 'Tu tarjeta ha sido bloqueada definitivamente. Se ha generado una solicitud de reposición.',
        receiptId: `BLK-${Math.floor(Math.random() * 10000)}`,
      });
    }, 1000);
  };

  if (result) {
    return <OperationResultScreen result={result} onClose={() => router.back()} />;
  }

  return (
    <ThemedView style={styles.container} surface="level1">
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText style={styles.description}>
          Selecciona el tipo de bloqueo que deseas aplicar a tu tarjeta.
        </ThemedText>

        <View style={styles.optionsContainer}>
          <OptionCard
            type="temporary"
            title="Bloqueo Temporal"
            description="Pausa tu tarjeta si no la encuentras. Puedes reactivarla cuando quieras."
            icon={PauseCircle}
            isSelected={selectedType === 'temporary'}
            onSelect={() => setSelectedType('temporary')}
            color={theme.tenant.accentColor} // Warning/Orange usually
          />

          <OptionCard
            type="permanent"
            title="Bloqueo Definitivo"
            description="Reportar como robada o perdida. Se cancelará la tarjeta actual y se emitirá una nueva."
            icon={Lock}
            isSelected={selectedType === 'permanent'}
            onSelect={() => setSelectedType('permanent')}
            color="#F44336" // Error Red
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
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.button, 
            { backgroundColor: theme.tenant.mainColor, opacity: selectedType ? 1 : 0.5 }
          ]}
          disabled={!selectedType}
          onPress={handleBlock}
        >
          <ThemedText style={{ color: theme.colors.textInverse, fontWeight: 'bold', fontSize: 16 }}>
            {selectedType === 'permanent' ? 'Bloquear Definitivamente' : 'Pausar Tarjeta'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <BiometricGuard
        isVisible={showBiometrics}
        onSuccess={onBiometricSuccess}
        onCancel={() => setShowBiometrics(false)}
        reason={selectedType === 'permanent' ? 'Confirma el bloqueo definitivo' : 'Confirma el bloqueo temporal'}
      />
    </ThemedView>
  );
}

function OptionCard({ type, title, description, icon: Icon, isSelected, onSelect, color }: any) {
  const theme = useAppTheme();
  
  return (
    <Pressable onPress={onSelect}>
      <ThemedView 
        style={[
          styles.optionCard, 
          isSelected && { borderColor: color, borderWidth: 2 }
        ]} 
        surface={isSelected ? "level2" : "level1"}
      >
        <View style={[styles.iconContainer, { backgroundColor: isSelected ? color : theme.colors.surfaceHigher }]}>
          <Icon size={32} color={isSelected ? '#FFF' : theme.colors.textSecondary} />
        </View>
        <View style={styles.textContainer}>
          <ThemedText type="subtitle" style={{ color: isSelected ? color : theme.colors.text }}>{title}</ThemedText>
          <ThemedText style={{ color: theme.colors.textSecondary, fontSize: 14 }}>{description}</ThemedText>
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 24,
  },
  description: {
    textAlign: 'center',
    marginBottom: 10,
  },
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    gap: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 4,
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
