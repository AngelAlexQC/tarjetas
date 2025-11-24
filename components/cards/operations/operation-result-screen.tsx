import { ThemedText } from '@/components/themed-text';
import { Card } from '@/features/cards/services/card-service';
import { OperationResult } from '@/features/cards/types/card-operations';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { generateReceiptHtml } from '@/utils/receipt-html';
import { File, Paths } from 'expo-file-system';
import { printToFileAsync } from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { FileImage, FileText, Share2 } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
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
  const viewRef = useRef<View>(null);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPdf = async () => {
    try {
      setIsExporting(true);
      setShowExportOptions(false);
      const html = await generateReceiptHtml({
        result,
        card,
        transactionDetails,
        theme
      });
      
      const { uri } = await printToFileAsync({ html });
      
      // Rename file to ensure .pdf extension for iOS sharing using new File API
      const fileName = `Comprobante_${result.receiptId || 'Operacion'}.pdf`;
      const sourceFile = new File(uri);
      const destinationFile = new File(Paths.cache, fileName);
      
      // Move the file to the new location
      sourceFile.move(destinationFile);

      await shareAsync(destinationFile.uri, { UTI: 'com.adobe.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      console.error('Error al compartir PDF:', error);
      Alert.alert('Error', 'No se pudo generar el PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportImage = async () => {
    try {
      setIsExporting(true);
      setShowExportOptions(false);
      
      const uri = await captureRef(viewRef, {
        format: 'jpg',
        quality: 0.9,
        result: 'tmpfile'
      });
      
      await shareAsync(uri, { mimeType: 'image/jpeg', UTI: 'public.jpeg' });
    } catch (error) {
      console.error('Error al compartir Imagen:', error);
      Alert.alert('Error', 'No se pudo generar la imagen');
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
            <View ref={viewRef} collapsable={false} style={{ backgroundColor: theme.colors.background, padding: 10 }}>
              <ReceiptView 
                result={result} 
                card={card} 
                transactionDetails={transactionDetails}
              >
                {children}
              </ReceiptView>
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.tenant.mainColor, opacity: isExporting ? 0.7 : 1 }]}
          onPress={() => setShowExportOptions(true)}
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

      {/* Export Options Modal */}
      <Modal
        visible={showExportOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowExportOptions(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowExportOptions(false)}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <ThemedText type="subtitle" style={styles.modalTitle}>Compartir Comprobante</ThemedText>
            
            <TouchableOpacity style={styles.optionItem} onPress={handleExportPdf}>
              <View style={[styles.optionIcon, { backgroundColor: theme.colors.surfaceHigher }]}>
                <FileText size={24} color={theme.tenant.mainColor} />
              </View>
              <View style={styles.optionText}>
                <ThemedText type="defaultSemiBold">Documento PDF</ThemedText>
                <ThemedText style={styles.optionSubtext}>Mejor para imprimir y documentos oficiales</ThemedText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionItem} onPress={handleExportImage}>
              <View style={[styles.optionIcon, { backgroundColor: theme.colors.surfaceHigher }]}>
                <FileImage size={24} color={theme.tenant.mainColor} />
              </View>
              <View style={styles.optionText}>
                <ThemedText type="defaultSemiBold">Imagen (JPG)</ThemedText>
                <ThemedText style={styles.optionSubtext}>Mejor para compartir rápidamente</ThemedText>
              </View>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
