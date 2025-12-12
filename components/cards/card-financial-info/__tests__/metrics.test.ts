import { calculateCardMetrics } from '../metrics';
import type { Card } from '@/repositories';

describe('metrics', () => {
  describe('calculateCardMetrics', () => {
    const mockCreditCard: Partial<Card> = {
      cardType: 'credit',
      brand: 'Visa',
      lastFour: '1234',
    };

    const mockDebitCard: Partial<Card> = {
      cardType: 'debit',
      brand: 'Mastercard',
      lastFour: '5678',
    };

    const mockVirtualCard: Partial<Card> = {
      cardType: 'virtual',
      brand: 'Visa',
      lastFour: '9012',
    };

    it('should calculate metrics for credit card', () => {
      const result = calculateCardMetrics(
        mockCreditCard as Card,
        true,
        0,
        10000,
        5000,
        10,
        '#FF0000'
      );

      expect(result.usagePercentage).toBe(50);
      expect(result.availableCredit).toBe(5000);
      expect(result.minimumPayment).toBe(250); // 5% of 5000
      expect(result.isPaymentSoon).toBe(false);
      expect(result.baseOrder).toBe(100);
    });

    it('should detect payment soon for credit card', () => {
      const result = calculateCardMetrics(
        mockCreditCard as Card,
        true,
        0,
        10000,
        3000,
        3, // 3 days
        '#FF0000'
      );

      expect(result.isPaymentSoon).toBe(true);
    });

    it('should calculate metrics for debit card', () => {
      const result = calculateCardMetrics(
        mockDebitCard as Card,
        false,
        2500,
        0,
        0,
        0,
        '#00FF00'
      );

      expect(result.usagePercentage).toBe(0);
      expect(result.availableCredit).toBe(2500);
      expect(result.dailyPurchaseLimit).toBe(5000);
      expect(result.dailyATMLimit).toBe(2000);
      expect(result.baseOrder).toBe(200);
    });

    it('should calculate metrics for virtual card', () => {
      const result = calculateCardMetrics(
        mockVirtualCard as Card,
        false,
        1000,
        0,
        0,
        0,
        '#0000FF'
      );

      expect(result.spendingLimit).toBe(3000);
      expect(result.isReloadable).toBe(true);
      expect(result.baseOrder).toBe(300);
    });

    it('should handle zero credit limit', () => {
      const result = calculateCardMetrics(
        mockCreditCard as Card,
        true,
        0,
        0,
        0,
        10,
        '#FF0000'
      );

      expect(result.usagePercentage).toBe(0);
      expect(result.minimumPayment).toBe(0);
    });

    it('should set next payment date correctly', () => {
      const result = calculateCardMetrics(
        mockCreditCard as Card,
        true,
        0,
        10000,
        5000,
        10,
        '#FF0000'
      );

      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 10);
      
      expect(result.nextPaymentDate.getDate()).toBe(expectedDate.getDate());
    });

    it('should apply theme colors', () => {
      const primaryColor = '#FF0000';
      const result = calculateCardMetrics(
        mockCreditCard as Card,
        true,
        0,
        10000,
        5000,
        10,
        primaryColor
      );

      expect(result.heroColor).toBe(primaryColor);
      expect(result.usageColors.fg).toBe(primaryColor);
      expect(result.usageColors.bg).toBe(`${primaryColor}20`);
    });
});
