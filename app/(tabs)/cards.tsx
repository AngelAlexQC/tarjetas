import { CardActionsGrid } from "@/components/cards/card-actions-grid";
import { CardCarousel } from "@/components/cards/card-carousel";
import { CardFinancialInfo } from "@/components/cards/card-financial-info";
import { InsuranceCarousel } from "@/components/cards/insurance/insurance-carousel";
import { InsuranceDetailModal } from "@/components/cards/insurance/insurance-detail-modal";
import { InsuranceResultModal } from "@/components/cards/insurance/insurance-result-modal";
import { InstitutionSelectorHeader } from "@/components/institution-selector-header";
import { ThemedView } from "@/components/themed-view";
import { AddToWalletButton } from "@/components/ui/add-to-wallet-button";
import { FaqButton } from "@/components/ui/faq-button";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { PoweredBy } from "@/components/ui/powered-by";
import { useCardsScreen } from "@/hooks/cards";
import { useAppTheme } from "@/hooks/use-app-theme";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import Animated, {
  FadeInDown,
  FadeInLeft,
  FadeInUp,
  FadeOut,
  SlideInLeft,
  SlideInRight,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CardsScreen() {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();
  const insets = useSafeAreaInsets();
  const isIOS = Platform.OS === "ios";

  // Dimensiones del carrusel
  const SCREEN_WIDTH = layout.screenWidth;
  const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.85, 400);
  const CARD_HEIGHT = 200;
  const CARD_SPACING = 20;

  const {
    activeCard,
    activeCardIndex,
    cards,
    isLoadingCards,
    isSplashComplete,
    selectedInsurance,
    isInsuranceModalVisible,
    insuranceResult,
    contractedInsurance,
    flatListRef,
    scrollRef,
    viewabilityConfig,
    onViewableItemsChanged,
    handleCardPress,
    handleActionPress,
    handleInsurancePress,
    handleInsuranceModalClose,
    handleInsuranceResultClose,
    handleInsuranceContract,
    handleAddToWallet,
    handleFaqPress,
  } = useCardsScreen({ cardWidth: CARD_WIDTH, cardSpacing: CARD_SPACING });

  const styles = createStyles(theme, layout);

  // No renderizar mientras el splash esté activo
  if (!isSplashComplete) {
    return null;
  }

  // Loading inicial
  if (isLoadingCards && cards.length === 0) {
    return <LoadingScreen message="Cargando tus tarjetas..." />;
  }

  return (
    <>
      <ThemedView style={styles.container}>
        <View style={{ paddingTop: isIOS ? 0 : insets.top }} />
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            layout.isLandscape && styles.scrollContentLandscape,
          ]}
          bounces={layout.isPortrait}
          contentInsetAdjustmentBehavior="automatic"
        >
          <InstitutionSelectorHeader />

          <CardCarousel
            cards={cards}
            activeCardIndex={activeCardIndex}
            cardWidth={CARD_WIDTH}
            cardHeight={CARD_HEIGHT}
            cardSpacing={CARD_SPACING}
            screenWidth={SCREEN_WIDTH}
            flatListRef={flatListRef}
            onCardPress={handleCardPress}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
          />

          <Animated.View style={layout.isLandscape && styles.landscapeWrapper}>
            {layout.isLandscape ? (
              <LandscapeLayout
                activeCard={activeCard}
                isLoadingCards={isLoadingCards}
                theme={theme}
                styles={styles}
                onActionPress={handleActionPress}
                onAddToWallet={handleAddToWallet}
                onFaqPress={handleFaqPress}
              />
            ) : (
              <PortraitLayout
                activeCard={activeCard}
                isLoadingCards={isLoadingCards}
                theme={theme}
                styles={styles}
                onActionPress={handleActionPress}
                onAddToWallet={handleAddToWallet}
                onFaqPress={handleFaqPress}
              />
            )}
          </Animated.View>

          <PoweredBy />

          <InsuranceCarousel onInsurancePress={handleInsurancePress} />
        </ScrollView>

        <InsuranceDetailModal
          insurance={selectedInsurance}
          visible={isInsuranceModalVisible}
          activeCard={activeCard}
          onClose={handleInsuranceModalClose}
          onContract={handleInsuranceContract}
        />

        <InsuranceResultModal
          visible={insuranceResult !== null && contractedInsurance !== null}
          result={insuranceResult}
          insurance={contractedInsurance}
          card={activeCard}
          onClose={handleInsuranceResultClose}
        />
      </ThemedView>
    </>
  );
}

// Sub-components for layout variants
interface LayoutProps {
  activeCard: ReturnType<typeof useCardsScreen>["activeCard"];
  isLoadingCards: boolean;
  theme: ReturnType<typeof useAppTheme>;
  styles: ReturnType<typeof createStyles>;
  onActionPress: ReturnType<typeof useCardsScreen>["handleActionPress"];
  onAddToWallet: () => void;
  onFaqPress: () => void;
}

function LandscapeLayout({
  activeCard,
  isLoadingCards,
  theme,
  styles,
  onActionPress,
  onAddToWallet,
  onFaqPress,
}: LayoutProps) {
  return (
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
          <AddToWalletButton onPress={onAddToWallet} />
          <FaqButton onPress={onFaqPress} style={{ marginTop: 12 }} />
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
              isLoading={isLoadingCards}
              onActionPress={onActionPress}
            />
          </Animated.View>
        )}
      </Animated.View>
    </Animated.View>
  );
}

function PortraitLayout({
  activeCard,
  isLoadingCards,
  theme,
  styles,
  onActionPress,
  onAddToWallet,
  onFaqPress,
}: LayoutProps) {
  return (
    <>
      {activeCard && (
        <Animated.View
          style={styles.actionsSection}
          entering={FadeInDown.duration(400)}
          exiting={FadeOut.duration(200)}
        >
          <CardActionsGrid
            cardType={activeCard.cardType}
            isLoading={isLoadingCards}
            onActionPress={onActionPress}
          />
        </Animated.View>
      )}

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

      <Animated.View
        style={styles.addCardContainer}
        entering={FadeInUp.duration(500).delay(100)}
      >
        <AddToWalletButton onPress={onAddToWallet} />
        <FaqButton onPress={onFaqPress} style={{ marginTop: 12 }} />
      </Animated.View>
    </>
  );
}

const createStyles = (
  theme: ReturnType<typeof useAppTheme>,
  layout: ReturnType<typeof useResponsiveLayout>
) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 100,
    },
    scrollContentLandscape: {
      maxWidth: 1200,
      width: "100%",
      alignSelf: "center",
      paddingHorizontal: layout.horizontalPadding,
    },
    landscapeWrapper: {
      maxWidth: 900,
      width: "100%",
      alignSelf: "center",
    },
    landscapeContainer: {
      flexDirection: "row",
      paddingHorizontal: layout.horizontalPadding,
      gap: 20,
      marginTop: 8,
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    landscapeColumn: {
      flex: 1,
      maxWidth: 420,
      minWidth: 300,
    },
    addCardContainerLandscape: {
      marginTop: 16,
    },
    actionsSection: {
      marginTop: 0,
      marginBottom: 8,
      maxWidth: layout.isLandscape ? undefined : 420,
      alignSelf: "center",
      width: "100%",
    },
    addCardContainer: {
      paddingHorizontal: 20,
      paddingBottom: 20,
      marginTop: 8,
      maxWidth: 420,
      alignSelf: "center",
      width: "100%",
    },
    financialInfoWrapper: {
      paddingHorizontal: 20,
      maxWidth: 420,
      alignSelf: "center",
      width: "100%",
    },
  });
