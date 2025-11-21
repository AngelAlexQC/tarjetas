import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CardBrandIcons } from '@/components/ui/card-brand-icons';
import { Card } from '@/features/cards/services/card-service';
import { OperationResult } from '@/features/cards/types/card-operations';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { LinearGradient } from 'expo-linear-gradient';
import { printToFileAsync } from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { Check, Share2, XCircle } from 'lucide-react-native';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { DragonflyLogo } from '@/components/ui/dragonfly-logo';

interface OperationResultScreenProps {
  result: OperationResult;
  onClose: () => void;
  card?: Card;
  transactionDetails?: { label: string; value: string; isAmount?: boolean }[];
  children?: React.ReactNode;
}

export function OperationResultScreen({ result, onClose, card, transactionDetails, children }: OperationResultScreenProps) {
  const theme = useAppTheme();
  const layout = useResponsiveLayout();

  const isSuccess = result.success;
  const Icon = isSuccess ? Check : XCircle;
  const color = isSuccess ? '#4CAF50' : '#F44336';
  
  // Use tenant theme for receipt branding
  const gradientColors = theme.tenant.gradientColors || [theme.tenant.mainColor, theme.tenant.secondaryColor];

  const handleShare = async () => {
    // ... existing share logic (can be updated later) ...
    try {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <h1>Comprobante</h1>
            <p>${result.message}</p>
          </body>
        </html>
      `;
      const { uri } = await printToFileAsync({ html });
      await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      console.error('Error al compartir:', error);
    }
  };

  return (
    <ThemedView style={[styles.container, { padding: layout.horizontalPadding }]} surface="level1">
      <View style={styles.content}>
        
        {/* Receipt Card */}
        <Animated.View 
          entering={ZoomIn.duration(600).damping(30)} 
          style={[
            styles.receiptCard, 
            { backgroundColor: theme.colors.surface }
          ]}
        >
          
          {/* Header with Card Pattern */}
          <LinearGradient
            colors={gradientColors as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.receiptHeader}
          />

          {/* Icon Bubble */}
          <View style={[styles.iconBubble, { backgroundColor: theme.colors.surface }]}>
            <Icon size={28} color={color} strokeWidth={3} />
          </View>

          <View style={styles.receiptBody}>
            {/* Logos Row */}
            <View style={styles.logosRow}>
              <View style={styles.logoContainer}>
                {theme.tenant.logoUrl ? (
                  <Image source={{ uri: theme.tenant.logoUrl }} style={styles.logo} resizeMode="contain" />
                ) : (
                  <ThemedText type="defaultSemiBold" style={{ fontSize: 12 }}>{theme.tenant.name}</ThemedText>
                )}
              </View>
              <View style={[styles.dividerVertical, { backgroundColor: theme.colors.border }]} />
              <View style={[styles.logoContainer, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
                <DragonflyLogo width={20} height={20} />
                <ThemedText type="defaultSemiBold" style={{ fontSize: 12, color: theme.colors.textSecondary }}>Libélula</ThemedText>
              </View>
              {card && (
                <>
                  <View style={[styles.dividerVertical, { backgroundColor: theme.colors.border }]} />
                  <View style={styles.logoContainer}>
                    {CardBrandIcons[card.cardBrand] && React.createElement(CardBrandIcons[card.cardBrand], { width: 32, height: 20 })}
                  </View>
                </>
              )}
            </View>

            <ThemedText type="title" style={{ textAlign: 'center', marginTop: 8, marginBottom: 4, fontSize: 18 }}>
              {result.title}
            </ThemedText>
            
            <ThemedText style={{ textAlign: 'center', color: theme.colors.textSecondary, marginBottom: 16, paddingHorizontal: 16, fontSize: 14 }}>
              {result.message}
            </ThemedText>

            {/* Transaction Details */}
            {transactionDetails && (
              <View style={styles.detailsContainer}>
                {transactionDetails.map((detail, index) => (
                  <View key={index} style={styles.detailRow}>
                    <ThemedText style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>{detail.label}</ThemedText>
                    <ThemedText 
                      type={detail.isAmount ? 'defaultSemiBold' : 'default'} 
                      style={[styles.detailValue, detail.isAmount && { fontSize: 16, color: theme.tenant.mainColor }]}
                    >
                      {detail.value}
                    </ThemedText>
                  </View>
                ))}
                <View style={[styles.dashedLine, { borderColor: theme.colors.border }]} />
              </View>
            )}

            {/* Receipt ID */}
            {result.receiptId && (
              <View style={styles.receiptIdContainer}>
                <ThemedText style={{ fontSize: 10, color: theme.colors.textSecondary, textTransform: 'uppercase' }}>Comprobante</ThemedText>
                <ThemedText style={{ fontFamily: 'monospace', fontSize: 12, marginTop: 2 }}>{result.receiptId}</ThemedText>
              </View>
            )}

            {/* Visual Card (Children) */}
            {children && (
              <View style={styles.childrenContainer}>
                {children}
              </View>
            )}
          </View>
        </Animated.View>

      </View>

      <View style={styles.footer}>
        {isSuccess && (
          <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.surfaceHigher }]} onPress={handleShare}>
            <Share2 size={20} color={theme.colors.text} />
            <ThemedText>Compartir</ThemedText>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.tenant.mainColor }]} 
          onPress={onClose}
        >
          <ThemedText style={{ color: theme.colors.textInverse, fontWeight: 'bold' }}>
            {isSuccess ? 'Finalizar' : 'Intentar de nuevo'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  receiptHeader: {
    height: 70,
    width: '100%',
  },
  iconBubble: {
    position: 'absolute',
    top: 46, // 70 (header) - 24 (half bubble)
    alignSelf: 'center',
    zIndex: 10,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  receiptBody: {
    paddingTop: 30,
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  logosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    opacity: 0.7,
  },
  logoContainer: {
    paddingHorizontal: 8,
  },
  logo: {
    width: 60,
    height: 20,
  },
  dividerVertical: {
    width: 1,
    height: 12,
  },
  detailsContainer: {
    width: '100%',
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    textAlign: 'right',
  },
  dashedLine: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 1,
    marginVertical: 12,
    opacity: 0.3,
  },
  receiptIdContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  childrenContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  footer: {
    gap: 12,
    paddingBottom: 24,
    marginTop: 16,
  },
  button: {
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  }
});
