import { AppTheme, useAppTheme } from '@/hooks/use-app-theme';
import { getLogoHtmlForPdf } from '@/utils/image-to-base64';
import { loggers } from '@/utils/logger';
import { cacheDirectory, moveAsync } from 'expo-file-system/legacy';
import { printToFileAsync } from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

interface TransactionWithType {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'purchase' | 'payment' | 'transfer' | 'fee';
}

interface ExportOptions {
  rangeLabel: string;
  cardNumber?: string;
  transactions: TransactionWithType[];
}

export function useStatementExport() {
  const theme = useAppTheme();
  const [isExporting, setIsExporting] = useState(false);

  const exportToPdf = useCallback(async ({ rangeLabel, cardNumber, transactions }: ExportOptions) => {
    try {
      setIsExporting(true);

      const totalPayments = transactions.filter(t => t.type === 'payment').reduce((sum, t) => sum + t.amount, 0);
      const totalPurchases = transactions.filter(t => t.type !== 'payment').reduce((sum, t) => sum + t.amount, 0);
      const closingBalance = totalPurchases - totalPayments;

      const institutionLogoHtml = await getLogoHtmlForPdf(theme.tenant.logoUrl, theme.tenant.name, theme.tenant.mainColor, 40);

      const htmlContent = generateHtmlContent({ theme, rangeLabel, cardNumber, transactions, totalPayments, totalPurchases, closingBalance, institutionLogoHtml });

      const { uri } = await printToFileAsync({ html: htmlContent });
      const fileName = `EstadoCuenta_${rangeLabel.replace(/\s+/g, '')}_${new Date().toISOString().split('T')[0]}.pdf`;
      const newUri = (cacheDirectory || '') + fileName;
      await moveAsync({ from: uri, to: newUri });
      await shareAsync(newUri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      loggers.cards.error('Error generando estado de cuenta:', error);
      Alert.alert('Error', 'No se pudo generar el estado de cuenta');
    } finally {
      setIsExporting(false);
    }
  }, [theme]);

  return { isExporting, exportToPdf };
}

interface GenerateHtmlParams {
  theme: AppTheme;
  rangeLabel: string;
  cardNumber?: string;
  transactions: TransactionWithType[];
  totalPayments: number;
  totalPurchases: number;
  closingBalance: number;
  institutionLogoHtml: string;
}

function generateHtmlContent({ theme, rangeLabel, cardNumber, transactions, totalPayments, totalPurchases, closingBalance, institutionLogoHtml }: GenerateHtmlParams): string {
  const transactionRows = transactions.map(t => `
    <tr>
      <td>${t.date}</td>
      <td>${t.description}</td>
      <td>${t.type === 'payment' ? 'Pago' : 'Consumo'}</td>
      <td class="amount-col ${t.type === 'payment' ? 'positive' : ''}">${t.type === 'payment' ? '+' : '-'}$${t.amount.toFixed(2)}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Estado de Cuenta</title>
  <style>
    :root { --primary-color: ${theme.tenant.mainColor}; --text-dark: #000000; --text-medium: #374151; --text-light: #4B5563; --bg-zebra: #F9FAFB; --border-color: #E5E7EB; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: var(--text-dark); line-height: 1.5; margin: 0; padding: 0; background: #f0f0f0; }
    .page-header, .page-header-space { height: 100px; }
    .page-footer, .page-footer-space { height: 50px; }
    .page-header { position: fixed; top: 0; left: 0; right: 0; background: white; z-index: 100; border-bottom: 2px solid var(--primary-color); padding: 20px 40px 10px; display: flex; justify-content: space-between; align-items: flex-start; }
    .page-footer { position: fixed; bottom: 0; width: 100%; background: white; border-top: 1px solid var(--border-color); padding: 10px 0; text-align: center; font-size: 10px; color: var(--text-light); }
    .layout-table { width: 100%; border: none; border-collapse: collapse; }
    .layout-table thead { display: table-header-group; }
    .layout-table tfoot { display: table-footer-group; }
    .page-container { background: white; width: 100%; max-width: 210mm; margin: 0 auto; padding: 0 40px; box-sizing: border-box; }
    .brand-logo { font-size: 24px; font-weight: 800; color: var(--primary-color); text-transform: uppercase; letter-spacing: -0.5px; }
    .statement-info { text-align: right; }
    .statement-info h1 { margin: 0; font-size: 24px; font-weight: 300; color: var(--text-medium); }
    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-bottom: 32px; margin-top: 20px; }
    .address-block h3 { font-size: 12px; text-transform: uppercase; color: var(--text-light); margin-bottom: 8px; letter-spacing: 1px; }
    .address-block p { margin: 0; font-size: 14px; }
    .summary-section { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; background-color: var(--bg-zebra); padding: 16px; border-radius: 8px; margin-bottom: 32px; }
    .summary-card h4 { margin: 0 0 4px 0; font-size: 12px; color: var(--text-medium); font-weight: 500; }
    .summary-card .amount { font-size: 18px; font-weight: 700; font-variant-numeric: tabular-nums; }
    .amount.positive { color: #047857; }
    .amount.negative { color: #B91C1C; }
    .tx-table { width: 100%; border-collapse: collapse; margin-bottom: 32px; table-layout: fixed; }
    .tx-table th { text-align: left; font-size: 12px; text-transform: uppercase; color: var(--text-medium); padding: 8px; border-bottom: 1px solid var(--border-color); font-weight: 700; background-color: white; }
    .tx-table th.text-right { text-align: right; }
    .tx-table td { padding: 10px 8px; font-size: 13px; border-bottom: 1px solid var(--border-color); color: var(--text-dark); word-wrap: break-word; }
    .tx-table tr:nth-child(even) { background-color: var(--bg-zebra); }
    td.amount-col { text-align: right; font-family: 'Courier New', Courier, monospace; font-variant-numeric: tabular-nums; font-weight: 500; }
    @media print { thead { display: table-header-group; } tfoot { display: table-footer-group; } body { margin: 0; } .page-container { max-width: 100%; width: 100%; padding: 0 20px; } .page-header { padding: 20px 20px 10px; } }
  </style>
</head>
<body>
  <div class="page-header">
    <div class="brand-logo">${institutionLogoHtml}</div>
    <div class="statement-info">
      <h1>Estado de Cuenta</h1>
      <p style="margin: 5px 0 0; color: var(--text-medium); font-size: 14px;">${rangeLabel}</p>
    </div>
  </div>
  <div class="page-footer">
    <p>Este documento es un comprobante oficial emitido por ${theme.tenant.name}. Para dudas o aclaraciones contacte a soporte.</p>
    <div style="margin-top: 4px; display: flex; align-items: center; justify-content: center; gap: 6px;">
      <span style="font-size: 10px; color: var(--text-light);">Powered by</span>
      <span style="font-size: 12px; letter-spacing: 0.5px; display: flex; align-items: baseline; color: var(--text-medium);"><span style="font-weight: 300">Libélula</span><span style="font-weight: 700">Soft</span></span>
    </div>
  </div>

  <table class="layout-table">
    <thead><tr><td><div class="page-header-space"></div></td></tr></thead>
    <tbody>
      <tr><td>
        <div class="page-container">
          <div class="details-grid">
            <div class="address-block">
              <h3>Cliente</h3>
              <p><strong>Usuario Ejemplo</strong></p>
              <p>Av. Principal 123</p>
              <p>Ciudad, País</p>
              <p style="margin-top: 8px;">Tarjeta: ${cardNumber || '•••• •••• •••• 9010'}</p>
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
            <div class="summary-card"><h4>Total Pagos</h4><div class="amount positive">+$${totalPayments.toFixed(2)}</div></div>
            <div class="summary-card"><h4>Total Consumos</h4><div class="amount negative">-$${totalPurchases.toFixed(2)}</div></div>
            <div class="summary-card"><h4>Balance del Periodo</h4><div class="amount" style="color: var(--primary-color);">$${closingBalance.toFixed(2)}</div></div>
          </div>
          <table class="tx-table">
            <thead><tr><th style="width: 20%">Fecha</th><th style="width: 50%">Descripción</th><th style="width: 15%">Tipo</th><th class="text-right" style="width: 15%">Monto</th></tr></thead>
            <tbody>${transactionRows}</tbody>
          </table>
        </div>
      </td></tr>
    </tbody>
    <tfoot><tr><td><div class="page-footer-space"></div></td></tr></tfoot>
  </table>
</body>
</html>`;
}
