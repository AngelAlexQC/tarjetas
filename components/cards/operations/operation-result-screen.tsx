import { ThemedText } from '@/components/themed-text';
import { Card } from '@/features/cards/services/card-service';
import { OperationResult } from '@/features/cards/types/card-operations';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { generateReceiptHtml } from '@/utils/receipt-html';
import { printToFileAsync } from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { Share2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
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
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const html = await generateReceiptHtml({
        result,
        card,
        transactionDetails,
        theme
      });
      
      const { uri } = await printToFileAsync({ html });
      await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      console.error('Error al compartir PDF:', error);
      Alert.alert('Error', 'No se pudo generar el PDF');
    } finally {
      setIsExporting(false);
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
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      paddingBottom: 40,
      gap: 16,
    },
    modalTitle: {
      marginBottom: 8,
      textAlign: 'center',
    },
    optionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
    },
    optionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    optionText: {
      flex: 1,
    },
    optionSubtext: {
      fontSize: 12,
      opacity: 0.7,
      marginTop: 2,
    },
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
            entering={ZoomIn.duration(400)} 
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
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.tenant.mainColor, opacity: isExporting ? 0.7 : 1 }]}
          onPress={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Share2 size={20} color="#FFF" />
              <ThemedText style={{ color: '#FFF', fontWeight: 'bold' }}>Compartir Comprobante</ThemedText>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.colors.surfaceHigher }]}
          onPress={onClose}
        >
          <ThemedText style={{ color: theme.colors.text }}>Cerrar</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}
