import { Insurance } from "@/components/cards/insurance/insurance-generator";
import { useSplash } from "@/contexts/splash-context";
import { Card, OperationResult } from "@/repositories";
import { CardActionType } from "@/repositories/schemas/card-action.schema";
import { cardActionRoute } from "@/types/routes";
import { formatCurrency } from "@/utils/formatters/currency";
import { useFocusEffect, useScrollToTop } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, FlatList, Platform, ViewToken } from "react-native";
import { useCardQueries } from "./use-card-queries";

interface UseCardsScreenOptions {
  cardWidth: number;
  cardSpacing: number;
}

export function useCardsScreen({ cardWidth, cardSpacing }: UseCardsScreenOptions) {
  const isMountedRef = useRef(true);
  const router = useRouter();
  const { isSplashComplete } = useSplash();

  // State
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [selectedInsurance, setSelectedInsurance] = useState<Insurance | null>(null);
  const [isInsuranceModalVisible, setIsInsuranceModalVisible] = useState(false);
  const [insuranceResult, setInsuranceResult] = useState<OperationResult | null>(null);
  const [contractedInsurance, setContractedInsurance] = useState<Insurance | null>(null);

  // Refs
  const flatListRef = useRef<FlatList>(null);
  const scrollRef = useRef(null);

  // Custom hooks
  useScrollToTop(scrollRef);
  const { cards, isLoading: isLoadingCards, fetchCards } = useCardQueries({ autoFetch: false });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      setSelectedInsurance(null);
      setIsInsuranceModalVisible(false);
      setInsuranceResult(null);
      setContractedInsurance(null);
    };
  }, []);

  // Fetch cards on focus
  useFocusEffect(
    useCallback(() => {
      if (isSplashComplete && cards.length === 0) {
        fetchCards();
      }
    }, [cards.length, fetchCards, isSplashComplete])
  );

  // Derived state
  const activeCard = cards[activeCardIndex];
  const isIOS = Platform.OS === "ios";

  // Handlers
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

  const handleCardPress = useCallback(
    (index: number) => {
      flatListRef.current?.scrollToOffset({
        offset: index * (cardWidth + cardSpacing),
        animated: true,
      });
      setActiveCardIndex(index);
    },
    [cardWidth, cardSpacing]
  );

  const handleActionPress = useCallback(
    (actionType: CardActionType) => {
      if (!activeCard) return;
      router.push(cardActionRoute(activeCard.id, actionType));
    },
    [activeCard, router]
  );

  const handleInsurancePress = useCallback((insurance: Insurance) => {
    setSelectedInsurance(insurance);
    setIsInsuranceModalVisible(true);
  }, []);

  const handleInsuranceModalClose = useCallback(() => {
    setIsInsuranceModalVisible(false);
    setSelectedInsurance(null);
  }, []);

  const handleInsuranceResultClose = useCallback(() => {
    setInsuranceResult(null);
    setContractedInsurance(null);
    setSelectedInsurance(null);
  }, []);

  const handleInsuranceContract = useCallback(
    (insurance: Insurance) => {
      if (!activeCard) {
        Alert.alert("Error", "No hay una tarjeta seleccionada");
        return;
      }

      const { hasEnoughFunds, availableFunds, fundType } = validateFunds(activeCard, insurance.monthlyPrice);

      if (!hasEnoughFunds) {
        showInsufficientFundsAlert(insurance, availableFunds, fundType);
        return;
      }

      showContractConfirmation(insurance, activeCard, availableFunds, fundType, () => {
        setIsInsuranceModalVisible(false);
        setContractedInsurance(insurance);

        setTimeout(() => {
          if (isMountedRef.current) {
            setInsuranceResult({
              success: true,
              title: "Seguro Contratado",
              message: `Tu seguro "${insurance.title}" ha sido contratado exitosamente. El cargo mensual se realizará automáticamente.`,
              receiptId: `INS-${Date.now().toString().slice(-8)}`,
            });
          }
        }, 300);
      });
    },
    [activeCard]
  );

  const handleAddToWallet = useCallback(() => {
    const walletName = Platform.OS === "android" ? "Google Wallet" : "Apple Wallet";
    Alert.alert(`Agregar a ${walletName}`, `Esta tarjeta se agregará a tu ${walletName}`);
  }, []);

  const handleFaqPress = useCallback(() => {
    router.push("/faq");
  }, [router]);

  return {
    // State
    activeCardIndex,
    activeCard,
    selectedInsurance,
    isInsuranceModalVisible,
    insuranceResult,
    contractedInsurance,
    cards,
    isLoadingCards,
    isSplashComplete,
    isIOS,

    // Refs
    flatListRef,
    scrollRef,

    // Config
    viewabilityConfig,

    // Handlers
    onViewableItemsChanged,
    handleCardPress,
    handleActionPress,
    handleInsurancePress,
    handleInsuranceModalClose,
    handleInsuranceResultClose,
    handleInsuranceContract,
    handleAddToWallet,
    handleFaqPress,
  };
}

// Helper functions
function validateFunds(card: Card, monthlyPrice: number) {
  let hasEnoughFunds = false;
  let availableFunds = 0;
  let fundType = "";

  if (card.cardType === "credit" || card.cardType === "virtual") {
    availableFunds = card.availableCredit || 0;
    fundType = "crédito disponible";
    hasEnoughFunds = availableFunds >= monthlyPrice;
  } else if (card.cardType === "debit") {
    availableFunds = card.balance || 0;
    fundType = "saldo";
    hasEnoughFunds = availableFunds >= monthlyPrice;
  }

  return { hasEnoughFunds, availableFunds, fundType };
}

function showInsufficientFundsAlert(insurance: Insurance, availableFunds: number, fundType: string) {
  const formatOptions = { locale: "es-US", currency: insurance.currency };

  Alert.alert(
    "Fondos Insuficientes",
    `No tienes suficiente ${fundType} en esta tarjeta.\n\n` +
      `Necesitas: ${formatCurrency(insurance.monthlyPrice, formatOptions)}\n` +
      `Disponible: ${formatCurrency(availableFunds, formatOptions)}\n\n` +
      `Por favor, selecciona otra tarjeta o realiza un pago/recarga.`,
    [{ text: "Entendido" }]
  );
}

function showContractConfirmation(
  insurance: Insurance,
  card: Card,
  availableFunds: number,
  fundType: string,
  onConfirm: () => void
) {
  const formatOptions = { locale: "es-US", currency: insurance.currency };

  Alert.alert(
    "Contratar Seguro",
    `¿Deseas contratar el seguro "${insurance.title}"?\n\n` +
      `Costo mensual: ${formatCurrency(insurance.monthlyPrice, formatOptions)}\n` +
      `Se cargará a: ${card.cardNumber}\n` +
      `${fundType === "crédito disponible" ? "Crédito" : "Saldo"} disponible: ${formatCurrency(availableFunds, formatOptions)}`,
    [
      { text: "Cancelar", style: "cancel" },
      { text: "Confirmar", onPress: onConfirm },
    ]
  );
}
