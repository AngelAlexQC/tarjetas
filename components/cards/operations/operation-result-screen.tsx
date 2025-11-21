import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/features/cards/services/card-service';
import { OperationResult } from '@/features/cards/types/card-operations';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { generateReceiptHtml } from '@/utils/receipt-html';
import { printToFileAsync } from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { Share2 } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
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
  const isSuccess = result.success;

  const handleShare = async () => {
    try {
      const html = generateReceiptHtml({
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

  return (
    <ThemedView style={[styles.container, { padding: layout.horizontalPadding }]} surface="level1">
      <View style={styles.content}>
        
        <Animated.View 
          entering={ZoomIn.duration(600).damping(30)} 
          style={{ width: '100%', maxWidth: 360 }}
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
