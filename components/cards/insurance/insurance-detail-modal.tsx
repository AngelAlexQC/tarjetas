import { ThemedText } from '@/components/themed-text';
import { CardBrandIcons } from '@/components/ui/card-brand-icons';
import { ThemedButton } from '@/components/ui/themed-button';
import { Card } from '@/features/cards/services/card-service';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Dimensions,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Insurance } from './insurance-generator';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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

  if (!insurance) return null;

  // Calcular dimensiones responsivas
  const isWeb = Platform.OS === 'web';
  const isLargeScreen = SCREEN_WIDTH > 768;
  const modalMaxWidth = isLargeScreen ? 480 : SCREEN_WIDTH;
  const modalMaxHeight = isLargeScreen ? SCREEN_HEIGHT * 0.85 : SCREEN_HEIGHT * 0.85;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: insurance.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: isLargeScreen ? 'center' : 'flex-end',
      alignItems: isLargeScreen ? 'center' : 'stretch',
    },
    modalContainer: {
      backgroundColor: theme.isDark ? '#1C1C1E' : '#FFFFFF',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      borderBottomLeftRadius: isLargeScreen ? 20 : 0,
      borderBottomRightRadius: isLargeScreen ? 20 : 0,
      maxHeight: modalMaxHeight,
      maxWidth: modalMaxWidth,
      width: isLargeScreen ? modalMaxWidth : '100%',
      overflow: 'hidden',
      ...(isWeb && {
        // Mejoras específicas para web
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      }),
    },
    dragIndicator: {
      width: 32,
      height: 4,
      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)',
      borderRadius: 2,
      alignSelf: 'center',
      marginTop: 10,
      marginBottom: 6,
    },
    header: {
      padding: 16,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: theme.isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      letterSpacing: -0.3,
      marginBottom: 6,
    },
    description: {
      fontSize: 14,
      opacity: 0.6,
      lineHeight: 20,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '600',
      marginBottom: 10,
      letterSpacing: -0.2,
    },
    coverageCard: {
      flexDirection: 'row',
      padding: 14,
      borderRadius: 10,
      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
      borderWidth: 1,
      borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
    },
    coverageLeft: {
      flex: 1,
    },
    coverageLabel: {
      fontSize: 11,
      opacity: 0.5,
      marginBottom: 4,
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    coverageValue: {
      fontSize: 20,
      fontWeight: '700',
      letterSpacing: -0.4,
    },
    benefitItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 10,
      gap: 10,
    },
    benefitIconContainer: {
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
    },
    benefitText: {
      flex: 1,
      fontSize: 14,
      lineHeight: 20,
    },
    footer: {
      padding: 16,
      paddingTop: 14,
      paddingBottom: isLargeScreen ? 16 : Math.max(16, insets.bottom),
      borderTopWidth: 1,
      borderTopColor: theme.isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
      backgroundColor: theme.isDark ? '#1C1C1E' : '#FFFFFF',
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    priceLabel: {
      fontSize: 13,
      opacity: 0.6,
      fontWeight: '500',
    },
    priceValue: {
      fontSize: 24,
      fontWeight: '700',
      letterSpacing: -0.4,
    },
    disclaimer: {
      fontSize: 11,
      opacity: 0.4,
      lineHeight: 16,
      marginTop: 10,
      textAlign: 'center',
    },
    paymentCardSection: {
      marginBottom: 14,
      padding: 12,
      borderRadius: 12,
      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
      borderWidth: 1,
      borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    },
    paymentCardHeader: {
      fontSize: 11,
      opacity: 0.5,
      marginBottom: 10,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    paymentCardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    cardIconContainer: {
      width: 48,
      height: 32,
      borderRadius: 6,
      backgroundColor: theme.isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    cardInfo: {
      flex: 1,
    },
    cardNumber: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 2,
      letterSpacing: 0.5,
    },
    cardType: {
      fontSize: 11,
      opacity: 0.5,
      textTransform: 'capitalize',
    },
  });

  // Handler para cerrar al tocar el overlay
  const handleOverlayPress = () => {
    onClose();
  };

  // Handler para evitar que el contenido cierre el modal
  const handleContentPress = () => {
    // No hacer nada, solo evitar que el evento se propague
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType={isWeb ? 'fade' : 'none'}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={handleOverlayPress}>
        <Animated.View
          entering={isWeb ? undefined : SlideInDown.springify()}
          style={styles.modalContainer}
        >
          <Pressable 
            onPress={handleContentPress}
            style={{ flex: 1, maxHeight: modalMaxHeight }}
          >
            {/* Drag indicator */}
            <View style={styles.dragIndicator} />

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: `${insurance.color}15` },
                  ]}
                >
                  <Ionicons
                    name={ICON_MAP[insurance.icon] || 'shield-checkmark'}
                    size={24}
                    color={insurance.color}
                  />
                </View>

                <Pressable style={styles.closeButton} onPress={onClose}>
                  <Ionicons
                    name="close"
                    size={18}
                    color={theme.colors.text}
                  />
                </Pressable>
              </View>

              <ThemedText style={styles.title}>{insurance.title}</ThemedText>
              <ThemedText style={styles.description}>
                {insurance.description}
              </ThemedText>
            </View>

            {/* Content */}
            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
              {/* Cobertura */}
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Cobertura</ThemedText>
                <View style={styles.coverageCard}>
                  <View style={styles.coverageLeft}>
                    <ThemedText style={styles.coverageLabel}>
                      Cobertura máxima
                    </ThemedText>
                    <ThemedText style={styles.coverageValue}>
                      {formatCurrency(insurance.coverageAmount)}
                    </ThemedText>
                  </View>
                </View>
              </View>

              {/* Beneficios */}
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Beneficios incluidos</ThemedText>
                {insurance.benefits.map((benefit, index) => (
                  <Animated.View
                    key={index}
                    entering={FadeIn.delay(index * 80)}
                    style={styles.benefitItem}
                  >
                    <View
                      style={[
                        styles.benefitIconContainer,
                        { backgroundColor: `${insurance.color}15` },
                      ]}
                    >
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color={insurance.color}
                      />
                    </View>
                    <ThemedText style={styles.benefitText}>{benefit}</ThemedText>
                  </Animated.View>
                ))}
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              {/* Tarjeta de pago */}
              {activeCard && (
                <View style={styles.paymentCardSection}>
                  <ThemedText style={styles.paymentCardHeader}>
                    Se descontará de
                  </ThemedText>
                  <View style={styles.paymentCardContent}>
                    <View style={styles.cardIconContainer}>
                      {CardBrandIcons[activeCard.cardBrand] && 
                        CardBrandIcons[activeCard.cardBrand]({ width: 40, height: 26 })
                      }
                    </View>
                    <View style={styles.cardInfo}>
                      <ThemedText style={styles.cardNumber}>
                        {activeCard.cardNumber}
                      </ThemedText>
                      <ThemedText style={styles.cardType}>
                        Tarjeta {activeCard.cardType === 'credit' ? 'de crédito' : activeCard.cardType === 'debit' ? 'de débito' : 'virtual'}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.priceRow}>
                <ThemedText style={styles.priceLabel}>Desde</ThemedText>
                <ThemedText style={styles.priceValue}>
                  {formatCurrency(insurance.monthlyPrice)}/mes
                </ThemedText>
              </View>

              <ThemedButton
                title="Contratar ahora"
                onPress={() => {
                  onContract?.(insurance);
                  onClose();
                }}
              />

              <ThemedText style={styles.disclaimer}>
                Al contratar aceptas los términos y condiciones del seguro.
                Consulta la póliza completa para más detalles.
              </ThemedText>
            </View>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}
