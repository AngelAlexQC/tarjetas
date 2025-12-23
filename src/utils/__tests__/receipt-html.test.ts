import * as imageToBase64 from '../image-to-base64';
import { generateReceiptHtml } from '../receipt-html';

jest.mock('../image-to-base64');

describe('generateReceiptHtml', () => {
  const mockTheme = {
    tenant: {
      name: 'Test Bank',
      mainColor: '#FF0000',
      logoUrl: 'https://example.com/logo.png',
    },
  };

  const mockCard = {
    id: '123',
    cardNumber: '**** **** **** 1234',
    cardHolder: 'Test User',
    expiryDate: '12/25',
    balance: 1000,
    lastFourDigits: '1234',
    type: 'credit' as const,
    cardType: 'credit' as const,
    cardBrand: 'visa' as const,
    status: 'active' as const,
    creditLimit: 5000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (imageToBase64.getLogoHtmlForPdf as jest.Mock).mockResolvedValue('<div>Logo</div>');
  });

  it('should generate HTML for successful operation', async () => {
    const result = {
      success: true,
      title: 'Success',
      message: 'Operation successful',
      data: { transactionId: 'TXN123' },
    };

    const html = await generateReceiptHtml({
      result,
      card: mockCard,
      theme: mockTheme as any,
    });

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html>');
    expect(html).toContain('</html>');
    expect(html).toContain('#4CAF50'); // Success color
  });

  it('should generate HTML for failed operation', async () => {
    const result = {
      success: false,
      title: 'Error',
      message: 'Operation failed',
      error: 'Error message',
    };

    const html = await generateReceiptHtml({
      result,
      theme: mockTheme as any,
    });

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('#F44336'); // Error color
  });

  it('should include transaction details when provided', async () => {
    const result = {
      success: true,
      title: 'Payment',
      message: 'Payment successful',
    };

    const transactionDetails = [
      { label: 'Amount', value: '$100.00', isAmount: true },
      { label: 'Date', value: '2025-12-12' },
      { label: 'Reference', value: 'REF123' },
    ];

    const html = await generateReceiptHtml({
      result,
      transactionDetails,
      theme: mockTheme as any,
    });

    expect(html).toContain('Amount');
    expect(html).toContain('$100.00');
    expect(html).toContain('Date');
    expect(html).toContain('2025-12-12');
    expect(html).toContain('Reference');
    expect(html).toContain('REF123');
  });

  it('should call getLogoHtmlForPdf with correct parameters', async () => {
    const result = {
      success: true,
      title: 'Success',
      message: 'Success',
    };

    await generateReceiptHtml({
      result,
      theme: mockTheme as any,
    });

    expect(imageToBase64.getLogoHtmlForPdf).toHaveBeenCalledWith(
      'https://example.com/logo.png',
      'Test Bank',
      '#FF0000',
      32
    );
  });

  it('should handle missing card information', async () => {
    const result = {
      success: true,
      title: 'Success',
      message: 'Success',
    };

    const html = await generateReceiptHtml({
      result,
      theme: mockTheme as any,
    });

    expect(html).toContain('<!DOCTYPE html>');
  });

  it('should handle empty transaction details', async () => {
    const result = {
      success: true,
      title: 'Success',
      message: 'Success',
    };

    const html = await generateReceiptHtml({
      result,
      transactionDetails: [],
      theme: mockTheme as any,
    });

    expect(html).toContain('<!DOCTYPE html>');
  });

  it('should include dragonfly SVG logo', async () => {
    const result = {
      success: true,
      title: 'Success',
      message: 'Success',
    };

    const html = await generateReceiptHtml({
      result,
      theme: mockTheme as any,
    });

    expect(html).toContain('dragonflyGrad');
    expect(html).toContain('<svg');
  });

  it('should style amount fields differently', async () => {
    const result = {
      success: true,
      title: 'Success',
      message: 'Success',
    };

    const transactionDetails = [
      { label: 'Total', value: '$500.00', isAmount: true },
      { label: 'Note', value: 'Test note', isAmount: false },
    ];

    const html = await generateReceiptHtml({
      result,
      transactionDetails,
      theme: mockTheme as any,
    });

    expect(html).toContain('font-weight: 700'); // Bold for amounts
    expect(html).toContain('font-weight: 500'); // Regular for non-amounts
  });
});
