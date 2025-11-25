import { CreditCard } from '@/components/cards/credit-card';
import { CardOperationHeader } from '@/components/cards/operations/card-operation-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FinancialIcons } from '@/components/ui/financial-icons';
import { PoweredBy } from '@/components/ui/powered-by';
import { AppTheme, useAppTheme } from '@/hooks/use-app-theme';
import { useCards } from '@/hooks/use-cards';
import type { Card } from '@/repositories';
import { getLogoHtmlForPdf } from '@/utils/image-to-base64';
import { loggers } from '@/utils/logger';
import { cacheDirectory, moveAsync } from 'expo-file-system/legacy';
import { printToFileAsync } from 'expo-print';
import { useLocalSearchParams } from 'expo-router';
import { shareAsync } from 'expo-sharing';
import { ArrowDownToLine, Calendar, Check, ChevronDown } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Mock Data
type TransactionType = 'purchase' | 'payment' | 'transfer' | 'fee';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
}

const MOCK_TRANSACTIONS: Transaction[] = Array.from({ length: 50 }).map((_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - i);
  const types: TransactionType[] = ['purchase', 'purchase', 'purchase', 'payment', 'transfer'];
  const type = types[Math.floor(Math.random() * types.length)];
  
  return {
    id: `tx-${i}`,
    date: date.toISOString().split('T')[0],
    description: type === 'payment' ? 'Pago de Tarjeta' : `Comercio Ejemplo ${i}`,
    amount: type === 'payment' ? Math.random() * 500 : Math.random() * 100,
    type,
    category: type === 'payment' ? 'financial' : 'shopping',
  };
});

const DATE_RANGES = [
  { id: '30', label: 'Últimos 30 días' },
  { id: '60', label: 'Últimos 60 días' },
  { id: '90', label: 'Últimos 90 días' },
  { id: 'current', label: 'Mes Actual' },
  { id: 'last', label: 'Mes Anterior' },
];

