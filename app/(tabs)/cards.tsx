import { CardActionsGrid } from "@/components/cards/card-actions-grid";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { CARD_TYPE_LABELS, getCardDesign } from "@/constants/card-types";
import { useTenantTheme } from "@/contexts/tenant-theme-context";
import { useCardActions } from "@/features/cards/hooks/use-card-actions";
import type { Card } from "@/features/cards/services/card-service";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useRef, useState } from "react";
import {
    Alert,
    Dimensions,
    FlatList,
    Pressable,
    StyleSheet,
    View,
    ViewToken,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_HEIGHT = 200;
const CARD_SPACING = 20;

// Datos de ejemplo para las tarjetas
const mockCards: Card[] = [
  {
    id: "1",
    cardNumber: "4532 1234 5678 9010",
    cardHolder: "Juan Pérez",
    expiryDate: "12/25",
    balance: 2500.0,
    cardType: "credit",
    cardBrand: "visa",
    status: "active",
    creditLimit: 5000,
    availableCredit: 2500,
  },
  {
    id: "2",
    cardNumber: "5234 5678 9012 3456",
    cardHolder: "María García",
    expiryDate: "08/26",
    balance: 1850.5,
    cardType: "debit",
    cardBrand: "mastercard",
    status: "active",
  },
  {
    id: "3",
    cardNumber: "4111 1111 1111 1111",
    cardHolder: "Carlos Rodríguez",
    expiryDate: "03/27",
    balance: 5320.75,
    cardType: "virtual",
    cardBrand: "visa",
    status: "active",
    creditLimit: 10000,
    availableCredit: 4679.25,
  },
  {
    id: "4",
    cardNumber: "3782 822463 10005",
    cardHolder: "Ana Martínez",
    expiryDate: "06/25",
    balance: 980.25,
    cardType: "credit",
    cardBrand: "amex",
    status: "active",
    creditLimit: 3000,
    availableCredit: 2019.75,
  },
];

export default function CardsScreen() {
  const colorScheme = useColorScheme();
  const { currentTheme } = useTenantTheme();
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  
  // Colores del tema actual
  const themeColors = {
    primary: currentTheme?.mainColor || '#1A73E8',
    secondary: currentTheme?.secondaryColor || '#0D47A1',
    border: colorScheme === 'dark' ? '#444' : '#DDD',
  };
  
  // Hook de acciones de tarjetas (solo si hay tarjeta activa)
  const activeCard = mockCards[activeCardIndex];
  const cardActions = useCardActions(activeCard?.id || '');

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setActiveCardIndex(viewableItems[0].index ?? 0);
      }
    },
    []
  );

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const handleCardPress = (card: Card) => {
    Alert.alert(
      "Detalles de Tarjeta",
      `Tarjeta: ${card.cardNumber}\nTitular: ${card.cardHolder}\nBalance: $${card.balance.toFixed(2)}`,
      [{ text: "OK" }]
    );
  };

  const renderCard = ({ item, index }: { item: Card; index: number }) => {
    const isActive = index === activeCardIndex;
    const cardDesign = getCardDesign(item.cardBrand, item.cardType);

    return (
      <Pressable
        style={[
          styles.cardContainer,
          {
            width: CARD_WIDTH,
            marginLeft: index === 0 ? (SCREEN_WIDTH - CARD_WIDTH) / 2 : 0,
            marginRight:
              index === mockCards.length - 1
                ? (SCREEN_WIDTH - CARD_WIDTH) / 2
                : CARD_SPACING,
          },
        ]}
        onPress={() => handleCardPress(item)}
      >
        <LinearGradient
          colors={cardDesign.gradientColors as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.card, { opacity: isActive ? 1 : 0.6 }]}
        >
          <View style={styles.cardBlur}>
            {/* Header con tipo de tarjeta y logo */}
            <View style={styles.cardHeader}>
              <View style={styles.cardTypeBadge}>
                <ThemedText
                  style={[styles.cardTypeText, { color: cardDesign.textColor }]}
                >
                  {CARD_TYPE_LABELS[item.cardType]}
                </ThemedText>
              </View>
              <View style={styles.cardChip} />
            </View>

            {/* Número de tarjeta */}
            <View style={styles.cardNumberContainer}>
              <ThemedText
                style={[styles.cardNumber, { color: cardDesign.textColor }]}
              >
                {item.cardNumber}
              </ThemedText>
            </View>

            {/* Footer con info del titular y fecha */}
            <View style={styles.cardFooter}>
              <View style={styles.cardHolderContainer}>
                <ThemedText
                  style={[styles.cardLabel, { color: cardDesign.textColor }]}
                >
                  TITULAR
                </ThemedText>
                <ThemedText
                  style={[styles.cardHolder, { color: cardDesign.textColor }]}
                >
                  {item.cardHolder}
                </ThemedText>
              </View>
              <View style={styles.cardExpiryContainer}>
                <ThemedText
                  style={[styles.cardLabel, { color: cardDesign.textColor }]}
                >
                  VÁLIDA HASTA
                </ThemedText>
                <ThemedText
                  style={[styles.cardExpiry, { color: cardDesign.textColor }]}
                >
                  {item.expiryDate}
                </ThemedText>
              </View>
            </View>

            {/* Balance */}
            <View style={styles.balanceContainer}>
              <ThemedText
                style={[styles.balanceLabel, { color: cardDesign.textColor }]}
              >
                Saldo Disponible
              </ThemedText>
              <ThemedText
                style={[styles.balanceAmount, { color: cardDesign.textColor }]}
              >
                ${item.balance.toFixed(2)}
              </ThemedText>
            </View>

            {/* Decoración */}
            <View
              style={[
                styles.cardDecoration,
                { backgroundColor: `${cardDesign.textColor}20` },
              ]}
            />
          </View>
        </LinearGradient>
      </Pressable>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Mis Tarjetas
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {currentTheme?.name || "Institución Financiera"}
        </ThemedText>
      </View>

      {/* Carrusel de tarjetas */}
      <View style={styles.carouselContainer}>
        {mockCards.length > 0 ? (
          <FlatList
            ref={flatListRef}
            data={mockCards}
            renderItem={renderCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + CARD_SPACING}
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContent}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
          />
        ) : (
          <ThemedText style={{ textAlign: 'center', padding: 20 }}>
            No hay tarjetas disponibles
          </ThemedText>
        )}
      </View>

      {/* Indicadores de paginación */}
      <View style={styles.pagination}>
        {mockCards.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              {
                backgroundColor:
                  index === activeCardIndex ? themeColors.primary : themeColors.border,
                width: index === activeCardIndex ? 24 : 8,
              },
            ]}
          />
        ))}
      </View>

      {/* Carousel de acciones de tarjeta */}
      {activeCard && (
        <View style={styles.actionsSection}>
          <View style={styles.actionsSectionHeader}>
            <ThemedText type="subtitle" style={styles.actionsSectionTitle}>
              Acciones Rápidas
            </ThemedText>
            <View style={[styles.activeIndicator, { backgroundColor: themeColors.primary }]} />
          </View>
          <CardActionsGrid
            cardId={activeCard.id}
            isLoading={cardActions.isLoading}
            onActionPress={(actionType) => {
              cardActions.executeAction(actionType);
            }}
          />
        </View>
      )}

      {/* Botón agregar tarjeta */}
      <View style={styles.addCardContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.addCardButton,
            {
              backgroundColor: pressed ? themeColors.primary : 'transparent',
              borderColor: themeColors.primary,
              opacity: pressed ? 0.8 : 1,
            }
          ]}
          onPress={() => Alert.alert("Agregar Tarjeta", "Funcionalidad próximamente")}
        >
          {({ pressed }) => (
            <>
              <ThemedText style={[styles.addCardIcon, { color: pressed ? '#FFFFFF' : themeColors.primary }]}>
                +
              </ThemedText>
              <ThemedText style={[styles.addCardText, { color: pressed ? '#FFFFFF' : themeColors.primary }]}>
                Agregar Tarjeta
              </ThemedText>
            </>
          )}
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  carouselContainer: {
    height: CARD_HEIGHT + 40,
    marginBottom: 10,
  },
  carouselContent: {
    paddingVertical: 20,
    alignItems: "center",
  },
  cardContainer: {
    height: CARD_HEIGHT,
    justifyContent: "center",
  },
  card: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardBlur: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTypeBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  cardTypeText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardChip: {
    width: 40,
    height: 32,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 6,
  },
  cardNumberContainer: {
    marginTop: 15,
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 2,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  cardHolderContainer: {
    flex: 1,
  },
  cardExpiryContainer: {
    alignItems: "flex-end",
  },
  cardLabel: {
    fontSize: 8,
    opacity: 0.7,
    marginBottom: 3,
    letterSpacing: 1,
  },
  cardHolder: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  cardExpiry: {
    fontSize: 12,
    fontWeight: "600",
  },
  balanceContainer: {
    marginTop: 12,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: 12,
    borderRadius: 12,
  },
  balanceLabel: {
    fontSize: 10,
    opacity: 0.8,
    marginBottom: 3,
  },
  balanceAmount: {
    fontSize: 22,
    fontWeight: "700",
  },
  cardDecoration: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    right: -40,
    bottom: -40,
    opacity: 0.2,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginVertical: 20,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
  },
  actionsSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  actionsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  actionsSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  addCardContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  addCardButton: {
    flexDirection: 'row',
    padding: 18,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addCardIcon: {
    fontSize: 24,
    fontWeight: "700",
  },
  addCardText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
