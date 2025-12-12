import { getAvailableActions } from '../card-actions';

describe('card-actions', () => {
  describe('getAvailableActions', () => {
    it('should return credit card actions', () => {
      const actions = getAvailableActions('credit');
      
      expect(actions.length).toBeGreaterThan(0);
      expect(actions.some(a => a.id === 'pay')).toBe(true);
      expect(actions.some(a => a.id === 'defer')).toBe(true);
    });

    it('should exclude cardless_atm from credit cards', () => {
      const actions = getAvailableActions('credit');
      
      expect(actions.some(a => a.id === 'cardless_atm')).toBe(false);
    });

    it('should return debit card actions', () => {
      const actions = getAvailableActions('debit');
      
      expect(actions.length).toBeGreaterThan(0);
      expect(actions.some(a => a.id === 'statement')).toBe(true);
      expect(actions.some(a => a.id === 'block')).toBe(true);
    });

    it('should exclude defer and advances from debit cards', () => {
      const actions = getAvailableActions('debit');
      
      expect(actions.some(a => a.id === 'defer')).toBe(false);
      expect(actions.some(a => a.id === 'advances')).toBe(false);
      expect(actions.some(a => a.id === 'pay')).toBe(false);
    });

    it('should return virtual card actions', () => {
      const actions = getAvailableActions('virtual');
      
      expect(actions.length).toBeGreaterThan(0);
    });

    it('should exclude physical-only actions from virtual cards', () => {
      const actions = getAvailableActions('virtual');
      
      expect(actions.some(a => a.id === 'pin')).toBe(false);
      expect(actions.some(a => a.id === 'replace')).toBe(false);
      expect(actions.some(a => a.id === 'travel')).toBe(false);
    });
  });

  describe('action lookup', () => {
    it('should find pay action in credit cards', () => {
      const actions = getAvailableActions('credit');
      const payAction = actions.find(a => a.id === 'pay');
      
      expect(payAction).toBeDefined();
      expect(payAction?.title).toBe('Pagar Tarjeta');
    });

    it('should find statement action in all card types', () => {
      const creditActions = getAvailableActions('credit');
      const debitActions = getAvailableActions('debit');
      const virtualActions = getAvailableActions('virtual');
      
      expect(creditActions.find(a => a.id === 'statement')).toBeDefined();
      expect(debitActions.find(a => a.id === 'statement')).toBeDefined();
      expect(virtualActions.find(a => a.id === 'statement')).toBeDefined();
    });

    it('should have different actions for different card types', () => {
      const creditActions = getAvailableActions('credit');
      const debitActions = getAvailableActions('debit');
      const virtualActions = getAvailableActions('virtual');
      
      // Credit cards should have pay action that debit doesn't
      expect(creditActions.some(a => a.id === 'pay')).toBe(true);
      expect(debitActions.some(a => a.id === 'pay')).toBe(false);
      
      // Virtual cards shouldn't have pin that credit/debit have
      const creditHasPin = creditActions.some(a => a.id === 'pin');
      const virtualHasPin = virtualActions.some(a => a.id === 'pin');
      expect(creditHasPin).not.toBe(virtualHasPin);
    });
  });

  describe('action properties', () => {
    it('all actions should have required properties', () => {
      const actions = getAvailableActions('credit');
      
      actions.forEach(action => {
        expect(action.id).toBeTruthy();
        expect(action.title).toBeTruthy();
        expect(action.description).toBeTruthy();
        expect(action.icon).toBeTruthy();
        expect(action.color).toBeTruthy();
      });
    });

    it('some actions should require authentication', () => {
      const actions = getAvailableActions('credit');
      const payAction = actions.find(a => a.id === 'pay');
      const blockAction = actions.find(a => a.id === 'block');
      
      expect(payAction?.requiresAuth).toBe(true);
      expect(blockAction?.requiresAuth).toBe(true);
    });
  });
});
