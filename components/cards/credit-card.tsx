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
}

export function CreditCard({ 
  card, 
  width = 340, 
  height, 
  style,
  showChip = true 
}: CreditCardProps) {
  const cardHeight = height || width * 0.63;
  const cardDesign = getCardDesign(card.cardBrand, card.cardType);
  const baseOrder = card.cardType === 'credit' ? 100 : card.cardType === 'debit' ? 200 : 300;

  return (
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
              content={`Esta es tu tarjeta ${CARD_TYPE_LABELS[card.cardType]}. Disfruta de sus beneficios exclusivos.`}
              title="Tipo de Tarjeta"
              triggerMode="longPress"
              tourKey={`tour-${card.cardType}-type`}
              tourOrder={baseOrder + 1}
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
              content={`Tarjeta respaldada por ${card.cardBrand.toUpperCase()}. Aceptada en millones de establecimientos.`}
              title="Marca"
              triggerMode="longPress"
              tourKey={`tour-${card.cardType}-brand`}
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
                content="El chip EMV protege tus transacciones contra fraudes y clonación."
                title="Chip de Seguridad"
                triggerMode="longPress"
                tourKey={`tour-${card.cardType}-chip`}
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
                content={`Tu tarjeta vence el ${formatCardExpiry(card.expiryDate)}. Te enviaremos una nueva antes de esa fecha.`}
                title="Vencimiento"
                triggerMode="longPress"
                tourKey={`tour-${card.cardType}-expiry`}
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
