import { ThemedText } from "@/components/themed-text";
import { CardBackgroundPattern } from "@/components/ui/card-background-patterns";
import { CardBrandIcons } from "@/components/ui/card-brand-icons";
import { ChipIcon } from "@/components/ui/chip-icon";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { CARD_TYPE_LABELS, getCardDesign } from "@/constants/card-types";
import { Card } from "@/features/cards/services/card-service";
import { formatCardExpiry } from "@/utils/formatters/date";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

interface CreditCardProps {
  card: Card;
  width?: number;
  height?: number;
  style?: ViewStyle;
  showChip?: boolean;
  onPress?: () => void;
  isActive?: boolean;
}

export function CreditCard({ 
  card, 
  width = 340, 
  height, 
  style,
  showChip = true,
  onPress,
  isActive = true
}: CreditCardProps) {
  const cardHeight = height || width * 0.63;
  const cardDesign = getCardDesign(card.cardBrand, card.cardType);
  const baseOrder = card.cardType === 'credit' ? 100 : card.cardType === 'debit' ? 200 : 300;

  // Helper para generar keys del tour solo si la tarjeta está activa
  const getTourKey = (suffix: string) => isActive ? `tour-${card.cardType}-${suffix}` : undefined;

  // Textos explicativos según tipo de tarjeta
  const getTypeDescription = () => {
    if (card.cardType === 'credit') return "Línea de crédito rotativa. Úsala para financiar tus compras y paga después.";
    if (card.cardType === 'debit') return "Vinculada a tus fondos. El dinero se debita inmediatamente de tu cuenta de ahorros.";
    return "Tarjeta virtual para compras seguras en internet. Recárgala desde tu cuenta principal.";
  };

  return (
    <InfoTooltip
      content={`Esta es tu tarjeta ${CARD_TYPE_LABELS[card.cardType]} digital. Úsala para gestionar tus pagos y controlar tus movimientos desde la app.`}
      title={`Tarjeta ${CARD_TYPE_LABELS[card.cardType]}`}
      triggerMode="longPress"
      tourKey={getTourKey('general')}
      tourOrder={baseOrder}
      placement="bottom"
      onPress={onPress}
      targetBorderRadius={16}
    >
      <View style={[styles.container, { width, height: cardHeight }, style]}>
        <LinearGradient
          colors={cardDesign.gradientColors as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Patrón de fondo */}
          <CardBackgroundPattern 
            brand={card.cardBrand} 
            width={width} 
            height={cardHeight} 
          />
          
          <View style={styles.cardContent}>
            {/* Header con tipo de tarjeta y logo */}
            <View style={styles.cardHeader}>
              <InfoTooltip
                content={getTypeDescription()}
                title="Tipo de Producto"
                triggerMode="longPress"
                tourKey={getTourKey('type')}
                tourOrder={baseOrder + 1}
                targetBorderRadius={8}
              >
                <View style={styles.cardTypeBadge}>
                  <ThemedText
                    style={[styles.cardTypeText, { color: cardDesign.textColor }]}
                  >
                    {CARD_TYPE_LABELS[card.cardType]}
                  </ThemedText>
                </View>
              </InfoTooltip>
              
              <InfoTooltip
                content={`Red de procesamiento global. Tu tarjeta es aceptada en millones de comercios físicos y digitales alrededor del mundo.`}
                title="Red de Pagos"
                triggerMode="longPress"
                tourKey={getTourKey('brand')}
                tourOrder={baseOrder + 2}
              >
                <View style={styles.cardBrandLogoContainer}>
                  {CardBrandIcons[card.cardBrand] && 
                    CardBrandIcons[card.cardBrand]({ width: 60, height: 38 })
                  }
                </View>
              </InfoTooltip>
            </View>

            {/* Sección media con chip */}
            <View style={styles.cardMiddle}>
              {showChip && card.cardType !== 'virtual' && (
                <InfoTooltip
                  content="Tecnología de seguridad EMV. Encripta la información de tu tarjeta al usarla en terminales físicos para prevenir la clonación."
                  title="Chip de Seguridad"
                  triggerMode="longPress"
                  tourKey={getTourKey('chip')}
                  tourOrder={baseOrder + 3}
                >
                  <View style={styles.cardChipContainer}>
                    <ChipIcon width={50} height={40} />
                  </View>
                </InfoTooltip>
              )}
            </View>

            {/* Sección inferior: Solo datos de tarjeta */}
            <View style={styles.cardBottomSection}>
              {/* Número de tarjeta */}
              <ThemedText
                style={[styles.cardNumber, { color: cardDesign.textColor }]}
              >
                {card.cardNumber}
              </ThemedText>

              {/* Nombre y fecha */}
              <View style={styles.cardFooter}>
                <ThemedText
                  style={[styles.cardHolder, { color: cardDesign.textColor }]}
                >
                  {card.cardHolder}
                </ThemedText>
                <InfoTooltip
                  content={`Fecha límite de validez. Necesaria para compras en línea. Tu tarjeta se renovará automáticamente antes de este mes.`}
                  title="Vencimiento"
                  triggerMode="longPress"
                  tourKey={getTourKey('expiry')}
                  tourOrder={baseOrder + 4}
                >
                  <ThemedText
                    style={[styles.cardExpiry, { color: cardDesign.textColor }]}
                  >
                    {formatCardExpiry(card.expiryDate)}
                  </ThemedText>
                </InfoTooltip>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>
    </InfoTooltip>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    overflow: "hidden",
  },
  cardContent: {
    flex: 1,
    justifyContent: "space-between",
    zIndex: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  cardTypeText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardBrandLogoContainer: {
    height: 38,
    justifyContent: 'center',
  },
  cardMiddle: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  cardChipContainer: {
    opacity: 0.9,
  },
  cardBottomSection: {
    gap: 16,
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 2,
    textAlign: 'right',
    fontFamily: 'monospace', // Ensure monospaced for alignment if possible, or just rely on font
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardHolder: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardExpiry: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
