import { CardActionsGrid } from "@/components/cards/card-actions-grid";
import { CardFinancialInfo } from "@/components/cards/card-financial-info";
import { InstitutionSelectorHeader } from "@/components/institution-selector-header";
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
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { formatCardExpiry } from "@/utils/formatters/date";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useMemo, useRef, useState } from "react";
import {
    Alert,
    FlatList,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
    ViewToken
} from "react-native";
import Animated, {
    FadeInDown,
    FadeInLeft,
    FadeInUp,
    FadeOut,
    LinearTransition,
    SlideInLeft,
    SlideInRight,
    ZoomIn,
    ZoomOut
} from "react-native-reanimated";

// Las dimensiones serán calculadas dinámicamente en el componente

// Función para generar valores aleatorios
const generateRandomBalance = () => Math.floor(Math.random() * 5000) + 500;
const generateRandomCreditLimit = () => Math.floor(Math.random() * 8000) + 2000;

// Datos de ejemplo - Una tarjeta de cada marca con tipo diferente
const generateMockCards = (): Card[] => [
  // VISA - Crédito (todas las acciones)
  (() => {
    const creditLimit = generateRandomCreditLimit();
    const availableCredit = Math.floor(Math.random() * creditLimit * 0.8);
    return {
      id: "1",
      cardNumber: "•••• •••• •••• 9010",
      cardHolder: "Juan Pérez",
      expiryDate: "12/27",
      balance: creditLimit - availableCredit,
      cardType: "credit" as const,
      cardBrand: "visa" as const,
      status: "active" as const,
      creditLimit,
      availableCredit,
      lastTransactionDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // hace 2 horas
    };
  })(),
  // Mastercard - Débito (sin diferir ni avances)
  {
    id: "2",
    cardNumber: "•••• •••• •••• 3456",
    cardHolder: "María García",
    expiryDate: "08/28",
    balance: generateRandomBalance(),
    cardType: "debit" as const,
    cardBrand: "mastercard" as const,
    status: "active" as const,
    lastTransactionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // hace 1 día
  },
  // American Express - Virtual (sin PIN)
  (() => {
    const creditLimit = generateRandomCreditLimit();
    const availableCredit = Math.floor(Math.random() * creditLimit * 0.8);
    return {
      id: "3",
      cardNumber: "•••• •••••• •0005",
      cardHolder: "Ana Martínez",
      expiryDate: "06/29",
      balance: creditLimit - availableCredit,
      cardType: "virtual" as const,
      cardBrand: "amex" as const,
      status: "active" as const,
      creditLimit,
      availableCredit,
      lastTransactionDate: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // hace 5 minutos
    };
  })(),
  // Discover - Crédito (todas las acciones)
  (() => {
    const creditLimit = generateRandomCreditLimit();
    const availableCredit = Math.floor(Math.random() * creditLimit * 0.8);
    return {
      id: "4",
      cardNumber: "•••• •••• •••• 1117",
      cardHolder: "Pedro Sánchez",
      expiryDate: "09/28",
      balance: creditLimit - availableCredit,
      cardType: "credit" as const,
      cardBrand: "discover" as const,
      status: "active" as const,
      creditLimit,
      availableCredit,
      lastTransactionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // hace 3 días
    };
  })(),
  // Diners Club - Débito (sin diferir ni avances)
  {
    id: "5",
    cardNumber: "•••• •••• •••• 9504",
    cardHolder: "Fernando Díaz",
    expiryDate: "04/27",
    balance: generateRandomBalance(),
    cardType: "debit" as const,
    cardBrand: "diners" as const,
    status: "active" as const,
    lastTransactionDate: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // hace 45 minutos
  },
  // JCB - Virtual (sin PIN)
  (() => {
    const creditLimit = generateRandomCreditLimit();
    const availableCredit = Math.floor(Math.random() * creditLimit * 0.8);
    return {
      id: "6",
      cardNumber: "•••• •••• •••• 0000",
      cardHolder: "Yuki Tanaka",
      expiryDate: "11/29",
      balance: creditLimit - availableCredit,
      cardType: "virtual" as const,
      cardBrand: "jcb" as const,
      status: "active" as const,
      creditLimit,
      availableCredit,
      lastTransactionDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // hace 6 días
    };
  })(),
  // Maestro - Crédito (todas las acciones)
  (() => {
    const creditLimit = generateRandomCreditLimit();
    const availableCredit = Math.floor(Math.random() * creditLimit * 0.8);
    return {
      id: "7",
      cardNumber: "•••• •••• •••• 0000",
      cardHolder: "Laura Fernández",
      expiryDate: "04/28",
      balance: creditLimit - availableCredit,
      cardType: "credit" as const,
      cardBrand: "maestro" as const,
      status: "active" as const,
      creditLimit,
      availableCredit,
      lastTransactionDate: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // hace 30 minutos
    };
  })(),
  // UnionPay - Débito (sin diferir ni avances)
  {
    id: "8",
    cardNumber: "•••• •••• •••• 0005",
    cardHolder: "Wei Chen",
    expiryDate: "07/29",
    balance: generateRandomBalance(),
    cardType: "debit" as const,
    cardBrand: "unionpay" as const,
    status: "active" as const,
    lastTransactionDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // hace 2 días
  },
];

