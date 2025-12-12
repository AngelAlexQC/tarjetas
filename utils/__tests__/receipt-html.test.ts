import { generateReceiptHtml } from '../receipt-html';
import { OperationResult } from '@/repositories';
import { AppTheme } from '@/hooks/use-app-theme';
import * as imageToBase64 from '../image-to-base64';

describe('receipt-html', () => {
  const mockTheme: AppTheme = {
    tenant: {
      id: 'test-tenant',
      name: 'Test Bank',
      mainColor: '#FF0000',
      logoUrl: 'https://example.com/logo.png',
      subdomains: ['test'],
    },
    colors: {
      primary: '#FF0000',
      secondary: '#00FF00',
      background: '#FFFFFF',
      text: '#000000',
      error: '#F44336',
      success: '#4CAF50',
      warning: '#FFC107',
      info: '#2196F3',
      surface: '#F5F5F5',
      surfaceVariant: '#EEEEEE',
      outline: '#CCCCCC',
      onPrimary: '#FFFFFF',
      onSecondary: '#FFFFFF',
      onBackground: '#000000',
      onSurface: '#000000',
      onError: '#FFFFFF',
    },
    isDark: false,
  };

  const mockSuccessResult: OperationResult = {
    success: true,
    message: 'Operation successful',
    operationId: 'OP123',
    timestamp: '2025-12-12T10:00:00Z',
    amount: 100,
    currency: 'USD',
  };

  const mockFailureResult: OperationResult = {
    success: false,
    message: 'Operation failed',
    operationId: 'OP124',
    timestamp: '2025-12-12T10:00:00Z',
    errorCode: 'INSUFFICIENT_FUNDS',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(imageToBase64, 'getLogoHtmlForPdf').mockResolvedValue('<img src="test-logo" />');
  });

  describe('generateReceiptHtml', () => {
    it('should generate HTML for successful operation', async () => {
      const html = await generateReceiptHtml({
        result: mockSuccessResult,
        theme: mockTheme,
      });

      expect(html).toContain('Operation successful');
      expect(html).toContain('#4CAF50'); // Success color
      expect(html).toContain('OP123');
      expect(imageToBase64.getLogoHtmlForPdf).toHaveBeenCalledWith(
        'https://example.com/logo.png',
        'Test Bank',
        '#FF0000',
        32
      );
    });

    it('should generate HTML for failed operation', async () => {
      const html = await generateReceiptHtml({
        result: mockFailureResult,
        theme: mockTheme,
      });

      expect(html).toContain('Operation failed');
      expect(html).toContain('#F44336'); // Error color
      expect(html).toContain('OP124');
    });

    it('should include transaction details when provided', async () => {
      const transactionDetails = [
        { label: 'Amount', value: '$100.00', isAmount: true },
        { label: 'Fee', value: '$2.00' },
        { label: 'Total', value: '$102.00', isAmount: true },
      ];

      const html = await generateReceiptHtml({
        result: mockSuccessResult,
        theme: mockTheme,
        transactionDetails,
      });

      expect(html).toContain('Amount');
      expect(html).toContain('$100.00');
      expect(html).toContain('Fee');
      expect(html).toContain('$2.00');
      expect(html).toContain('Total');
      expect(html).toContain('$102.00');
    });

    it('should style amount fields differently', async () => {
      const transactionDetails = [
        { label: 'Amount', value: '$100.00', isAmount: true },
        { label: 'Description', value: 'Test transaction' },
      ];

      const html = await generateReceiptHtml({
        result: mockSuccessResult,
        theme: mockTheme,
        transactionDetails,
      });

      // Amount should have bold font and larger size
      expect(html).toContain('font-weight: 700');
      expect(html).toContain('font-size: 16px');
      // Non-amount should have normal weight and smaller size
      expect(html).toContain('font-weight: 500');
      expect(html).toContain('font-size: 12px');
    });

    it('should include Dragonfly logo SVG', async () => {
      const html = await generateReceiptHtml({
        result: mockSuccessResult,
        theme: mockTheme,
      });

      expect(html).toContain('dragonflyGrad');
      expect(html).toContain('svg');
      expect(html).toContain('linearGradient');
    });

    it('should use theme main color for styling', async () => {
      const html = await generateReceiptHtml({
        result: mockSuccessResult,
        theme: mockTheme,
        transactionDetails: [
          { label: 'Amount', value: '$100.00', isAmount: true },
        ],
      });

      expect(html).toContain('#FF0000'); // Theme main color
    });

    it('should handle empty transaction details', async () => {
      const html = await generateReceiptHtml({
        result: mockSuccessResult,
        theme: mockTheme,
        transactionDetails: [],
      });

      expect(html).toBeDefined();
      expect(html).toContain('Operation successful');
    });

    it('should format timestamp correctly', async () => {
      const html = await generateReceiptHtml({
        result: mockSuccessResult,
        theme: mockTheme,
      });

      expect(html).toContain('2025-12-12T10:00:00Z');
    });

    it('should include operation ID in receipt', async () => {
      const html = await generateReceiptHtml({
        result: mockSuccessResult,
        theme: mockTheme,
      });

      expect(html).toContain('OP123');
    });
  });
});
