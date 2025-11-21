import { ThemedText } from '@/components/themed-text';
import { Card } from '@/features/cards/services/card-service';
import { OperationResult } from '@/features/cards/types/card-operations';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { generateReceiptHtml } from '@/utils/receipt-html';
import { printToFileAsync } from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { Share2 } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ReceiptView } from './receipt-view';

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
  const insets = useSafeAreaInsets();
  const isSuccess = result.success;

  const handleShare = async () => {
    try {
      const html = await generateReceiptHtml({
        result,
        card,
        transactionDetails,
        theme
      });
      
      const { uri } = await printToFileAsync({ html });
      await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      console.error('Error al compartir:', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: layout.horizontalPadding,
      paddingTop: insets.top + 12,
      paddingBottom: 12,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: layout.screenHeight - insets.top - insets.bottom - 140,
    },
    receiptWrapper: {
      width: '100%',
      maxWidth: layout.isLandscape ? 480 : 360,
    },
    footer: {
      gap: 10,
      paddingHorizontal: layout.horizontalPadding,
      paddingTop: 12,
      paddingBottom: insets.bottom + 12,
      maxWidth: layout.isLandscape ? 480 : 360,
      width: '100%',
      alignSelf: 'center',
      backgroundColor: theme.colors.background,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    button: {
      height: 44,
      borderRadius: 22,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }
  });

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.content}>
          <Animated.View 
            entering={ZoomIn.duration(600).damping(30)} 
            style={styles.receiptWrapper}
          >
            <ReceiptView 
              result={result} 
              card={card} 
              transactionDetails={transactionDetails}
            >
              {children}
            </ReceiptView>
          </Animated.View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {isSuccess && (
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme.colors.surfaceHigher }]} 
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Share2 size={20} color={theme.colors.text} />
            <ThemedText>Compartir</ThemedText>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.tenant.mainColor }]} 
          onPress={onClose}
          activeOpacity={0.8}
        >
          <ThemedText style={{ color: theme.colors.textInverse, fontWeight: 'bold' }}>
            {isSuccess ? 'Finalizar' : 'Intentar de nuevo'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}
