import { ThemedText } from '@/components/themed-text';
import { DragonflyLogo } from '@/components/ui/dragonfly-logo';
import { OperationResult } from '@/repositories';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { Card } from '@/repositories';
import { Image } from 'expo-image';
import { Check, XCircle } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ReceiptViewProps {
  result: OperationResult;
  card?: Card;
  transactionDetails?: { label: string; value: string; isAmount?: boolean }[];
  children?: React.ReactNode;
}

export function ReceiptView({ result, card: _card, transactionDetails, children }: ReceiptViewProps) {
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
    <View style={[styles.receiptCard, { 
      backgroundColor: theme.colors.surface,
      shadowColor: theme.colors.shadow,
      borderWidth: theme.isDark ? 1 : 0,
      borderColor: theme.isDark ? theme.colors.border : 'transparent',
    }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.institutionLogoContainer}>
          {theme.tenant.logoUrl ? (
            <Image 
              source={{ uri: theme.tenant.logoUrl }} 
              style={styles.logo} 
              contentFit="contain"
              recyclingKey={`tenant-logo-${theme.tenant.logoUrl}`}
              cachePolicy="memory-disk"
            />
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
        <View style={styles.titleRow}>
          <View style={[styles.iconBubble, { backgroundColor: iconBgColor }]}>
            <Icon size={24} color={color} strokeWidth={3} />
          </View>
          <View style={styles.titleTextContainer}>
            <ThemedText type="title" style={styles.title}>{result.title}</ThemedText>
            <ThemedText style={[styles.message, { color: secondaryTextColor }]}>{result.message}</ThemedText>
          </View>
        </View>

        {transactionDetails && (
          <View style={styles.detailsContainer}>
            {transactionDetails.map((detail, index) => (
              <View key={detail.label} style={[styles.detailRow, { borderBottomColor: theme.colors.border }]}>
                <ThemedText style={[styles.detailLabel, { color: secondaryTextColor }]}>{detail.label}</ThemedText>
                <ThemedText 
                  type={detail.isAmount ? 'defaultSemiBold' : 'default'} 
                  style={[
                    styles.detailValue, 
                    detail.isAmount && { color: theme.tenant.mainColor, fontSize: 16, fontWeight: '700' }
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
      <View style={[styles.footer, { 
        borderTopColor: theme.colors.border, 
        backgroundColor: theme.isDark ? 'rgba(0, 0, 0, 0.2)' : theme.colors.surfaceHigher 
      }]}>
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
    paddingTop: 16,
    paddingBottom: 10,
    paddingHorizontal: 14,
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  institutionLogoContainer: {
    height: 24,
    justifyContent: 'center',
    marginBottom: 3,
  },
  logo: {
    width: 80,
    height: 24,
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
    padding: 14,
    paddingTop: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  titleTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
    lineHeight: 16,
  },
  detailsContainer: {
    gap: 4,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 3,
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
    padding: 10,
    paddingBottom: 8,
    alignItems: 'center',
    borderTopWidth: 1,
  },
  receiptId: {
    fontFamily: 'monospace',
    fontSize: 10,
    marginBottom: 1,
  },
  date: {
    fontSize: 9,
    marginBottom: 4,
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
