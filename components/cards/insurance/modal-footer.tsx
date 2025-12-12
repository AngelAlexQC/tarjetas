import { ThemedText } from '@/components/themed-text';
import { CardBrandIcons } from '@/components/ui/card-brand-icons';
import { ThemedButton } from '@/components/ui/themed-button';
import React from 'react';
import { View } from 'react-native';
import type { Card } from '@/repositories';
import type { Insurance } from './insurance-generator';

interface ModalFooterProps {
  insurance: Insurance;
  activeCard?: Card;
  formatAmount: (amount: number) => string;
  onContract?: (insurance: Insurance) => void;
  onClose: () => void;
  styles: any;
}

export const ModalFooter = ({
  insurance,
  activeCard,
  formatAmount,
  onContract,
  onClose,
  styles,
}: ModalFooterProps) => (
  <View style={styles.footer}>
    {/* Tarjeta de pago */}
    {activeCard && (
      <View style={styles.paymentCardSection}>
        <ThemedText style={styles.paymentCardHeader}>
          Se descontará de
        </ThemedText>
        <View style={styles.paymentCardContent}>
          <View style={styles.cardIconContainer}>
            {CardBrandIcons[activeCard.cardBrand] && 
              CardBrandIcons[activeCard.cardBrand]({ width: 40, height: 26 })
            }
          </View>
          <View style={styles.cardInfo}>
            <ThemedText style={styles.cardNumber}>
              {activeCard.cardNumber}
            </ThemedText>
            <ThemedText style={styles.cardType}>
              Tarjeta {activeCard.cardType === 'credit' ? 'de crédito' : activeCard.cardType === 'debit' ? 'de débito' : 'virtual'}
            </ThemedText>
          </View>
        </View>
      </View>
    )}

    <View style={styles.priceRow}>
      <ThemedText style={styles.priceLabel}>Desde</ThemedText>
      <ThemedText style={styles.priceValue}>
        {formatAmount(insurance.monthlyPrice)}/mes
      </ThemedText>
    </View>

    <ThemedButton
      title="Contratar ahora"
      onPress={() => {
        onContract?.(insurance);
        onClose();
      }}
    />

    <ThemedText style={styles.disclaimer}>
      Al contratar aceptas los términos y condiciones del seguro.
      Consulta la póliza completa para más detalles.
    </ThemedText>
  </View>
);