export default function CardsScreen() {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  
  // Dimensiones consistentes para el carrusel en todas las pantallas
  const SCREEN_WIDTH = layout.screenWidth;
  const SCREEN_HEIGHT = layout.screenHeight;
  
  // Mantener proporción 85% del ancho o máximo 400px
  const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.85, 400);
  const CARD_HEIGHT = 200;
  const CARD_SPACING = 20;
  
  const styles = createStyles(theme, layout, CARD_WIDTH, CARD_HEIGHT);
  
  // Generar tarjetas con valores aleatorios al inicio
  const mockCards = useMemo(() => generateMockCards(), []);
  
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
          
          <View style={styles.cardContent}>
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

            {/* Sección media con chip */}
            <View style={styles.cardMiddle}>
              {item.cardType !== 'virtual' && (
                <View style={styles.cardChipContainer}>
                  <ChipIcon width={50} height={40} />
                </View>
              )}
            </View>

            {/* Sección inferior: Solo datos de tarjeta */}
            <View style={styles.cardBottomSection}>
              {/* Número de tarjeta */}
              <ThemedText
                style={[styles.cardNumber, { color: cardDesign.textColor }]}
              >
                {item.cardNumber}
              </ThemedText>

              {/* Nombre y fecha */}
              <View style={styles.cardFooter}>
                <ThemedText
                  style={[styles.cardHolder, { color: cardDesign.textColor }]}
                >
                  {item.cardHolder}
                </ThemedText>
                <ThemedText
                  style={[styles.cardExpiry, { color: cardDesign.textColor }]}
                >
                  {formatCardExpiry(item.expiryDate)}
                </ThemedText>
              </View>
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
        contentContainerStyle={[
          styles.scrollContent,
          layout.isLandscape && styles.scrollContentLandscape
        ]}
        bounces={layout.isPortrait}
      >
        {/* Header mejorado - Selector de institución */}
        <InstitutionSelectorHeader />

        {/* Carrusel de tarjetas */}
        <View style={[styles.carouselContainer, { height: CARD_HEIGHT + 30 }]}>
        {mockCards.length > 0 ? (
          <FlatList
            ref={flatListRef}
            data={mockCards}
            renderItem={renderCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToOffsets={mockCards.map((_, index) => {
              const padding = (SCREEN_WIDTH - CARD_WIDTH) / 2;
              return index * (CARD_WIDTH + CARD_SPACING) + padding;
            })}
            snapToAlignment="start"
            decelerationRate="fast"
            contentContainerStyle={styles.carouselContent}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            style={styles.carouselList}
            getItemLayout={(data, index) => ({
              length: CARD_WIDTH + CARD_SPACING,
              offset: (CARD_WIDTH + CARD_SPACING) * index,
              index,
            })}
          />
        ) : (
          <ThemedText style={{ textAlign: 'center', padding: 20 }}>
            No hay tarjetas disponibles
          </ThemedText>
        )}
      </View>

        {/* Layout condicional según orientación */}
        <Animated.View 
          style={layout.isLandscape && styles.landscapeWrapper}
          layout={LinearTransition.springify().damping(20).stiffness(100)}
        >
        {layout.isLandscape ? (
          // Layout horizontal: tarjeta info y acciones en columnas
          <Animated.View 
            style={styles.landscapeContainer}
            entering={FadeInLeft.duration(500).springify()}
            layout={LinearTransition.springify().damping(20).stiffness(100)}
          >
            <Animated.View 
              style={styles.landscapeColumn}
              entering={SlideInLeft.duration(600).springify().damping(20)}
              layout={LinearTransition.springify().damping(18).stiffness(90)}
            >
              {activeCard && (
                <CardFinancialInfo 
                  card={activeCard}
                  locale={theme.tenant.locale}
                  currency={theme.tenant.currency}
                  currencySymbol={theme.tenant.currencySymbol}
                />
              )}
              <Animated.View 
                style={styles.addCardContainerLandscape}
                entering={FadeInUp.duration(700).delay(200).springify()}
                layout={LinearTransition.springify().damping(18).stiffness(90)}
              >
                <AddToWalletButton
                  onPress={() => {
                    const walletName = Platform.OS === 'android' ? "Google Wallet" : "Apple Wallet";
                    Alert.alert(`Agregar a ${walletName}`, `Esta tarjeta se agregará a tu ${walletName}`);
                  }}
                />
              </Animated.View>
            </Animated.View>
            <Animated.View 
              style={styles.landscapeColumn}
              entering={SlideInRight.duration(600).springify().damping(20)}
              layout={LinearTransition.springify().damping(18).stiffness(90)}
            >
              {activeCard && (
                <Animated.View 
                  entering={ZoomIn.duration(600).delay(100).springify()}
                  exiting={ZoomOut.duration(400)}
                  layout={LinearTransition.springify().damping(20).stiffness(100)}
                >
                  <CardActionsGrid
                    cardType={activeCard.cardType}
                    isLoading={cardActions.isLoading}
                    onActionPress={(actionType) => {
                      cardActions.executeAction(actionType);
                    }}
                  />
                </Animated.View>
              )}
            </Animated.View>
          </Animated.View>
        ) : (
          // Layout vertical: secuencial
          <>
            {/* Acciones rápidas */}
            {activeCard && (
              <Animated.View 
                style={styles.actionsSection}
                entering={FadeInDown.duration(600).springify().damping(18)}
                exiting={FadeOut.duration(400)}
                layout={LinearTransition.springify().damping(20).stiffness(100)}
              >
                <CardActionsGrid
                  cardType={activeCard.cardType}
                  isLoading={cardActions.isLoading}
                  onActionPress={(actionType) => {
                    cardActions.executeAction(actionType);
                  }}
                />
              </Animated.View>
            )}

            {/* Panel de información financiera */}
            {activeCard && (
              <Animated.View
                style={styles.financialInfoWrapper}
                entering={FadeInUp.duration(600).delay(100).springify()}
                layout={LinearTransition.springify().damping(20).stiffness(100)}
              >
              <CardFinancialInfo 
                card={activeCard}
                locale={theme.tenant.locale}
                currency={theme.tenant.currency}
                currencySymbol={theme.tenant.currencySymbol}
              />
              </Animated.View>
            )}

            {/* Botón agregar a Wallet */}
            <Animated.View 
              style={styles.addCardContainer}
              entering={FadeInUp.duration(700).delay(200).springify()}
              layout={LinearTransition.springify().damping(20).stiffness(100)}
            >
              <AddToWalletButton
                onPress={() => {
                  const walletName = Platform.OS === 'android' ? "Google Wallet" : "Apple Wallet";
                  Alert.alert(`Agregar a ${walletName}`, `Esta tarjeta se agregará a tu ${walletName}`);
                }}
              />
            </Animated.View>
          </>
        )}
        </Animated.View>
      </ScrollView>
    </ThemedView>
  );
}

