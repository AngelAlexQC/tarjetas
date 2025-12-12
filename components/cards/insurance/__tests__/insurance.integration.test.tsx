/**
 * Tests for insurance components
 */
import { render } from '@testing-library/react-native';
import React from 'react';

// Import generator (doesn't need React mocks)
import { InsuranceBadge } from '../insurance-card-components';
import { generateInsurances, InsuranceGenerator } from '../insurance-generator';

// Mock for icon component
jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

jest.mock('@/utils/formatters/currency', () => ({
  formatCurrency: (amount: number) => `$${amount}`,
}));

jest.mock('@/components/themed-text', () => ({
  ThemedText: ({ children, type, variant, style, ...props }: any) => {
    const { Text } = require('react-native');
    return <Text style={style} {...props}>{children}</Text>;
  },
}));

describe('Insurance Components', () => {
  const mockStyles = {
    badge: {},
    badgeText: {},
    iconCircle: {},
    topRow: {},
    leftSection: {},
    textContainer: {},
    title: {},
    description: {},
    statsRow: {},
    stat: {},
    statLabel: {},
    statValue: {},
    divider: {},
    arrowContainer: {},
  };

  describe('InsuranceGenerator', () => {
    it('generates insurances with required fields', () => {
      const insurances = generateInsurances(5);
      expect(insurances).toHaveLength(5);
      insurances.forEach(ins => {
        expect(ins.id).toBeDefined();
        expect(ins.title).toBeDefined();
        expect(ins.coverageAmount).toBeGreaterThan(0);
        expect(ins.monthlyPrice).toBeGreaterThan(0);
        expect(ins.type).toBeDefined();
        expect(ins.icon).toBeDefined();
        expect(ins.color).toBeDefined();
        expect(ins.benefits).toBeDefined();
        expect(Array.isArray(ins.benefits)).toBe(true);
      });
    });

    it('generates unique ids', () => {
      const insurances = generateInsurances(10);
      const ids = new Set(insurances.map(i => i.id));
      expect(ids.size).toBe(10);
    });

    it('uses startIndex for batch generation', () => {
      const batch1 = generateInsurances(5, 0);
      const batch2 = generateInsurances(5, 100);
      
      // IDs should be different due to different start indices
      const ids1 = batch1.map(i => i.id);
      const ids2 = batch2.map(i => i.id);
      
      ids1.forEach(id => {
        expect(ids2).not.toContain(id);
      });
    });

    it('rounds coverage to multiples of 5000', () => {
      const insurances = generateInsurances(50);
      insurances.forEach(ins => {
        expect(ins.coverageAmount % 5000).toBe(0);
      });
    });

    it('rounds price to multiples of 5', () => {
      const insurances = generateInsurances(50);
      insurances.forEach(ins => {
        expect(ins.monthlyPrice % 5).toBe(0);
      });
    });

    it('generates valid insurance types', () => {
      const validTypes = ['vida', 'fraude', 'desempleo', 'viaje-accidente', 'incapacidad', 'compras', 'robo', 'asistencia-viaje'];
      const insurances = generateInsurances(20);
      insurances.forEach(ins => {
        expect(validTypes).toContain(ins.type);
      });
    });

    it('generates valid badge types', () => {
      const validBadges = ['Disponible', 'Popular', 'Nuevo', 'Recomendado', undefined];
      const insurances = generateInsurances(20);
      insurances.forEach(ins => {
        expect(validBadges).toContain(ins.badge);
      });
    });
  });

  describe('InsuranceGenerator class', () => {
    it('creates instance with default batch size', () => {
      const generator = new InsuranceGenerator();
      const batch = generator.generateNext();
      expect(batch).toHaveLength(20); // default batch size
    });

    it('creates instance with custom batch size', () => {
      const generator = new InsuranceGenerator(10);
      const batch = generator.generateNext();
      expect(batch).toHaveLength(10);
    });

    it('tracks current index', () => {
      const generator = new InsuranceGenerator(5);
      expect(generator.getCurrentIndex()).toBe(0);
      
      generator.generateNext();
      expect(generator.getCurrentIndex()).toBe(5);
      
      generator.generateNext();
      expect(generator.getCurrentIndex()).toBe(10);
    });

    it('resets index', () => {
      const generator = new InsuranceGenerator(5);
      
      generator.generateNext();
      generator.generateNext();
      expect(generator.getCurrentIndex()).toBe(10);
      
      generator.reset();
      expect(generator.getCurrentIndex()).toBe(0);
    });

    it('generates unique ids across batches', () => {
      const generator = new InsuranceGenerator(5);
      
      const batch1 = generator.generateNext();
      const batch2 = generator.generateNext();
      
      const allIds = [...batch1.map(i => i.id), ...batch2.map(i => i.id)];
      const uniqueIds = new Set(allIds);
      
      expect(uniqueIds.size).toBe(10);
    });
  });

  describe('InsuranceBadge', () => {
    it('renders badge text', () => {
      const { getByText } = render(
        <InsuranceBadge badge="Popular" styles={mockStyles} />
      );
      expect(getByText('Popular')).toBeTruthy();
    });

    it('returns null for undefined badge', () => {
      const { toJSON } = render(
        <InsuranceBadge badge={undefined} styles={mockStyles} />
      );
      expect(toJSON()).toBeNull();
    });

    it('renders different badge types', () => {
      const badges = ['Disponible', 'Popular', 'Nuevo', 'Recomendado'] as const;
      badges.forEach(badge => {
        const { getByText } = render(
          <InsuranceBadge badge={badge} styles={mockStyles} />
        );
        expect(getByText(badge)).toBeTruthy();
      });
    });
  });
});
