import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { OperationResult } from '@/features/cards/types/card-operations';
import { useAppTheme } from '@/hooks/use-app-theme';
import { printToFileAsync } from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { CheckCircle2, Share2, XCircle } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';

interface OperationResultScreenProps {
  result: OperationResult;
  onClose: () => void;
}

export function OperationResultScreen({ result, onClose }: OperationResultScreenProps) {
  const theme = useAppTheme();

  const isSuccess = result.success;
  const Icon = isSuccess ? CheckCircle2 : XCircle;
  const color = isSuccess ? '#4CAF50' : '#F44336'; // Success Green / Error Red

  const handleShare = async () => {
    try {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
              
              body {
                font-family: 'Inter', Helvetica, Arial, sans-serif;
                background-color: #f5f5f5;
                margin: 0;
                padding: 20px;
                color: #1f2937;
              }
              
              .receipt-card {
                background-color: white;
                border-radius: 24px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                max-width: 400px;
                margin: 0 auto;
                overflow: hidden;
              }
              
              .brand-bar {
                height: 8px;
                background: linear-gradient(90deg, ${theme.tenant.mainColor}, ${theme.tenant.secondaryColor});
                width: 100%;
              }

              .header {
                background-color: white;
                padding: 32px 24px 16px;
                text-align: center;
              }
              
              .logo {
                height: 60px;
                object-fit: contain;
                margin-bottom: 16px;
              }
              
              .success-icon {
                width: 64px;
                height: 64px;
                background-color: #f3f4f6;
                color: ${theme.tenant.mainColor};
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 16px;
                font-size: 32px;
              }
              
              .title {
                font-size: 20px;
                font-weight: 600;
                margin: 0;
                color: #111827;
              }
              
              .content {
                padding: 32px 24px;
              }
              
              .amount-section {
                text-align: center;
                margin-bottom: 32px;
                padding-bottom: 24px;
                border-bottom: 1px dashed #e5e7eb;
              }
              
              .label {
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: #6b7280;
                margin-bottom: 4px;
              }
              
              .value {
                font-size: 16px;
                font-weight: 600;
                color: #111827;
              }
              
              .row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 16px;
              }
              
              .row:last-child {
                margin-bottom: 0;
              }
              
              .row .label {
                margin-bottom: 0;
              }
              
              .footer {
                background-color: #f3f4f6;
                padding: 16px 24px;
                text-align: center;
                font-size: 12px;
                color: #374151;
                border-top: 1px solid #e5e7eb;
              }
              
              .receipt-id {
                font-family: 'Courier New', monospace;
                background: #f3f4f6;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 14px;
                color: #4b5563;
                display: inline-block;
                margin-top: 4px;
              }
            </style>
          </head>
          <body>
            <div class="receipt-card">
              <div class="brand-bar"></div>
              <div class="header">
                ${theme.tenant.logoUrl ? `<img src="${theme.tenant.logoUrl}" class="logo" />` : ''}
                <div class="success-icon">✓</div>
                <h1 class="title">${result.title}</h1>
              </div>
              
              <div class="content">
                <div class="amount-section">
                  <div class="label">Estado</div>
                  <div class="value" style="color: ${theme.tenant.mainColor};">Exitosa</div>
                  <div style="margin-top: 8px; font-size: 14px; color: #6b7280;">${result.message}</div>
                </div>
                
                <div class="details">
                  <div class="row">
                    <div class="label">Fecha</div>
                    <div class="value">${result.date || new Date().toLocaleDateString()}</div>
                  </div>
                  <div class="row">
                    <div class="label">Hora</div>
                    <div class="value">${new Date().toLocaleTimeString()}</div>
                  </div>
                  
                  ${result.receiptId ? `
                  <div style="margin-top: 24px; text-align: center;">
                    <div class="label">Comprobante</div>
                    <div class="receipt-id">${result.receiptId}</div>
                  </div>
                  ` : ''}
                </div>
              </div>
              
              <div class="footer">
                <p>Generado por ${theme.tenant.name}</p>
                <p>Este documento es un comprobante válido de su transacción.</p>
              </div>
            </div>
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
    <ThemedView style={styles.container} surface="level1">
      <View style={styles.content}>
        <Animated.View entering={ZoomIn.duration(500).springify().damping(15)}>
          <Icon size={80} color={color} strokeWidth={1.5} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200)} style={styles.textContainer}>
          <ThemedText type="title" style={{ color: theme.colors.text, textAlign: 'center' }}>
            {result.title}
          </ThemedText>
          <ThemedText style={{ color: theme.colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
            {result.message}
          </ThemedText>
          
          {result.receiptId && (
            <ThemedView style={styles.receiptContainer} surface="level2">
              <ThemedText type="defaultSemiBold">Comprobante:</ThemedText>
              <ThemedText style={{ fontFamily: 'monospace' }}>{result.receiptId}</ThemedText>
            </ThemedView>
          )}
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
    gap: 32,
  },
  textContainer: {
    alignItems: 'center',
    width: '100%',
  },
  receiptContainer: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  footer: {
    gap: 12,
    paddingBottom: 24,
  },
  button: {
    height: 50,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  }
});
