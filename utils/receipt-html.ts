import { Card } from '@/features/cards/services/card-service';
import { OperationResult } from '@/features/cards/types/card-operations';
import { getLogoHtmlForPdf } from './image-to-base64';

interface ReceiptData {
  result: OperationResult;
  card?: Card;
  transactionDetails?: { label: string; value: string; isAmount?: boolean }[];
  theme: any; // Using any for theme to avoid complex type imports, but should be AppTheme
}

export const generateReceiptHtml = async ({ result, card, transactionDetails, theme }: ReceiptData) => {
  const isSuccess = result.success;
  const color = isSuccess ? '#4CAF50' : '#F44336';
  const iconBgColor = isSuccess ? '#E8F5E9' : '#FFEBEE';
  
  // Dragonfly Logo SVG
  const dragonflySvg = `
    <svg width="16" height="16" viewBox="0 0 100 100" style="display: inline-block; vertical-align: middle;">
      <defs>
        <linearGradient id="dragonflyGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#10b981" stop-opacity="1" />
          <stop offset="1" stop-color="#0ea5e9" stop-opacity="1" />
        </linearGradient>
      </defs>
      <g>
        <circle cx="65" cy="35" r="3" fill="url(#dragonflyGrad)" />
        <path d="M65 38 L60 45" stroke="url(#dragonflyGrad)" stroke-width="2.5" stroke-linecap="round" />
        <path d="M60 45 L40 75" stroke="url(#dragonflyGrad)" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="5, 2" />
        <g stroke="url(#dragonflyGrad)" stroke-width="1.2" fill="none">
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
  `;

  // Convert logo to base64 for proper rendering in PDF
  const logoHtml = await getLogoHtmlForPdf(
    theme.tenant.logoUrl,
    theme.tenant.name,
    theme.tenant.mainColor,
    32
  );

  const detailsHtml = transactionDetails?.map(detail => `
    <div style="display: flex; justify-content: space-between; margin-bottom: 4px; border-bottom: 1px solid #f3f4f6; padding-bottom: 3px;">
      <span style="color: #4b5563; font-size: 12px;">${detail.label}</span>
      <span style="font-weight: ${detail.isAmount ? '700' : '500'}; font-size: ${detail.isAmount ? '16px' : '12px'}; color: ${detail.isAmount ? theme.tenant.mainColor : '#111827'};">
        ${detail.value}
      </span>
    </div>
  `).join('') || '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
            background-color: #f3f4f6; 
            margin: 0; 
            padding: 20px; 
            display: flex; 
            justify-content: center; 
            color: #374151;
          }
          .receipt { 
            background-color: white; 
            width: 100%; 
            max-width: 360px; 
            border-radius: 16px; 
            overflow: hidden; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.05); 
            position: relative;
          }
          .header { 
            padding: 16px 14px 10px; 
            text-align: center; 
            position: relative;
          }
          .receipt-label {
            font-size: 10px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 3px;
          }
          
          /* Dashed Divider with Cutouts */
          .divider-container {
            height: 16px;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          .divider-line {
            width: 100%;
            height: 1px;
            border-top: 1px dashed #e5e7eb;
            margin: 0 20px;
          }
          .cutout {
            position: absolute;
            top: 0;
            width: 16px;
            height: 16px;
            background-color: #f3f4f6;
            border-radius: 50%;
          }
          .cutout-left { left: -8px; }
          .cutout-right { right: -8px; }

          .content { 
            padding: 14px 14px 4px; 
          }
          .title-row {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
          }
          .status-icon {
            width: 44px;
            height: 44px;
            background-color: ${iconBgColor};
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-shrink: 0;
          }
          .title-text-container {
            flex: 1;
            text-align: left;
          }
          .title { 
            font-size: 16px; 
            font-weight: 600; 
            margin-bottom: 2px; 
            color: #111827; 
          }
          .message { 
            font-size: 12px; 
            color: #374151; 
            line-height: 1.4; 
          }
          .details { 
            margin-bottom: 10px; 
          }
          .footer {
            background-color: #f9fafb;
            padding: 10px 10px 8px;
            text-align: center;
            border-top: 1px solid #f3f4f6;
          }
          .receipt-id {
            font-family: monospace;
            font-size: 10px;
            color: #6b7280;
            margin-bottom: 1px;
          }
          .date {
            font-size: 9px;
            color: #6b7280;
            margin-bottom: 4px;
          }
          .powered-by {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            font-size: 8px;
            color: #9ca3af;
            margin-top: 0;
          }
          .brand-text {
            color: #4b5563;
            font-size: 12px;
            letter-spacing: 0.5px;
            display: flex;
            align-items: baseline;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            ${logoHtml}
            <div class="receipt-label">Comprobante de Transacción</div>
          </div>
          
          <div class="divider-container">
            <div class="cutout cutout-left"></div>
            <div class="divider-line"></div>
            <div class="cutout cutout-right"></div>
          </div>
          
          <div class="content">
            <div class="title-row">
              <div class="status-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  ${isSuccess ? '<polyline points="20 6 9 17 4 12"></polyline>' : '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>'}
                </svg>
              </div>
              <div class="title-text-container">
                <div class="title">${result.title}</div>
                <div class="message">${result.message}</div>
              </div>
            </div>
            
            <div class="details">
              ${detailsHtml}
            </div>
          </div>

          <div class="footer">
            ${result.receiptId ? `<div class="receipt-id">ID: ${result.receiptId}</div>` : ''}
            <div class="date">
              ${new Date().toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}
            </div>
            
            <div class="powered-by">
              <span>Powered by</span>
              <span class="brand-text">
                <span style="font-weight: 300">Libélula</span><span style="font-weight: 700">Soft</span>
              </span>
              ${dragonflySvg}
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};
