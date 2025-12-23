import { CARD_BRAND_DESIGNS, CARD_TYPE_LABELS, getCardDesign } from '../card-types';

describe('card-types', () => {
  describe('CARD_BRAND_DESIGNS', () => {
    it('should have designs for all brands', () => {
      const brands = ['visa', 'mastercard', 'amex', 'discover', 'diners', 'jcb', 'maestro', 'unionpay'];
      
      brands.forEach(brand => {
        expect(CARD_BRAND_DESIGNS[brand as keyof typeof CARD_BRAND_DESIGNS]).toBeDefined();
        expect(CARD_BRAND_DESIGNS[brand as keyof typeof CARD_BRAND_DESIGNS].gradientColors).toHaveLength(3);
      });
    });

    it('should have Visa design with blue colors', () => {
      expect(CARD_BRAND_DESIGNS.visa.gradientColors).toContain('#1A1F71');
      expect(CARD_BRAND_DESIGNS.visa.textColor).toBe('#FFFFFF');
    });

    it('should have Mastercard design with red-orange colors', () => {
      expect(CARD_BRAND_DESIGNS.mastercard.gradientColors).toContain('#EB001B');
    });

    it('should have chipColor for all brands', () => {
      Object.values(CARD_BRAND_DESIGNS).forEach(design => {
        expect(design.chipColor).toBeTruthy();
      });
    });
  });

  describe('CARD_TYPE_LABELS', () => {
    it('should have labels for all card types', () => {
      expect(CARD_TYPE_LABELS.credit).toBe('Crédito');
      expect(CARD_TYPE_LABELS.debit).toBe('Débito');
      expect(CARD_TYPE_LABELS.virtual).toBe('Virtual');
    });
  });

  describe('getCardDesign', () => {
    it('should return complete design for credit Visa', () => {
      const design = getCardDesign('visa', 'credit');
      
      expect(design.brand).toBe('visa');
      expect(design.type).toBe('credit');
      expect(design.gradientColors).toHaveLength(3);
      expect(design.textColor).toBe('#FFFFFF');
      expect(design.chipColor).toBe('#FFD700');
    });

    it('should return design for debit Mastercard', () => {
      const design = getCardDesign('mastercard', 'debit');
      
      expect(design.brand).toBe('mastercard');
      expect(design.type).toBe('debit');
      expect(design.gradientColors).toContain('#EB001B');
    });

    it('should return design for virtual Amex', () => {
      const design = getCardDesign('amex', 'virtual');
      
      expect(design.brand).toBe('amex');
      expect(design.type).toBe('virtual');
      expect(design.chipColor).toBe('#FFFFFF');
    });

    it('should work for all brands', () => {
      const brands: ('visa' | 'mastercard' | 'amex' | 'discover' | 'diners' | 'jcb' | 'maestro' | 'unionpay')[] = 
        ['visa', 'mastercard', 'amex', 'discover', 'diners', 'jcb', 'maestro', 'unionpay'];
      
      brands.forEach(brand => {
        const design = getCardDesign(brand, 'credit');
        expect(design.brand).toBe(brand);
        expect(design.gradientColors).toHaveLength(3);
      });
    });
  });
});
