import { CreditCard } from "@/components/cards/credit-card";
import { Insurance } from "@/components/cards/insurance/insurance-generator";
import { OperationResultScreen } from "@/components/cards/operations/operation-result-screen";
import { Card, OperationResult } from "@/repositories";
import { formatCurrency } from "@/utils/formatters/currency";
import { Modal, View } from "react-native";

interface InsuranceResultModalProps {
  visible: boolean;
  result: OperationResult | null;
  insurance: Insurance | null;
  card: Card | undefined;
  onClose: () => void;
}

export function InsuranceResultModal({
  visible,
  result,
  insurance,
  card,
  onClose,
}: InsuranceResultModalProps) {
  if (!result || !insurance) {
    return null;
  }

  const formatOptions = { locale: "es-US", currency: insurance.currency };

  const transactionDetails = [
    { label: "Seguro", value: insurance.title },
    {
      label: "Tipo de Producto",
      value: insurance.type
        .replace("-", " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),
    },
    {
      label: "Cobertura Máxima",
      value: formatCurrency(insurance.coverageAmount, formatOptions),
    },
    {
      label: "Costo Mensual",
      value: formatCurrency(insurance.monthlyPrice, formatOptions),
      isAmount: true,
    },
    { label: "Método de Pago", value: card?.cardNumber || "N/A" },
    {
      label: "Primera Facturación",
      value: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(
        "es-ES",
        { year: "numeric", month: "long", day: "numeric" }
      ),
    },
    { label: "Estado", value: "Activo" },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <OperationResultScreen
        result={result}
        onClose={onClose}
        card={card}
        transactionDetails={transactionDetails}
      >
        {card && (
          <View
            style={{
              transform: [{ scale: 0.55 }],
              alignItems: "center",
              marginTop: -20,
              marginBottom: -28,
            }}
          >
            <CreditCard card={card} width={300} />
          </View>
        )}
      </OperationResultScreen>
    </Modal>
  );
}