export default function StatementsScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCardById } = useCards();
  const [card, setCard] = useState<Card | undefined>();
  const [isLoadingCard, setIsLoadingCard] = useState(true);

  useEffect(() => {
    if (id) {
      getCardById(id).then((fetchedCard) => {
        setCard(fetchedCard);
        setIsLoadingCard(false);
      });
    }
  }, [id, getCardById]);
  
  const [selectedRange, setSelectedRange] = useState(DATE_RANGES[0]);
  const [showRangeModal, setShowRangeModal] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'purchase' | 'payment'>('all');
  const [isExporting, setIsExporting] = useState(false);

  // Filter logic
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let startDate = new Date();
    
    if (selectedRange.id === '30') startDate.setDate(now.getDate() - 30);
    else if (selectedRange.id === '60') startDate.setDate(now.getDate() - 60);
    else if (selectedRange.id === '90') startDate.setDate(now.getDate() - 90);
    else if (selectedRange.id === 'current') startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    else if (selectedRange.id === 'last') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      now.setDate(0); // End of last month
    }

    return MOCK_TRANSACTIONS.filter(t => {
      const tDate = new Date(t.date);
      const dateMatch = tDate >= startDate && tDate <= now;
      
      if (!dateMatch) return false;
      
      if (filterType === 'all') return true;
      if (filterType === 'payment') return t.type === 'payment';
      if (filterType === 'purchase') return t.type !== 'payment';
      
      return true;
    });
  }, [selectedRange, filterType]);

  const handleExport = async () => {
    try {
      setIsExporting(true);

      // Calculate totals
      const totalPayments = filteredTransactions
        .filter(t => t.type === 'payment')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const totalPurchases = filteredTransactions
        .filter(t => t.type !== 'payment')
        .reduce((sum, t) => sum + t.amount, 0);

      const closingBalance = totalPurchases - totalPayments;

      // Convert logo to base64 for proper rendering in PDF
      const institutionLogoHtml = await getLogoHtmlForPdf(
        theme.tenant.logoUrl,
        theme.tenant.name,
        theme.tenant.mainColor,
        40
      );

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Estado de Cuenta</title>
            <style>
                :root {
                    --primary-color: ${theme.tenant.mainColor};
                    --text-dark: #000000;
                    --text-medium: #374151;
                    --text-light: #4B5563;
                    --bg-zebra: #F9FAFB;
                    --border-color: #E5E7EB;
                    --spacing-sm: 8px;
                    --spacing-md: 16px;
                    --spacing-lg: 32px;
                }

                body {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    color: var(--text-dark);
                    line-height: 1.5;
                    margin: 0;
                    padding: 0;
                    background: #f0f0f0;
                }

                /* Fixed Header/Footer Styles */
                .page-header, .page-header-space {
                    height: 100px;
                }
                .page-footer, .page-footer-space {
                    height: 50px;
                }

                .page-header {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    background: white;
                    z-index: 100;
                    border-bottom: 2px solid var(--primary-color);
                    padding: 20px 40px 10px; /* Match page margins */
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }

                .page-footer {
                    position: fixed;
                    bottom: 0;
                    width: 100%;
                    background: white;
                    border-top: 1px solid var(--border-color);
                    padding: 10px 0;
                    text-align: center;
                    font-size: 10px;
                    color: var(--text-light);
                }

                /* Main Layout Table */
                .layout-table {
                    width: 100%;
                    border: none;
                    border-collapse: collapse;
                }
                
                .layout-table thead {
                    display: table-header-group;
                }
                
                .layout-table tfoot {
                    display: table-footer-group;
                }

                .page-container {
                    background: white;
                    width: 100%;
                    max-width: 210mm;
                    margin: 0 auto;
                    padding: 0 40px; /* Horizontal padding only, vertical handled by spacers */
                    box-sizing: border-box;
                }

                .brand-logo {
                    font-size: 24px;
                    font-weight: 800;
                    color: var(--primary-color);
                    text-transform: uppercase;
                    letter-spacing: -0.5px;
                }

                .statement-info {
                    text-align: right;
                }

                .statement-info h1 {
                    margin: 0;
                    font-size: 24px;
                    font-weight: 300;
                    color: var(--text-medium);
                }

                .details-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: var(--spacing-lg);
                    margin-bottom: var(--spacing-lg);
                    margin-top: 20px;
                }

                .address-block h3 {
                    font-size: 12px;
                    text-transform: uppercase;
                    color: var(--text-light);
                    margin-bottom: var(--spacing-sm);
                    letter-spacing: 1px;
                }

                .address-block p {
                    margin: 0;
                    font-size: 14px;
                }

                .summary-section {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: var(--spacing-md);
                    background-color: var(--bg-zebra);
                    padding: var(--spacing-md);
                    border-radius: 8px;
                    margin-bottom: var(--spacing-lg);
                }

                .summary-card h4 {
                    margin: 0 0 4px 0;
                    font-size: 12px;
                    color: var(--text-medium);
                    font-weight: 500;
                }

                .summary-card .amount {
                    font-size: 18px;
                    font-weight: 700;
                    font-variant-numeric: tabular-nums;
                }

                .amount.positive { color: #047857; }
                .amount.negative { color: #B91C1C; }

                /* Transaction Table */
                .tx-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: var(--spacing-lg);
                    table-layout: fixed;
                }

                .tx-table th {
                    text-align: left;
                    font-size: 12px;
                    text-transform: uppercase;
                    color: var(--text-medium);
                    padding: var(--spacing-sm) 8px;
                    border-bottom: 1px solid var(--border-color);
                    font-weight: 700;
                    background-color: white; /* Ensure header covers content when scrolling/breaking */
                }

                .tx-table th.text-right { text-align: right; }

                .tx-table td {
                    padding: 10px 8px;
                    font-size: 13px;
                    border-bottom: 1px solid var(--border-color);
                    color: var(--text-dark);
                    word-wrap: break-word;
                }

                .tx-table tr:nth-child(even) {
                    background-color: var(--bg-zebra);
                }

                td.amount-col {
                    text-align: right;
                    font-family: 'Courier New', Courier, monospace;
                    font-variant-numeric: tabular-nums;
                    font-weight: 500;
                }
                
                .brand-text {
                    color: #4b5563;
                    font-size: 12px;
                    letter-spacing: 0.5px;
                    display: inline-flex;
                    align-items: baseline;
                    margin-left: 4px;
                }

                @media print {
                    thead { display: table-header-group; } 
                    tfoot { display: table-footer-group; }
                    body { margin: 0; }
                    .page-container { max-width: 100%; width: 100%; padding: 0 20px; }
                    .page-header { padding: 20px 20px 10px; }
                }
            </style>
        </head>
        <body>

        <!-- Fixed Header -->
        <div class="page-header">
            <div class="brand-logo">
                ${institutionLogoHtml}
            </div>
            <div class="statement-info">
                <h1>Estado de Cuenta</h1>
                <p style="margin: 5px 0 0; color: var(--text-medium); font-size: 14px;">
                    ${selectedRange.label}
                </p>
            </div>
        </div>

        <!-- Fixed Footer -->
        <div class="page-footer">
            <p>Este documento es un comprobante oficial emitido por ${theme.tenant.name}. Para dudas o aclaraciones contacte a soporte.</p>
            <div style="margin-top: 4px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                <span style="font-size: 10px; color: var(--text-light);">Powered by</span>
                <span style="font-size: 12px; letter-spacing: 0.5px; display: flex; align-items: baseline; color: var(--text-medium);">
                    <span style="font-weight: 300">Libélula</span><span style="font-weight: 700">Soft</span>
                </span>
                <svg width="16" height="16" viewBox="0 0 100 100" style="display: inline-block; vertical-align: middle;">
                    <defs>
                        <linearGradient id="dragonflyGradFooter" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                            <stop offset="0" stop-color="#10b981" stop-opacity="1" />
                            <stop offset="1" stop-color="#0ea5e9" stop-opacity="1" />
                        </linearGradient>
                    </defs>
                    <g>
                        <circle cx="65" cy="35" r="3" fill="url(#dragonflyGradFooter)" />
                        <path d="M65 38 L60 45" stroke="url(#dragonflyGradFooter)" stroke-width="2.5" stroke-linecap="round" />
                        <path d="M60 45 L40 75" stroke="url(#dragonflyGradFooter)" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="5, 2" />
                        <g stroke="url(#dragonflyGradFooter)" stroke-width="1.2" fill="none">
                            <path d="M62 40 C 50 25, 25 15, 20 25 C 18 30, 40 45, 62 40" />
                            <path d="M62 40 L 25 25" stroke-width="0.5" opacity="0.8" />
                            <path d="M55 35 L 30 30" stroke-width="0.5" opacity="0.6" />
                            <path d="M50 38 L 35 40" stroke-width="0.5" opacity="0.6" />
                            <path d="M60 45 C 50 50, 30 60, 25 55 C 22 50, 45 45, 60 45" />
                            <path d="M60 45 L 30 55" stroke-width="0.5" opacity="0.8" />
                            <path d="M50 48 L 35 52" stroke-width="0.5" opacity="0.6" />
                        </g>
                    </g>
                </svg>
            </div>
        </div>

        <!-- Main Layout Table for Repeating Headers/Footers -->
        <table class="layout-table">
            <thead>
                <tr><td><div class="page-header-space"></div></td></tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <div class="page-container">
                            <div class="details-grid">
                                <div class="address-block">
                                    <h3>Cliente</h3>
                                    <p><strong>Usuario Ejemplo</strong></p>
                                    <p>Av. Principal 123</p>
                                    <p>Ciudad, País</p>
                                    <p style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">
                                        <svg viewBox="0 0 200 160" width="30" height="24" style="display: inline-block;">
                                            <rect x="0" y="0" width="200" height="160" fill="#d4af37" rx="20" ry="20" />
                                            <path d="M60,0 L100,30 L140,0 M100,30 V45 M70,45 H130 V115 H70 V45 M100,115 V130 M60,160 L100,130 L140,160 M130,45 L145,35 H200 M130,80 H200 M130,115 L145,125 H200 M70,45 L55,35 H0 M70,80 H0 M70,115 L60,125 H0" fill="none" stroke="#8B7023" stroke-width="3"/>
                                        </svg>
                                        <span>Tarjeta: ${card?.cardNumber || '•••• •••• •••• 9010'}</span>
                                    </p>
                                </div>
                                <div class="address-block" style="text-align: right;">
                                    <h3>Emisor</h3>
                                    <p><strong>${theme.tenant.name} Financiera</strong></p>
                                    <p>Torre Corporativa, Piso 10</p>
                                    <p>soporte+${theme.tenant.slug}@libelulasoft.com</p>
                                    <p>Fecha de emisión: ${new Date().toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div class="summary-section">
                                <div class="summary-card">
                                    <h4>Total Pagos</h4>
                                    <div class="amount positive">+$${totalPayments.toFixed(2)}</div>
                                </div>
                                <div class="summary-card">
                                    <h4>Total Consumos</h4>
                                    <div class="amount negative">-$${totalPurchases.toFixed(2)}</div>
                                </div>
                                <div class="summary-card">
                                    <h4>Balance del Periodo</h4>
                                    <div class="amount" style="color: var(--primary-color);">$${closingBalance.toFixed(2)}</div>
                                </div>
                            </div>

                            <table class="tx-table">
                                <thead>
                                    <tr>
                                        <th style="width: 20%">Fecha</th>
                                        <th style="width: 50%">Descripción</th>
                                        <th style="width: 15%">Tipo</th>
                                        <th class="text-right" style="width: 15%">Monto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${filteredTransactions.map(t => `
                                        <tr>
                                            <td>${t.date}</td>
                                            <td>${t.description}</td>
                                            <td>${t.type === 'payment' ? 'Pago' : 'Consumo'}</td>
                                            <td class="amount-col ${t.type === 'payment' ? 'positive' : ''}">
                                                ${t.type === 'payment' ? '+' : '-'}$${t.amount.toFixed(2)}
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>
            </tbody>
            <tfoot>
                <tr><td><div class="page-footer-space"></div></td></tr>
            </tfoot>
        </table>

        </body>
        </html>
      `;

      const { uri } = await printToFileAsync({ html: htmlContent });

      // Rename file logic
      const fileName = `EstadoCuenta_${selectedRange.label.replace(/\s+/g, '')}_${new Date().toISOString().split('T')[0]}.pdf`;
      const newUri = (cacheDirectory || '') + fileName;

      await moveAsync({
        from: uri,
        to: newUri
      });

      await shareAsync(newUri, { UTI: '.pdf', mimeType: 'application/pdf' });
      
    } catch (error) {
      loggers.cards.error('Error generando estado de cuenta:', error);
      Alert.alert('Error', 'No se pudo generar el estado de cuenta');
    } finally {
      setIsExporting(false);
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isPayment = item.type === 'payment';
    const Icon = isPayment ? FinancialIcons.money : FinancialIcons.wallet;
    
    return (
      <View style={[styles.txItem, { borderBottomColor: theme.colors.borderSubtle }]}>
        <View style={[styles.iconBox, { backgroundColor: isPayment ? theme.colors.surfaceHigher : theme.colors.surface }]}>
          <Icon size={20} color={isPayment ? theme.tenant.mainColor : theme.colors.textSecondary} />
        </View>
        <View style={styles.txContent}>
          <ThemedText type="defaultSemiBold">{item.description}</ThemedText>
          <ThemedText style={styles.date}>{item.date}</ThemedText>
        </View>
        <ThemedText 
          type="defaultSemiBold" 
          style={{ color: isPayment ? '#4CAF50' : theme.colors.text }}
        >
          {isPayment ? '+' : '-'}${item.amount.toFixed(2)}
        </ThemedText>
      </View>
    );
  };

  function FilterChip({ label, selected, onPress, theme }: {
    label: string;
    selected: boolean;
    onPress: () => void;
    theme: AppTheme;
  }) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.chip,
          { 
            backgroundColor: selected ? theme.tenant.mainColor : 'transparent',
            borderColor: selected ? theme.tenant.mainColor : theme.colors.border,
          }
        ]}
      >
        <ThemedText style={{ color: selected ? '#FFF' : theme.colors.text, fontSize: 12, fontWeight: selected ? 'bold' : 'normal' }}>
          {label}
        </ThemedText>
      </TouchableOpacity>
    );
  }

  return (
    <ThemedView style={styles.container} surface="level1">
      <CardOperationHeader title="Estados de Cuenta" card={card} isModal />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
        <View style={{ alignItems: 'center', marginVertical: 16 }}>
            {card && <CreditCard card={card} width={300} />}
          </View>

          {/* Filters */}
          <View style={styles.filterContainer}>
            <View style={styles.filterRow}>
              <TouchableOpacity 
                style={[styles.filterButton, { borderColor: theme.colors.border }]}
                onPress={() => setShowRangeModal(true)}
              >
                <Calendar size={16} color={theme.colors.textSecondary} />
                <ThemedText>{selectedRange.label}</ThemedText>
                <ChevronDown size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1, marginLeft: 8 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <FilterChip 
                    label="Todos" 
                    selected={filterType === 'all'} 
                    onPress={() => setFilterType('all')} 
                    theme={theme}
                  />
                  <FilterChip 
                    label="Compras" 
                    selected={filterType === 'purchase'} 
                    onPress={() => setFilterType('purchase')} 
                    theme={theme}
                  />
                  <FilterChip 
                    label="Pagos" 
                    selected={filterType === 'payment'} 
                    onPress={() => setFilterType('payment')} 
                    theme={theme}
                  />
                </View>
              </ScrollView>
            </View>
            
            <View style={styles.statsContainer}>
              <ThemedText style={styles.statsLabel}>Movimientos: {filteredTransactions.length}</ThemedText>
            </View>
          </View>

          {/* List */}
          <View style={styles.listContent}>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map(item => (
                <View key={item.id}>
                  {renderTransaction({ item })}
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <ThemedText>No hay movimientos en este periodo</ThemedText>
              </View>
            )}
            <PoweredBy style={{ marginTop: 40 }} />
          </View>
      </ScrollView>

      {/* Export Button */}
      <View style={[styles.footer, { backgroundColor: theme.colors.surface, paddingBottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          style={[styles.exportButton, { backgroundColor: theme.tenant.mainColor }]}
          onPress={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <ArrowDownToLine size={20} color="#FFF" />
              <ThemedText style={styles.exportButtonText}>Exportar PDF</ThemedText>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Range Modal */}
      <Modal
        visible={showRangeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRangeModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowRangeModal(false)}>
          <Animated.View 
            entering={SlideInDown} 
            exiting={SlideOutDown}
            style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}
          >
            <ThemedText type="subtitle" style={styles.modalTitle}>Seleccionar Periodo</ThemedText>
            {DATE_RANGES.map(range => (
              <TouchableOpacity
                key={range.id}
                style={[
                  styles.rangeOption, 
                  { backgroundColor: selectedRange.id === range.id ? theme.colors.surfaceHigher : 'transparent' }
                ]}
                onPress={() => {
                  setSelectedRange(range);
                  setShowRangeModal(false);
                }}
              >
                <ThemedText style={{ fontWeight: selectedRange.id === range.id ? 'bold' : 'normal' }}>
                  {range.label}
                </ThemedText>
                {selectedRange.id === range.id && (
                  <Check size={20} color={theme.tenant.mainColor} />
                )}
              </TouchableOpacity>
            ))}
          </Animated.View>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  cardPreviewContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  cardPreview: {
    borderRadius: 16,
    padding: 20,
    height: 100,
    justifyContent: 'space-between',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  cardNumber: {
    color: '#FFF',
    fontSize: 18,
    letterSpacing: 2,
    fontWeight: 'bold',
  },
  cardName: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardExp: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  statsLabel: {
    opacity: 0.6,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexGrow: 1,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txContent: {
    flex: 1,
  },
  date: {
    fontSize: 12,
    opacity: 0.6,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  exportButton: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  exportButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
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
  rangeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
});
