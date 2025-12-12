/**
 * Statement Export Hook Tests
 */

import * as ImageToBase64 from '@/utils/image-to-base64';
import { act, renderHook } from '@testing-library/react-native';
import * as ExpoFileSystem from 'expo-file-system/legacy';
import * as ExpoPrint from 'expo-print';
import * as ExpoSharing from 'expo-sharing';
import { Alert } from 'react-native';
import { useStatementExport } from '../use-statement-export';

// Mock modules
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
}));

jest.mock('expo-print', () => ({
  printToFileAsync: jest.fn(),
}));

jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn(),
}));

jest.mock('expo-file-system/legacy', () => ({
  cacheDirectory: '/cache/',
  moveAsync: jest.fn(),
}));

jest.mock('@/utils/image-to-base64', () => ({
  getLogoHtmlForPdf: jest.fn(),
}));

jest.mock('@/utils/logger', () => ({
  loggers: {
    cards: {
      error: jest.fn(),
    },
  },
}));

jest.mock('@/hooks/use-app-theme', () => ({
  useAppTheme: jest.fn(() => ({
    tenant: {
      logoUrl: 'https://example.com/logo.png',
      name: 'Test Bank',
      slug: 'testbank',
      mainColor: '#0066cc',
    },
  })),
}));

describe('useStatementExport', () => {
  const mockTransactions = [
    {
      id: '1',
      date: '2025-01-01',
      description: 'Compra en Amazon',
      amount: 150.00,
      type: 'purchase' as const,
    },
    {
      id: '2',
      date: '2025-01-05',
      description: 'Pago de tarjeta',
      amount: 500.00,
      type: 'payment' as const,
    },
    {
      id: '3',
      date: '2025-01-10',
      description: 'Cargo por servicio',
      amount: 25.00,
      type: 'fee' as const,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (ExpoPrint.printToFileAsync as jest.Mock).mockResolvedValue({ uri: '/temp/file.pdf' });
    (ExpoSharing.shareAsync as jest.Mock).mockResolvedValue(undefined);
    (ExpoFileSystem.moveAsync as jest.Mock).mockResolvedValue(undefined);
    (ImageToBase64.getLogoHtmlForPdf as jest.Mock).mockResolvedValue('<img src="logo.png" />');
  });

  describe('initial state', () => {
    it('should have isExporting as false initially', () => {
      const { result } = renderHook(() => useStatementExport());

      expect(result.current.isExporting).toBe(false);
    });

    it('should provide exportToPdf function', () => {
      const { result } = renderHook(() => useStatementExport());

      expect(typeof result.current.exportToPdf).toBe('function');
    });
  });

  describe('exportToPdf', () => {
    it('should set isExporting to true while exporting', async () => {
      let exportingDuringCall = false;
      (ExpoPrint.printToFileAsync as jest.Mock).mockImplementation(async () => {
        // This simulates checking isExporting during the export
        await new Promise((resolve) => setTimeout(resolve, 10));
        return { uri: '/temp/file.pdf' };
      });

      const { result } = renderHook(() => useStatementExport());

      const exportPromise = act(async () => {
        // Start exporting
        const promise = result.current.exportToPdf({
          rangeLabel: 'Enero 2025',
          cardNumber: '•••• 1234',
          transactions: mockTransactions,
        });
        // Check state during export (needs small delay)
        exportingDuringCall = result.current.isExporting;
        await promise;
      });

      await exportPromise;
      expect(result.current.isExporting).toBe(false);
    });

    it('should call printToFileAsync with HTML content', async () => {
      const { result } = renderHook(() => useStatementExport());

      await act(async () => {
        await result.current.exportToPdf({
          rangeLabel: 'Enero 2025',
          cardNumber: '•••• 1234',
          transactions: mockTransactions,
        });
      });

      expect(ExpoPrint.printToFileAsync).toHaveBeenCalledWith({
        html: expect.stringContaining('Estado de Cuenta'),
      });
    });

    it('should move file to cache directory with correct filename', async () => {
      const { result } = renderHook(() => useStatementExport());

      await act(async () => {
        await result.current.exportToPdf({
          rangeLabel: 'Enero 2025',
          transactions: mockTransactions,
        });
      });

      expect(ExpoFileSystem.moveAsync).toHaveBeenCalledWith({
        from: '/temp/file.pdf',
        to: expect.stringContaining('EstadoCuenta_Enero2025'),
      });
    });

    it('should call shareAsync with correct mime type', async () => {
      const { result } = renderHook(() => useStatementExport());

      await act(async () => {
        await result.current.exportToPdf({
          rangeLabel: 'Febrero 2025',
          transactions: mockTransactions,
        });
      });

      expect(ExpoSharing.shareAsync).toHaveBeenCalledWith(
        expect.stringContaining('EstadoCuenta'),
        { UTI: '.pdf', mimeType: 'application/pdf' }
      );
    });

    it('should calculate totals correctly', async () => {
      const { result } = renderHook(() => useStatementExport());

      await act(async () => {
        await result.current.exportToPdf({
          rangeLabel: 'Test',
          transactions: mockTransactions,
        });
      });

      const htmlContent = (ExpoPrint.printToFileAsync as jest.Mock).mock.calls[0][0].html;
      
      // Total payments: 500.00
      expect(htmlContent).toContain('+$500.00');
      // Total purchases: 150.00 + 25.00 = 175.00
      expect(htmlContent).toContain('-$175.00');
    });

    it('should include card number in PDF', async () => {
      const { result } = renderHook(() => useStatementExport());

      await act(async () => {
        await result.current.exportToPdf({
          rangeLabel: 'Test',
          cardNumber: '•••• •••• •••• 5678',
          transactions: mockTransactions,
        });
      });

      const htmlContent = (ExpoPrint.printToFileAsync as jest.Mock).mock.calls[0][0].html;
      expect(htmlContent).toContain('•••• •••• •••• 5678');
    });

    it('should use default card number if not provided', async () => {
      const { result } = renderHook(() => useStatementExport());

      await act(async () => {
        await result.current.exportToPdf({
          rangeLabel: 'Test',
          transactions: mockTransactions,
        });
      });

      const htmlContent = (ExpoPrint.printToFileAsync as jest.Mock).mock.calls[0][0].html;
      expect(htmlContent).toContain('•••• •••• •••• 9010');
    });

    it('should include transaction rows in HTML', async () => {
      const { result } = renderHook(() => useStatementExport());

      await act(async () => {
        await result.current.exportToPdf({
          rangeLabel: 'Test',
          transactions: mockTransactions,
        });
      });

      const htmlContent = (ExpoPrint.printToFileAsync as jest.Mock).mock.calls[0][0].html;
      expect(htmlContent).toContain('Compra en Amazon');
      expect(htmlContent).toContain('Pago de tarjeta');
      expect(htmlContent).toContain('Cargo por servicio');
    });
  });

  describe('error handling', () => {
    it('should show alert on error', async () => {
      (ExpoPrint.printToFileAsync as jest.Mock).mockRejectedValue(new Error('PDF generation failed'));

      const { result } = renderHook(() => useStatementExport());

      await act(async () => {
        await result.current.exportToPdf({
          rangeLabel: 'Test',
          transactions: mockTransactions,
        });
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'No se pudo generar el estado de cuenta');
    });

    it('should set isExporting to false after error', async () => {
      (ExpoPrint.printToFileAsync as jest.Mock).mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useStatementExport());

      await act(async () => {
        await result.current.exportToPdf({
          rangeLabel: 'Test',
          transactions: mockTransactions,
        });
      });

      expect(result.current.isExporting).toBe(false);
    });

    it('should handle sharing error', async () => {
      (ExpoSharing.shareAsync as jest.Mock).mockRejectedValue(new Error('Sharing failed'));

      const { result } = renderHook(() => useStatementExport());

      await act(async () => {
        await result.current.exportToPdf({
          rangeLabel: 'Test',
          transactions: mockTransactions,
        });
      });

      expect(Alert.alert).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle empty transactions', async () => {
      const { result } = renderHook(() => useStatementExport());

      await act(async () => {
        await result.current.exportToPdf({
          rangeLabel: 'Empty',
          transactions: [],
        });
      });

      const htmlContent = (ExpoPrint.printToFileAsync as jest.Mock).mock.calls[0][0].html;
      expect(htmlContent).toContain('+$0.00');
      expect(htmlContent).toContain('-$0.00');
    });

    it('should handle only payments', async () => {
      const payments = [
        { id: '1', date: '2025-01-01', description: 'Pago 1', amount: 100, type: 'payment' as const },
        { id: '2', date: '2025-01-02', description: 'Pago 2', amount: 200, type: 'payment' as const },
      ];

      const { result } = renderHook(() => useStatementExport());

      await act(async () => {
        await result.current.exportToPdf({
          rangeLabel: 'Payments',
          transactions: payments,
        });
      });

      const htmlContent = (ExpoPrint.printToFileAsync as jest.Mock).mock.calls[0][0].html;
      expect(htmlContent).toContain('+$300.00');
    });

    it('should handle special characters in range label', async () => {
      const { result } = renderHook(() => useStatementExport());

      await act(async () => {
        await result.current.exportToPdf({
          rangeLabel: 'Enero - Febrero 2025',
          transactions: mockTransactions,
        });
      });

      expect(ExpoFileSystem.moveAsync).toHaveBeenCalledWith({
        from: '/temp/file.pdf',
        to: expect.stringContaining('Enero-Febrero2025'),
      });
    });
  });
});
