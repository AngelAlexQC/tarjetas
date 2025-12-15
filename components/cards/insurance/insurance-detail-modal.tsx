import { useAppTheme } from '@/hooks/use-app-theme';
import type { Card } from '@/repositories';
import { formatCurrency } from '@/utils/formatters/currency';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
  Modal,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyles } from './insurance-detail-modal-styles';
import { Insurance } from './insurance-generator';
import { ModalContent } from './modal-content';
import { ModalFooter } from './modal-footer';
import { ModalHeader } from './modal-header';

interface InsuranceDetailModalProps {
  insurance: Insurance | null;
  visible: boolean;
  onClose: () => void;
  onContract?: (insurance: Insurance) => void;
  activeCard?: Card;
}

// Mapeo de iconos
const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  heart: 'heart',
  shield: 'shield-checkmark',
  briefcase: 'briefcase',
  airplane: 'airplane',
  medical: 'medical',
  cart: 'cart',
  lock: 'lock-closed',
  globe: 'globe',
};

export function InsuranceDetailModal({
  insurance,
  visible,
  onClose,
  onContract,
  activeCard,
}: InsuranceDetailModalProps) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Calcular dimensiones responsivas
  const isWeb = Platform.OS === 'web';
  const isLargeScreen = screenWidth > 768;
  const modalMaxWidth = isLargeScreen ? 480 : screenWidth;
  const modalMaxHeight = screenHeight * 0.85;

  const formatAmount = useMemo(() => {
    if (!insurance) return (amount: number) => String(amount);
    return (amount: number): string => {
      return formatCurrency(amount, {
        locale: 'en-US',
        currency: insurance.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    };
  }, [insurance]);

  if (!insurance) return null;

  const styles = createStyles({
    theme,
    insets,
    isLargeScreen,
    modalMaxHeight,
    modalMaxWidth,
  });

  // Handler para cerrar al tocar el overlay
  const handleOverlayPress = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType={isWeb ? 'fade' : 'none'}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={handleOverlayPress}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              entering={isWeb ? undefined : SlideInDown.springify()}
              style={[styles.modalContainer, { maxHeight: modalMaxHeight }]}
            >
              {/* Drag indicator */}
              <View style={styles.dragIndicator} />

              {/* Header */}
              <ModalHeader 
                insurance={insurance} 
                theme={theme} 
                onClose={onClose} 
                styles={styles} 
                iconMap={ICON_MAP} 
              />

              {/* Content */}
              <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                <ModalContent 
                  insurance={insurance} 
                  styles={styles} 
                  formatAmount={formatAmount} 
                />
              </ScrollView>

              {/* Footer */}
              <ModalFooter 
                insurance={insurance} 
                activeCard={activeCard} 
                formatAmount={formatAmount} 
                onContract={onContract} 
                onClose={onClose} 
                styles={styles} 
              />
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
