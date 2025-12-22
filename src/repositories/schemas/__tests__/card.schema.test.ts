/**
 * Card Schema Tests
 * 
 * Tests para validar los esquemas de tarjetas con Zod.
 */

import {
    BlockCardRequestSchema,
    CardSchema,
    ChangePinRequestSchema,
    DeferRequestSchema,
} from '@/domain/cards/types/card.schema';

describe('CardSchema', () => {
  const validCard = {
    id: '1',
    cardNumber: '•••• •••• •••• 1234',
    cardHolder: 'Juan Pérez',
    expiryDate: '12/27',
    balance: 1500.50,
    cardType: 'credit',
    cardBrand: 'visa',
    status: 'active',
  };

  it('should validate a correct card', () => {
    const result = CardSchema.safeParse(validCard);
    expect(result.success).toBe(true);
  });

  it('should validate card with optional fields', () => {
    const cardWithOptionals = {
      ...validCard,
      creditLimit: 10000,
      availableCredit: 8500,
      lastTransactionDate: '2025-12-01T10:00:00Z',
    };
    const result = CardSchema.safeParse(cardWithOptionals);
    expect(result.success).toBe(true);
  });

  it('should reject card with invalid type', () => {
    const invalidCard = { ...validCard, cardType: 'invalid' };
    const result = CardSchema.safeParse(invalidCard);
    expect(result.success).toBe(false);
  });

  it('should reject card with invalid brand', () => {
    const invalidCard = { ...validCard, cardBrand: 'unknown' };
    const result = CardSchema.safeParse(invalidCard);
    expect(result.success).toBe(false);
  });

  it('should reject card with invalid expiry date format', () => {
    const invalidCard = { ...validCard, expiryDate: '2027-12' };
    const result = CardSchema.safeParse(invalidCard);
    expect(result.success).toBe(false);
  });

  it('should reject card without required fields', () => {
    const invalidCard = { id: '1' };
    const result = CardSchema.safeParse(invalidCard);
    expect(result.success).toBe(false);
  });
});

describe('BlockCardRequestSchema', () => {
  it('should validate a correct block request', () => {
    const request = {
      cardId: '1',
      type: 'temporary',
    };
    const result = BlockCardRequestSchema.safeParse(request);
    expect(result.success).toBe(true);
  });

  it('should validate block request with optional fields', () => {
    const request = {
      cardId: '1',
      type: 'permanent',
      reason: 'lost',
      comments: 'Card was lost during travel',
    };
    const result = BlockCardRequestSchema.safeParse(request);
    expect(result.success).toBe(true);
  });

  it('should reject invalid block type', () => {
    const request = {
      cardId: '1',
      type: 'invalid',
    };
    const result = BlockCardRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
  });
});

describe('ChangePinRequestSchema', () => {
  it('should validate a correct PIN change request', () => {
    const request = {
      cardId: '1',
      currentPin: '1234',
      newPin: '5678',
      confirmPin: '5678',
    };
    const result = ChangePinRequestSchema.safeParse(request);
    expect(result.success).toBe(true);
  });

  it('should reject when PINs do not match', () => {
    const request = {
      cardId: '1',
      currentPin: '1234',
      newPin: '5678',
      confirmPin: '9999',
    };
    const result = ChangePinRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("PINs don't match");
    }
  });

  it('should reject PIN with non-digits', () => {
    const request = {
      cardId: '1',
      currentPin: 'abcd',
      newPin: '5678',
      confirmPin: '5678',
    };
    const result = ChangePinRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
  });

  it('should reject PIN with wrong length', () => {
    const request = {
      cardId: '1',
      currentPin: '123',
      newPin: '5678',
      confirmPin: '5678',
    };
    const result = ChangePinRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
  });
});

describe('DeferRequestSchema', () => {
  it('should validate a correct defer request', () => {
    const request = {
      cardId: '1',
      transactionIds: ['tx1', 'tx2'],
      months: 12,
    };
    const result = DeferRequestSchema.safeParse(request);
    expect(result.success).toBe(true);
  });

  it('should reject empty transaction IDs', () => {
    const request = {
      cardId: '1',
      transactionIds: [],
      months: 12,
    };
    const result = DeferRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
  });

  it('should reject non-positive months', () => {
    const request = {
      cardId: '1',
      transactionIds: ['tx1'],
      months: 0,
    };
    const result = DeferRequestSchema.safeParse(request);
    expect(result.success).toBe(false);
  });
});
