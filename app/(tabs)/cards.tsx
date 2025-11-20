import { CardActionsGrid } from "@/components/cards/card-actions-grid";
import { CardFinancialInfo } from "@/components/cards/card-financial-info";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AddToWalletButton } from "@/components/ui/add-to-wallet-button";
import { CardBackgroundPattern } from "@/components/ui/card-background-patterns";
import { CardBrandIcons } from "@/components/ui/card-brand-icons";
import { ChipIcon } from "@/components/ui/chip-icon";
import { CARD_TYPE_LABELS, getCardDesign } from "@/constants/card-types";
import { useCardActions } from "@/features/cards/hooks/use-card-actions";
import type { Card } from "@/features/cards/services/card-service";
import { useAppTheme } from "@/hooks/use-app-theme";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useRef, useState } from "react";
import {
    Alert,
    Dimensions,
    FlatList,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
    ViewToken
} from "react-native";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_HEIGHT = 200;
const CARD_SPACING = 20;

// Datos de ejemplo - Una tarjeta de cada marca con tipo diferente
const mockCards: Card[] = [
  // VISA - Crédito (todas las acciones)
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
  // Mastercard - Débito (sin diferir ni avances)
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
  // American Express - Virtual (sin PIN)
  {
    id: "3",
    cardNumber: "3782 822463 10005",
    cardHolder: "Ana Martínez",
    expiryDate: "06/25",
    balance: 980.25,
    cardType: "virtual",
    cardBrand: "amex",
    status: "active",
    creditLimit: 3000,
    availableCredit: 2019.75,
  },
  // Discover - Crédito (todas las acciones)
  {
    id: "4",
    cardNumber: "6011 1111 1111 1117",
    cardHolder: "Pedro Sánchez",
    expiryDate: "09/26",
    balance: 3200.0,
    cardType: "credit",
    cardBrand: "discover",
    status: "active",
    creditLimit: 7500,
    availableCredit: 4300,
  },
  // Diners Club - Débito (sin diferir ni avances)
  {
    id: "5",
    cardNumber: "3056 9309 0259 04",
    cardHolder: "Fernando Díaz",
    expiryDate: "04/26",
    balance: 4200.0,
    cardType: "debit",
    cardBrand: "diners",
    status: "active",
  },
  // JCB - Virtual (sin PIN)
  {
    id: "6",
    cardNumber: "3530 1113 3330 0000",
    cardHolder: "Yuki Tanaka",
    expiryDate: "11/27",
    balance: 1560.0,
    cardType: "virtual",
    cardBrand: "jcb",
    status: "active",
    creditLimit: 4000,
    availableCredit: 2440,
  },
  // Maestro - Crédito (todas las acciones)
  {
    id: "7",
    cardNumber: "6304 0000 0000 0000",
    cardHolder: "Laura Fernández",
    expiryDate: "04/26",
    balance: 890.25,
    cardType: "credit",
    cardBrand: "maestro",
    status: "active",
    creditLimit: 2500,
    availableCredit: 1609.75,
  },
  // UnionPay - Débito (sin diferir ni avances)
  {
    id: "8",
    cardNumber: "6200 0000 0000 0005",
    cardHolder: "Wei Chen",
    expiryDate: "07/28",
    balance: 4750.5,
    cardType: "debit",
    cardBrand: "unionpay",
    status: "active",
  },
];

export default function CardsScreen() {
  const theme = useAppTheme();
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  
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
          {/* Patrón de fondo */}
          <CardBackgroundPattern 
            brand={item.cardBrand} 
            width={CARD_WIDTH} 
            height={CARD_HEIGHT} 
          />
          
          <View style={styles.cardBlur}>
            {/* Chip EMV - Posicionado según estándar ISO */}
            {item.cardType !== 'virtual' && (
              <View style={styles.cardChip}>
                <ChipIcon width={50} height={40} />
              </View>
            )}

            {/* Header con tipo de tarjeta y logo */}
            <View style={styles.cardHeader}>
              <View style={styles.cardTypeBadge}>
                <ThemedText
                  style={[styles.cardTypeText, { color: cardDesign.textColor }]}
                >
                  {CARD_TYPE_LABELS[item.cardType]}
                </ThemedText>
              </View>
              <View style={styles.cardBrandLogoContainer}>
                {CardBrandIcons[item.cardBrand] && 
                  CardBrandIcons[item.cardBrand]({ width: 60, height: 38 })
                }
              </View>
            </View>

            {/* Espaciador flexible */}
            <View style={{ flex: 1 }} />

            {/* Número de tarjeta */}
            <View style={styles.cardNumberContainer}>
              <ThemedText
                style={[styles.cardNumber, { color: cardDesign.textColor }]}
              >
                {item.cardNumber}
              </ThemedText>
            </View>

            {/* Footer compacto con titular y fecha */}
            <View style={styles.cardFooter}>
              <ThemedText
                style={[styles.cardHolder, { color: cardDesign.textColor }]}
              >
                {item.cardHolder}
              </ThemedText>
              <ThemedText
                style={[styles.cardExpiry, { color: cardDesign.textColor }]}
              >
                {item.expiryDate}
              </ThemedText>
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.logoContainer, { backgroundColor: theme.tenant.mainColor + '20' }]}>
            <ThemedText style={[styles.logoText, { color: theme.tenant.mainColor }]}>
              {theme.tenant.name.substring(0, 2).toUpperCase()}
            </ThemedText>
          </View>
          <ThemedText type="title" style={styles.title}>
            {theme.tenant.name}
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

        {/* Panel de información financiera */}
        {activeCard && (
          <CardFinancialInfo
            card={activeCard}
            locale="en-US"
            currency="USD"
          />
        )}

        {/* Carousel de acciones de tarjeta */}
        {activeCard && (
          <Animated.View 
            style={styles.actionsSection}
            entering={FadeIn.duration(600).springify()}
            exiting={FadeOut.duration(400)}
            layout={LinearTransition.springify().damping(25).stiffness(90)}
          >
            <View style={styles.actionsSectionHeader}>
              <ThemedText type="subtitle" style={styles.actionsSectionTitle}>
                Acciones Rápidas
              </ThemedText>
              <View style={[styles.activeIndicator, { backgroundColor: theme.tenant.mainColor }]} />
            </View>
            <CardActionsGrid
              cardType={activeCard.cardType}
              isLoading={cardActions.isLoading}
              onActionPress={(actionType) => {
                cardActions.executeAction(actionType);
              }}
            />
          </Animated.View>
        )}

        {/* Botón agregar a Apple Wallet */}
        <Animated.View 
          style={styles.addCardContainer}
          layout={LinearTransition.springify().damping(25).stiffness(90)}
        >
          <AddToWalletButton
            onPress={() => Alert.alert("Agregar a Apple Wallet", "Esta tarjeta se agregará a tu Apple Wallet")}
          />
        </Animated.View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 18,
    fontWeight: "700",
  },
  title: {
    fontSize: 20,
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
    padding: 18,
    justifyContent: "flex-start",
    position: "relative",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
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
  cardBrandLogoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardChip: {
    position: "absolute",
    top: 60,
    left: 24,
    width: 50,
    height: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  cardNumberContainer: {
    marginBottom: 8,
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 2,
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
  actionsSection: {
    marginTop: 16,
    marginBottom: 16,
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
    paddingBottom: 20,
    marginTop: 8,
  },
});
