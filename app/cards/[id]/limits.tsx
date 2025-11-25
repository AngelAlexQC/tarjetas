import { CreditCard } from '@/components/cards/credit-card';
import { BiometricGuard } from '@/components/cards/operations/biometric-guard';
import { CardOperationHeader } from '@/components/cards/operations/card-operation-header';
import { OperationResultScreen } from '@/components/cards/operations/operation-result-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { PoweredBy } from '@/components/ui/powered-by';
import { OperationResult } from '@/features/cards/types/card-operations';
import { AppTheme, useAppTheme } from '@/hooks/use-app-theme';
import { useCards } from '@/hooks/use-cards';
import type { Card } from '@/repositories';
import Slider from '@react-native-community/slider';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, SlideOutLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LimitsScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCardById } = useCards();
  const [card, setCard] = useState<Card | undefined>();
  const [isLoadingCard, setIsLoadingCard] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (id) {
      getCardById(id).then((fetchedCard) => {
        setCard(fetchedCard);
        setIsLoadingCard(false);
      });
    }
  }, [id, getCardById]);

  // Mock initial limits
  const [limits, setLimits] = useState({
    dailyAtm: 500,
    dailyPos: 2000,
    dailyOnline: 1000,
    monthlyTotal: 5000,
  });

  const [showBiometrics, setShowBiometrics] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<OperationResult | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = () => {
    setShowBiometrics(true);
  };

  const onBiometricSuccess = () => {
    setShowBiometrics(false);
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setResult({
        success: true,
        title: 'Cupos Actualizados',
        message: 'Los límites de tu tarjeta han sido actualizados correctamente.',
        receiptId: `LIM-${Math.floor(Math.random() * 10000)}`,
      });
    }, 2000);
  };

  const updateLimit = (key: keyof typeof limits, value: number) => {
    setLimits(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  if (isLoadingCard) {
    return <LoadingScreen message="Cargando tarjeta..." />;
  }

  if (isProcessing) {
    return <LoadingScreen message="Actualizando cupos..." />;
  }

  if (result) {
    return (
      <OperationResultScreen 
        result={result} 
        onClose={() => router.back()}
        card={card}
        transactionDetails={[
          { label: 'Acción', value: 'Actualización Cupos' },
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
    <ThemedView style={styles.container} surface="level1">
      <Animated.View exiting={SlideOutLeft} style={{ flex: 1 }}>
        <CardOperationHeader title="Configurar Cupos" card={card} isModal />
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          {card && <CreditCard card={card} width={300} />}
        </View>
        <ThemedText style={styles.description}>
          Ajusta los límites diarios y mensuales de tu tarjeta.
        </ThemedText>

        <View style={styles.slidersContainer}>
          <LimitSlider
            label="Retiros en Cajero (Diario)"
            value={limits.dailyAtm}
            max={1000}
            onChange={(v) => updateLimit('dailyAtm', v)}
            currency={theme.tenant.currencySymbol}
            theme={theme}
          />

          <LimitSlider
            label="Compras en Locales (Diario)"
            value={limits.dailyPos}
            max={5000}
            onChange={(v) => updateLimit('dailyPos', v)}
            currency={theme.tenant.currencySymbol}
            theme={theme}
          />

          <LimitSlider
            label="Compras en Línea (Diario)"
            value={limits.dailyOnline}
            max={3000}
            onChange={(v) => updateLimit('dailyOnline', v)}
            currency={theme.tenant.currencySymbol}
            theme={theme}
          />

          <View style={styles.divider} />

          <LimitSlider
            label="Límite Mensual Total"
            value={limits.monthlyTotal}
            max={10000}
            onChange={(v) => updateLimit('monthlyTotal', v)}
            currency={theme.tenant.currencySymbol}
            theme={theme}
            isTotal
          />
        </View>
        <PoweredBy style={{ marginTop: 40 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20, backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: theme.tenant.mainColor, opacity: hasChanges ? 1 : 0.5 }
          ]}
          disabled={!hasChanges}
          onPress={handleSave}
        >
          <ThemedText style={{ color: theme.colors.textInverse, fontWeight: 'bold', fontSize: 16 }}>
            Guardar Cambios
          </ThemedText>
        </TouchableOpacity>
      </View>
      </Animated.View>

      <BiometricGuard
        isVisible={showBiometrics}
        onSuccess={onBiometricSuccess}
        onCancel={() => setShowBiometrics(false)}
        reason="Confirma para actualizar tus cupos"
      />
    </ThemedView>
  );
}

interface LimitSliderProps {
  label: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
  currency: string;
  theme: AppTheme;
  isTotal?: boolean;
}

function LimitSlider({ label, value, max, onChange, currency, theme, isTotal }: LimitSliderProps) {
  const trackColor = theme.tenant.secondaryColor;

  return (
    <Animated.View entering={FadeInDown} style={styles.sliderWrapper}>
      <View style={styles.labelRow}>
        <ThemedText type={isTotal ? "defaultSemiBold" : "default"}>{label}</ThemedText>
        <ThemedText type="defaultSemiBold" style={{ color: theme.colors.text }}>
          {currency}{value.toLocaleString()}
        </ThemedText>
      </View>
      
      <Slider
        style={{ width: '100%', height: 40 }}
        minimumValue={0}
        maximumValue={max}
        step={50}
        value={value}
        onSlidingComplete={onChange}
        minimumTrackTintColor={trackColor}
        maximumTrackTintColor={theme.colors.border}
        thumbTintColor={trackColor}
      />
      
      <View style={styles.limitRow}>
        <ThemedText style={styles.limitLabel}>0</ThemedText>
        <ThemedText style={styles.limitLabel}>Max: {currency}{max.toLocaleString()}</ThemedText>
      </View>
    </Animated.View>
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
    opacity: 0.8,
  },
  slidersContainer: {
    gap: 24,
  },
  sliderWrapper: {
    gap: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  limitLabel: {
    fontSize: 12,
    opacity: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(150,150,150,0.2)',
    marginVertical: 8,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
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
