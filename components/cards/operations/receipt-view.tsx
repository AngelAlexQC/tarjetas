import { ThemedText } from '@/components/themed-text';
import { DragonflyLogo } from '@/components/ui/dragonfly-logo';
import { Card } from '@/features/cards/services/card-service';
import { OperationResult } from '@/features/cards/types/card-operations';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Check, XCircle } from 'lucide-react-native';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

interface ReceiptViewProps {
  result: OperationResult;
  card?: Card;
  transactionDetails?: { label: string; value: string; isAmount?: boolean }[];
  children?: React.ReactNode;
}

export function ReceiptView({ result, card, transactionDetails, children }: ReceiptViewProps) {
  const theme = useAppTheme();
  const isSuccess = result.success;
  const Icon = isSuccess ? Check : XCircle;
  const color = isSuccess ? '#4CAF50' : '#F44336';
  const iconBgColor = isSuccess 
    ? (theme.isDark ? 'rgba(76, 175, 80, 0.15)' : '#E8F5E9') 
    : (theme.isDark ? 'rgba(244, 67, 54, 0.15)' : '#FFEBEE');

  // Colores de texto con mejor contraste para modo claro
  // Usamos tonos mucho más oscuros para garantizar legibilidad sobre fondo blanco
  const secondaryTextColor = theme.isDark ? theme.colors.textSecondary : '#374151'; // Gray 700
  const tertiaryTextColor = theme.isDark ? theme.colors.textSecondary : '#6B7280'; // Gray 500

  return (
    <View style={[styles.receiptCard, { backgroundColor: theme.colors.surface }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconBubble, { backgroundColor: iconBgColor }]}>
          <Icon size={32} color={color} strokeWidth={3} />
        </View>
        
        <View style={styles.institutionLogoContainer}>
          {theme.tenant.logoUrl ? (
            <Image source={{ uri: theme.tenant.logoUrl }} style={styles.logo} resizeMode="contain" />
          ) : (
            <ThemedText type="title" style={{ color: theme.tenant.mainColor }}>{theme.tenant.name}</ThemedText>
          )}
        </View>
        <ThemedText style={[styles.receiptLabel, { color: tertiaryTextColor }]}>Comprobante de Transacción</ThemedText>
      </View>

      {/* Divider */}
      <View style={styles.dashedDivider}>
        <View style={[styles.halfCircle, styles.halfCircleLeft, { backgroundColor: theme.colors.background }]} />
        <View style={[styles.dashLine, { borderColor: theme.colors.border }]} />
        <View style={[styles.halfCircle, styles.halfCircleRight, { backgroundColor: theme.colors.background }]} />
      </View>

      {/* Body */}
      <View style={styles.body}>
        <ThemedText type="title" style={styles.title}>{result.title}</ThemedText>
        <ThemedText style={[styles.message, { color: secondaryTextColor }]}>{result.message}</ThemedText>

        {transactionDetails && (
          <View style={styles.detailsContainer}>
            {transactionDetails.map((detail, index) => (
              <View key={index} style={[styles.detailRow, { borderBottomColor: theme.colors.border }]}>
                <ThemedText style={[styles.detailLabel, { color: secondaryTextColor }]}>{detail.label}</ThemedText>
                <ThemedText 
                  type={detail.isAmount ? 'defaultSemiBold' : 'default'} 
                  style={[
                    styles.detailValue, 
                    detail.isAmount && { color: theme.tenant.mainColor, fontSize: 16 }
                  ]}
                >
                  {detail.value}
                </ThemedText>
              </View>
            ))}
          </View>
        )}

        {children}
      </View>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.surfaceHigher }]}>
        {result.receiptId && (
          <ThemedText style={[styles.receiptId, { color: tertiaryTextColor }]}>ID: {result.receiptId}</ThemedText>
        )}
        <ThemedText style={[styles.date, { color: tertiaryTextColor }]}>
          {new Date().toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}
        </ThemedText>
        
        <View style={styles.poweredBy}>
          <ThemedText style={[styles.poweredByText, { color: tertiaryTextColor }]}>Powered by</ThemedText>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <ThemedText style={{ fontSize: 10, color: secondaryTextColor, fontWeight: '300' }}>Libélula</ThemedText>
            <ThemedText style={{ fontSize: 10, color: secondaryTextColor, fontWeight: '700' }}>Soft</ThemedText>
          </View>
          <DragonflyLogo width={16} height={16} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  receiptCard: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  institutionLogoContainer: {
    height: 28,
    justifyContent: 'center',
    marginBottom: 4,
  },
  logo: {
    width: 90,
    height: 28,
  },
  receiptLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dashedDivider: {
    height: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dashLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 1,
    marginHorizontal: 16,
    opacity: 0.3,
  },
  halfCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    top: 0,
  },
  halfCircleLeft: {
    left: -6,
  },
  halfCircleRight: {
    right: -6,
  },
  body: {
    padding: 16,
    paddingTop: 4,
  },
  title: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
  },
  message: {
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 12,
    lineHeight: 16,
  },
  detailsContainer: {
    gap: 6,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 4,
    borderBottomWidth: 1,
  },
  detailLabel: {
    fontSize: 12,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardInfo: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardNumber: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  footer: {
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
  },
  receiptId: {
    fontFamily: 'monospace',
    fontSize: 10,
    marginBottom: 2,
  },
  date: {
    fontSize: 9,
    marginBottom: 6,
  },
  poweredBy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    opacity: 0.6,
  },
  poweredByText: {
    fontSize: 8,
  },
  poweredByBrand: {
    fontSize: 8,
    fontWeight: '600',
  },
});
