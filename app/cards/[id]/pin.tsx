import { CreditCard } from '@/components/cards/credit-card';
import { BiometricGuard } from '@/components/cards/operations/biometric-guard';
import { CardOperationHeader } from '@/components/cards/operations/card-operation-header';
import { OperationResultScreen } from '@/components/cards/operations/operation-result-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { PoweredBy } from '@/components/ui/powered-by';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useCardOperation, useCardMutations } from '@/hooks/cards';
import { KeyRound, ShieldCheck } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { InputAccessoryView, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, SlideOutLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PinScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  
  // Hooks especializados
  const { card, cardId, isLoadingCard, isProcessing, result, router, executeOperation } = useCardOperation();
  const { changePin } = useCardMutations();
  
  // Estado del formulario
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const confirmPinRef = useRef<TextInput>(null);
  const [showBiometrics, setShowBiometrics] = useState(false);

  const handleSave = () => {
    if (pin.length !== 4 || confirmPin.length !== 4) return;
    if (pin !== confirmPin) return;
    setShowBiometrics(true);
  };

  const onBiometricSuccess = () => {
    setShowBiometrics(false);
    executeOperation(
      () => changePin({ cardId, newPin: pin, currentPin: '' }),
      'PIN Actualizado',
      { 
        receiptPrefix: 'PIN',
        successMessage: 'Tu clave de cajero ha sido modificada exitosamente. Ya puedes usarla en cajeros automáticos.',
      }
    );
  };

  if (isLoadingCard) {
    return <LoadingScreen message="Cargando cambio de PIN..." />;
  }

  if (isProcessing) {
    return <LoadingScreen message="Actualizando PIN..." />;
  }

  if (result) {
    return (
      <OperationResultScreen 
        result={result} 
        onClose={() => router.back()}
        card={card}
        transactionDetails={[
          { label: 'Acción', value: 'Cambio de PIN' },
          { label: 'Canal', value: 'App Móvil' },
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

  const isValid = pin.length === 4 && confirmPin.length === 4 && pin === confirmPin;

  return (
    <ThemedView style={styles.container} surface="level1">
      <Animated.View exiting={SlideOutLeft} style={{ flex: 1 }}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <CardOperationHeader title="Cambio de PIN" card={card} isModal />
          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
          {card && <CreditCard card={card} width={300} />}
        </View>

        <Animated.View entering={FadeInDown.delay(200)} style={styles.form}>
          <ThemedText style={styles.instruction}>
            Ingresa tu nueva clave de 4 dígitos para cajeros automáticos.
          </ThemedText>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Nuevo PIN</ThemedText>
            <View style={[styles.inputContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
              <KeyRound size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                value={pin}
                onChangeText={(text) => {
                  setPin(text);
                  if (text.length === 4) confirmPinRef.current?.focus();
                }}
                keyboardType="number-pad"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => confirmPinRef.current?.focus()}
                maxLength={4}
                secureTextEntry
                placeholder="••••"
                placeholderTextColor={theme.colors.textDisabled}
                inputAccessoryViewID="uniqueID"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Confirmar PIN</ThemedText>
            <View style={[styles.inputContainer, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
              <ShieldCheck size={20} color={theme.colors.textSecondary} />
              <TextInput
                ref={confirmPinRef}
                style={[styles.input, { color: theme.colors.text }]}
                value={confirmPin}
                onChangeText={setConfirmPin}
                keyboardType="number-pad"
                returnKeyType="done"
                maxLength={4}
                secureTextEntry
                placeholder="••••"
                placeholderTextColor={theme.colors.textDisabled}
                inputAccessoryViewID="uniqueID"
              />
            </View>
            {pin.length === 4 && confirmPin.length === 4 && pin !== confirmPin && (
              <ThemedText style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
                Los PINs no coinciden
              </ThemedText>
            )}
          </View>
        </Animated.View>
        <PoweredBy style={{ marginTop: 40 }} />
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: insets.bottom + 20, backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: theme.tenant.mainColor, opacity: isValid ? 1 : 0.5 }
          ]}
          onPress={handleSave}
          disabled={!isValid}
        >
          <ThemedText style={styles.buttonText}>Actualizar PIN</ThemedText>
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
      </Animated.View>

      <BiometricGuard
        isVisible={showBiometrics}
        onSuccess={onBiometricSuccess}
        onCancel={() => setShowBiometrics(false)}
        reason="Confirma el cambio de PIN"
      />
      {Platform.OS === 'ios' && <InputAccessoryView nativeID="uniqueID" />}
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
  content: {
    padding: 24,
    gap: 32,
    paddingBottom: 20,
    flexGrow: 1,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(150,150,150,0.1)',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    gap: 24,
  },
  instruction: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 8,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 8,
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
