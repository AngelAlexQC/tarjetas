import { CardActionsGrid } from "@/components/cards/card-actions-grid";
import { CardFinancialInfo } from "@/components/cards/card-financial-info";
import { CreditCard } from "@/components/cards/credit-card";
import { InsuranceCarousel } from "@/components/cards/insurance/insurance-carousel";
import { InsuranceDetailModal } from "@/components/cards/insurance/insurance-detail-modal";
import { Insurance } from "@/components/cards/insurance/insurance-generator";
import { InstitutionSelectorHeader } from "@/components/institution-selector-header";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AddToWalletButton } from "@/components/ui/add-to-wallet-button";
import { FaqButton } from "@/components/ui/faq-button";
import { PoweredBy } from "@/components/ui/powered-by";
import { CardActionType } from "@/constants/card-actions";
import { useCardActions } from "@/features/cards/hooks/use-card-actions";
import { Card, cardService } from "@/features/cards/services/card-service";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useScrollToTop } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from "react";
import {
    Alert,
    FlatList,
    Platform,
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
    SlideInLeft,
    SlideInRight,
    ZoomIn,
    ZoomOut
} from "react-native-reanimated";

// Las dimensiones serán calculadas dinámicamente en el componente

export default function CardsScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const layout = useResponsiveLayout();
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [selectedInsurance, setSelectedInsurance] = useState<Insurance | null>(null);
  const [isInsuranceModalVisible, setIsInsuranceModalVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const scrollRef = useRef(null);

  useScrollToTop(scrollRef);
  
  // Dimensiones consistentes para el carrusel en todas las pantallas
  const SCREEN_WIDTH = layout.screenWidth;
  
  // Mantener proporción 85% del ancho o máximo 400px
  const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.85, 400);
  const CARD_HEIGHT = 200;
  const CARD_SPACING = 20;
  
  const styles = createStyles(theme, layout, CARD_WIDTH, CARD_HEIGHT, CARD_SPACING);
  
  // Generar tarjetas con valores aleatorios al inicio
  const mockCards = useMemo(() => cardService.getCards(), []);
  
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

  const handleCardPress = (index: number) => {
    flatListRef.current?.scrollToOffset({
      offset: index * (CARD_WIDTH + CARD_SPACING),
      animated: true
    });
    setActiveCardIndex(index);
  };

  const handleActionPress = (actionType: CardActionType) => {
    if (!activeCard) return;
    
    switch (actionType) {
      case 'block':
        router.push(`/cards/${activeCard.id}/block` as any);
        break;
      case 'defer':
        router.push(`/cards/${activeCard.id}/defer` as any);
        break;
      case 'statement':
        router.push(`/cards/${activeCard.id}/statements` as any);
        break;
      case 'advances':
        router.push(`/cards/${activeCard.id}/advance` as any);
        break;
      case 'limits':
        router.push(`/cards/${activeCard.id}/limits` as any);
        break;
      case 'pin':
        router.push(`/cards/${activeCard.id}/pin` as any);
        break;
      case 'subscriptions':
        router.push(`/cards/${activeCard.id}/subscriptions` as any);
        break;
      case 'pay':
        router.push(`/cards/${activeCard.id}/pay` as any);
        break;
      case 'cardless_atm':
        router.push(`/cards/${activeCard.id}/cardless-atm` as any);
        break;
      case 'travel':
        router.push(`/cards/${activeCard.id}/travel` as any);
        break;
      case 'channels':
        router.push(`/cards/${activeCard.id}/channels` as any);
        break;
      case 'cvv':
        router.push(`/cards/${activeCard.id}/cvv` as any);
        break;
      case 'replace':
        router.push(`/cards/${activeCard.id}/replace` as any);
        break;
      case 'rewards':
        router.push(`/cards/${activeCard.id}/rewards` as any);
        break;
      default:
        cardActions.executeAction(actionType);
    }
  };

  const renderCard = ({ item, index }: { item: Card; index: number }) => {
    const isActive = index === activeCardIndex;

    return (
      <View style={[styles.cardContainer, { width: CARD_WIDTH }]}>
        <CreditCard
          card={item}
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          style={{ opacity: isActive ? 1 : 0.6 }}
          onPress={() => handleCardPress(index)}
          isActive={isActive}
        />
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          layout.isLandscape && styles.scrollContentLandscape
        ]}
        bounces={layout.isPortrait}
        contentInsetAdjustmentBehavior="automatic"
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
            snapToInterval={CARD_WIDTH + CARD_SPACING}
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
          // Eliminado layout transition global pesado
        >
        {layout.isLandscape ? (
          // Layout horizontal: tarjeta info y acciones en columnas
          <Animated.View 
            style={styles.landscapeContainer}
            entering={FadeInLeft.duration(400)}
          >
            <Animated.View 
              style={styles.landscapeColumn}
              entering={SlideInLeft.duration(500)}
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
                entering={FadeInUp.duration(500).delay(100)}
              >
                <AddToWalletButton
                  onPress={() => {
                    const walletName = Platform.OS === 'android' ? "Google Wallet" : "Apple Wallet";
                    Alert.alert(`Agregar a ${walletName}`, `Esta tarjeta se agregará a tu ${walletName}`);
                  }}
                />
                <FaqButton 
                  onPress={() => router.push('/faq')}
                  style={{ marginTop: 12 }}
                />
              </Animated.View>
            </Animated.View>
            <Animated.View 
              style={styles.landscapeColumn}
              entering={SlideInRight.duration(500)}
            >
              {activeCard && (
                <Animated.View 
                  entering={ZoomIn.duration(400).delay(50)}
                  exiting={ZoomOut.duration(200)}
                >
                  <CardActionsGrid
                    cardType={activeCard.cardType}
                    isLoading={cardActions.isLoading}
                    onActionPress={handleActionPress}
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
                entering={FadeInDown.duration(400)}
                exiting={FadeOut.duration(200)}
              >
                <CardActionsGrid
                  cardType={activeCard.cardType}
                  isLoading={cardActions.isLoading}
                  onActionPress={handleActionPress}
                />
              </Animated.View>
            )}

            {/* Panel de información financiera */}
            {activeCard && (
              <Animated.View
                style={styles.financialInfoWrapper}
                entering={FadeInUp.duration(500).delay(50)}
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
              entering={FadeInUp.duration(500).delay(100)}
            >
              <AddToWalletButton
                onPress={() => {
                  const walletName = Platform.OS === 'android' ? "Google Wallet" : "Apple Wallet";
                  Alert.alert(`Agregar a ${walletName}`, `Esta tarjeta se agregará a tu ${walletName}`);
                }}
              />
              <FaqButton 
                onPress={() => router.push('/faq')}
                style={{ marginTop: 12 }}
              />
            </Animated.View>
          </>
        )}
        </Animated.View>
        
        {/* Powered By */}
        <PoweredBy />
        
        {/* Insurance Carousel */}
        <InsuranceCarousel
          onInsurancePress={(insurance) => {
            setSelectedInsurance(insurance);
            setIsInsuranceModalVisible(true);
          }}
        />
      </ScrollView>
      
      {/* Insurance Detail Modal */}
      <InsuranceDetailModal
        insurance={selectedInsurance}
        visible={isInsuranceModalVisible}
        onClose={() => {
          setIsInsuranceModalVisible(false);
          setSelectedInsurance(null);
        }}
        onContract={(insurance) => {
          Alert.alert(
            'Contratar Seguro',
            `¿Deseas contratar el seguro "${insurance.title}"?`,
            [
              { text: 'Cancelar', style: 'cancel' },
              { 
                text: 'Confirmar', 
                onPress: () => {
                  Alert.alert('Éxito', 'Seguro contratado exitosamente');
                }
              },
            ]
          );
        }}
      />
    </ThemedView>
  );
}

const createStyles = (
  theme: ReturnType<typeof useAppTheme>,
  layout: ReturnType<typeof useResponsiveLayout>,
  cardWidth: number,
  cardHeight: number,
  cardSpacing: number
) => StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
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
    paddingHorizontal: (layout.screenWidth - cardWidth - cardSpacing) / 2,
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