const createStyles = (
  theme: ReturnType<typeof useAppTheme>,
  layout: ReturnType<typeof useResponsiveLayout>,
  cardWidth: number,
  cardHeight: number
) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  scrollContentLandscape: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: layout.horizontalPadding,
  },
  landscapeWrapper: {
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
  },
  carouselContainer: {
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    overflow: 'hidden',
  },
  carouselContent: {
    paddingVertical: 15,
    paddingHorizontal: (layout.screenWidth - cardWidth) / 2,
    alignItems: "center",
  },
  carouselList: {
    width: layout.screenWidth,
  },
  cardContainer: {
    height: cardHeight,
    justifyContent: "center",
    marginHorizontal: 10,
  },
  // Layout landscape
  landscapeContainer: {
    flexDirection: 'row',
    paddingHorizontal: layout.horizontalPadding,
    gap: 20,
    marginTop: 8,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  landscapeColumn: {
    flex: 1,
    maxWidth: 420,
    minWidth: 300,
  },
  addCardContainerLandscape: {
    marginTop: 16,
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
  cardContent: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 18,
    paddingBottom: 0,
  },
  cardMiddle: {
    flex: 1,
    justifyContent: "center",
    paddingLeft: 18,
  },
  cardChipContainer: {
    marginLeft: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  cardBottomSection: {
    paddingHorizontal: 18,
    paddingTop: 12,
    gap: 8,
  },
  cardTypeBadge: {
    backgroundColor: theme.isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.25)",
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
    backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardChip: {
    position: "absolute",
    top: 70,
    left: 24,
    width: 50,
    height: 40,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  cardNumberContainer: {
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 2,
    textAlign: 'right',
  },
  cardDataSection: {
    position: 'absolute',
    bottom: 75,
    left: 18,
    right: 18,
    gap: 8,
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
  // Panel de balance en la pantalla principal
  balancePanel: {
    marginHorizontal: 20,
    marginTop: 0,
    marginBottom: 8,
    padding: 10,
    borderRadius: 12,
    backgroundColor: theme.isDark ? 'rgba(0, 122, 255, 0.12)' : 'rgba(0, 122, 255, 0.06)',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  balanceItem: {
    flex: 1,
  },
  creditItem: {
    flex: 1,
    alignItems: 'flex-end',
  },
  creditSlider: {
    width: '100%',
    height: 20,
    marginTop: 4,
  },
  creditLimitText: {
    fontSize: 10,
    fontWeight: '600',
    opacity: 0.5,
    marginTop: 2,
  },
  balanceLabel: {
    fontSize: 9,
    fontWeight: '600',
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  lastTransactionText: {
    fontSize: 10,
    fontWeight: '600',
    opacity: 0.5,
    letterSpacing: 0.2,
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  // Estilos para panel de pagos compacto
  paymentPanel: {
    marginHorizontal: 20,
    marginTop: 0,
    marginBottom: 8,
    padding: 6,
    borderRadius: 10,
    backgroundColor: theme.isDark ? 'rgba(0, 122, 255, 0.15)' : 'rgba(0, 122, 255, 0.08)',
  },
  compactPaymentGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactPaymentCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactPaymentLabel: {
    fontSize: 8,
    fontWeight: '600',
    opacity: 0.5,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  compactPaymentValue: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  compactPaymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compactPaymentInfo: {
    flex: 1,
  },
  compactPaymentTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 4,
    opacity: 0.7,
  },
  compactAmountsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compactAmountItem: {
    flex: 1,
  },
  compactAmountLabel: {
    fontSize: 8,
    fontWeight: '600',
    opacity: 0.5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  compactAmountValue: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  compactAmountDivider: {
    width: 1,
    height: 24,
    backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
    opacity: 0.3,
  },
  paymentPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.isDark ? 'rgba(0, 122, 255, 0.25)' : 'rgba(0, 122, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentIcon: {
    fontSize: 20,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  paymentDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  paymentSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    opacity: 0.6,
    flex: 1,
  },
  paymentAmounts: {
    flexDirection: 'row',
    gap: 10,
  },
  paymentAmountCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.5)',
    gap: 4,
  },
  paymentAmountCardHighlight: {
    backgroundColor: theme.isDark ? 'rgba(52, 199, 89, 0.2)' : 'rgba(52, 199, 89, 0.1)',
  },
  paymentAmountLabel: {
    fontSize: 10,
    fontWeight: '600',
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  paymentAmountValue: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  actionsSection: {
    marginTop: 0,
    marginBottom: 8,
    maxWidth: layout.isLandscape ? undefined : 420,
    alignSelf: 'center',
    width: '100%',
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
    maxWidth: 420,
    alignSelf: 'center',
    width: '100%',
  },
  financialInfoWrapper: {
    paddingHorizontal: 20,
    maxWidth: 420,
    alignSelf: 'center',
    width: '100%',
  },
});
