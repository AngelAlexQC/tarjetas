/**
 * Cards Screen Hook Tests
 */

import { InsuranceType } from '@/components/cards/insurance/insurance-generator';
import { useSplash } from '@/contexts/splash-context';
import { act, renderHook } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { Alert, Platform } from 'react-native';
import { useCardQueries } from '../use-card-queries';
import { useCardsScreen } from '../use-cards-screen';

// Mock modules
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn((callback) => callback()),
  useScrollToTop: jest.fn(),
}));

jest.mock('@/contexts/splash-context', () => ({
  useSplash: jest.fn(),
}));

jest.mock('../use-card-queries', () => ({
  useCardQueries: jest.fn(),
}));

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Alert: {
      alert: jest.fn(),
    },
    Platform: {
      OS: 'ios',
    },
  };
});

jest.mock('@/utils/formatters/currency', () => ({
  formatCurrency: jest.fn((value) => `$${value.toFixed(2)}`),
}));

describe('useCardsScreen', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockCards = [
    {
      id: '1',
      cardNumber: '•••• 1234',
      cardType: 'credit',
      status: 'active',
      availableCredit: 5000,
      balance: 0,
    },
    {
      id: '2',
      cardNumber: '•••• 5678',
      cardType: 'debit',
      status: 'active',
      balance: 2500,
      availableCredit: 0,
    },
    {
      id: '3',
      cardNumber: '•••• 9012',
      cardType: 'virtual',
      status: 'active',
      availableCredit: 1000,
      balance: 0,
    },
  ];

  const mockFetchCards = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSplash as jest.Mock).mockReturnValue({ isSplashComplete: true });
    (useCardQueries as jest.Mock).mockReturnValue({
      cards: mockCards,
      isLoading: false,
      fetchCards: mockFetchCards,
    });
    // @ts-ignore
    Platform.OS = 'ios';
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('initial state', () => {
    it('should have activeCardIndex as 0 initially', () => {
      const { result } = renderHook(() => 
        useCardsScreen({ cardWidth: 300, cardSpacing: 16 })
      );

      expect(result.current.activeCardIndex).toBe(0);
    });

    it('should have activeCard as first card', () => {
      const { result } = renderHook(() => 
        useCardsScreen({ cardWidth: 300, cardSpacing: 16 })
      );

      expect(result.current.activeCard).toEqual(mockCards[0]);
    });

    it('should have insurance modal hidden', () => {
      const { result } = renderHook(() => 
        useCardsScreen({ cardWidth: 300, cardSpacing: 16 })
      );

      expect(result.current.isInsuranceModalVisible).toBe(false);
      expect(result.current.selectedInsurance).toBeNull();
    });

    it('should expose refs', () => {
      const { result } = renderHook(() => 
        useCardsScreen({ cardWidth: 300, cardSpacing: 16 })
      );

      expect(result.current.flatListRef).toBeDefined();
      expect(result.current.scrollRef).toBeDefined();
    });

    it('should have correct viewabilityConfig', () => {
      const { result } = renderHook(() => 
        useCardsScreen({ cardWidth: 300, cardSpacing: 16 })
      );

      expect(result.current.viewabilityConfig).toEqual({
        itemVisiblePercentThreshold: 50,
      });
    });

    it('should detect platform correctly', () => {
      const { result } = renderHook(() => 
        useCardsScreen({ cardWidth: 300, cardSpacing: 16 })
      );

      expect(result.current.isIOS).toBe(true);
    });
  });

  describe('card fetching', () => {
    it('should call fetchCards when splash is complete and no cards', () => {
      (useCardQueries as jest.Mock).mockReturnValue({
        cards: [],
        isLoading: false,
        fetchCards: mockFetchCards,
      });

      renderHook(() => useCardsScreen({ cardWidth: 300, cardSpacing: 16 }));

      expect(mockFetchCards).toHaveBeenCalled();
    });

    it('should not fetch cards if splash is not complete', () => {
      (useSplash as jest.Mock).mockReturnValue({ isSplashComplete: false });
      (useCardQueries as jest.Mock).mockReturnValue({
        cards: [],
        isLoading: false,
        fetchCards: mockFetchCards,
      });

      renderHook(() => useCardsScreen({ cardWidth: 300, cardSpacing: 16 }));

      expect(mockFetchCards).not.toHaveBeenCalled();
    });

    it('should not fetch cards if cards already exist', () => {
      renderHook(() => useCardsScreen({ cardWidth: 300, cardSpacing: 16 }));

      expect(mockFetchCards).not.toHaveBeenCalled();
    });
  });

  describe('onViewableItemsChanged', () => {
    it('should update activeCardIndex when viewable items change', () => {
      const { result } = renderHook(() => 
        useCardsScreen({ cardWidth: 300, cardSpacing: 16 })
      );

      act(() => {
        result.current.onViewableItemsChanged({
          viewableItems: [{ index: 1, item: mockCards[1], isViewable: true, key: '1' }],
        });
      });

      expect(result.current.activeCardIndex).toBe(1);
    });

    it('should handle empty viewable items', () => {
      const { result } = renderHook(() => 
        useCardsScreen({ cardWidth: 300, cardSpacing: 16 })
      );

      act(() => {
        result.current.onViewableItemsChanged({
          viewableItems: [],
        });
      });

      expect(result.current.activeCardIndex).toBe(0);
    });

    it('should handle null index', () => {
      const { result } = renderHook(() => 
        useCardsScreen({ cardWidth: 300, cardSpacing: 16 })
      );

      act(() => {
        result.current.onViewableItemsChanged({
          viewableItems: [{ index: null, item: mockCards[0], isViewable: true, key: '0' } as any],
        });
      });

      expect(result.current.activeCardIndex).toBe(0);
    });
  });

  describe('handleCardPress', () => {
    it('should update activeCardIndex when card is pressed', () => {
      const { result } = renderHook(() => 
        useCardsScreen({ cardWidth: 300, cardSpacing: 16 })
      );

      act(() => {
        result.current.handleCardPress(2);
      });

      expect(result.current.activeCardIndex).toBe(2);
    });
  });

  describe('handleActionPress', () => {
    it('should navigate to card action route', () => {
      const { result } = renderHook(() => 
        useCardsScreen({ cardWidth: 300, cardSpacing: 16 })
      );

      act(() => {
        result.current.handleActionPress('pay');
      });

      expect(mockRouter.push).toHaveBeenCalled();
    });

    it('should not navigate if no active card', () => {
      (useCardQueries as jest.Mock).mockReturnValue({
        cards: [],
        isLoading: false,
        fetchCards: mockFetchCards,
      });

      const { result } = renderHook(() => 
        useCardsScreen({ cardWidth: 300, cardSpacing: 16 })
      );

      act(() => {
        result.current.handleActionPress('pay');
      });

      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });

  describe('insurance handling', () => {
    const mockInsurance = {
      id: 'ins-1',
      type: 'vida' as InsuranceType,
      title: 'Seguro de Vida',
      description: 'Protección para tu familia',
      coverage: 'Hasta',
      coverageAmount: 100000,
      monthlyPrice: 50,
      currency: 'USD',
      icon: 'heart',
      color: '#FF3B30',
      benefits: ['Beneficio 1'],
    };

    it('should open insurance modal on press', () => {
      const { result } = renderHook(() => 
        useCardsScreen({ cardWidth: 300, cardSpacing: 16 })
      );

      act(() => {
        result.current.handleInsurancePress(mockInsurance);
      });

      expect(result.current.isInsuranceModalVisible).toBe(true);
      expect(result.current.selectedInsurance).toEqual(mockInsurance);
    });

    it('should close insurance modal', () => {
      const { result } = renderHook(() => 
        useCardsScreen({ cardWidth: 300, cardSpacing: 16 })
      );

      act(() => {
        result.current.handleInsurancePress(mockInsurance);
      });

      act(() => {
        result.current.handleInsuranceModalClose();
      });

      expect(result.current.isInsuranceModalVisible).toBe(false);
      expect(result.current.selectedInsurance).toBeNull();
    });

    it('should close insurance result', () => {
      const { result } = renderHook(() => 
        useCardsScreen({ cardWidth: 300, cardSpacing: 16 })
      );

      act(() => {
        result.current.handleInsuranceResultClose();
      });

      expect(result.current.insuranceResult).toBeNull();
      expect(result.current.contractedInsurance).toBeNull();
    });

    it('should show error alert if no active card for contract', () => {
      (useCardQueries as jest.Mock).mockReturnValue({
        cards: [],
        isLoading: false,
        fetchCards: mockFetchCards,
      });

      const { result } = renderHook(() => 
        useCardsScreen({ cardWidth: 300, cardSpacing: 16 })
      );

      act(() => {
        result.current.handleInsuranceContract(mockInsurance);
      });

      expect(Alert.alert).toHaveBeenCalledWith('Error', 'No hay una tarjeta seleccionada');
    });

    it('should show insufficient funds alert for credit card', () => {
      (useCardQueries as jest.Mock).mockReturnValue({
        cards: [{
          id: '1',
          cardType: 'credit',
          availableCredit: 10,
          balance: 0,
        }],
        isLoading: false,
        fetchCards: mockFetchCards,
      });

      const { result } = renderHook(() => 
        useCardsScreen({ cardWidth: 300, cardSpacing: 16 })
      );

      act(() => {
        result.current.handleInsuranceContract(mockInsurance);
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Fondos Insuficientes',
        expect.stringContaining('crédito disponible')
      );
    });

    it('should show insufficient funds alert for debit card', () => {
      (useCardQueries as jest.Mock).mockReturnValue({
        cards: [{
          id: '1',
          cardType: 'debit',
          balance: 10,
          availableCredit: 0,
        }],
        isLoading: false,
        fetchCards: mockFetchCards,
      });

      const { result } = renderHook(() => 
        useCardsScreen({ cardWidth: 300, cardSpacing: 16 })
      );

      act(() => {
        result.current.handleInsuranceContract(mockInsurance);
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Fondos Insuficientes',
        expect.stringContaining('saldo')
      );
    });

    it('should show contract confirmation for sufficient funds', () => {
      const { result } = renderHook(() => 
        useCardsScreen({ cardWidth: 300, cardSpacing: 16 })
      );

      act(() => {
        result.current.handleInsuranceContract(mockInsurance);
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        'Contratar Seguro',
        expect.stringContaining('Seguro de Vida'),
        expect.any(Array)
      );
    });
  });

  describe('handleAddToWallet', () => {
    it('should show Apple Wallet alert on iOS', () => {
      // @ts-ignore
      Platform.OS = 'ios';

      const { result } = renderHook(() => 
        useCardsScreen({ cardWidth: 300, cardSpacing: 16 })
      );

      act(() => {
        result.current.handleAddToWallet();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        expect.stringContaining('Apple Wallet'),
        expect.any(String)
      );
    });

    it('should show Google Wallet alert on Android', () => {
      // @ts-ignore
      Platform.OS = 'android';

      const { result } = renderHook(() => 
        useCardsScreen({ cardWidth: 300, cardSpacing: 16 })
      );

      act(() => {
        result.current.handleAddToWallet();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        expect.stringContaining('Google Wallet'),
        expect.any(String)
      );
    });
  });

  describe('handleFaqPress', () => {
    it('should navigate to FAQ page', () => {
      const { result } = renderHook(() => 
        useCardsScreen({ cardWidth: 300, cardSpacing: 16 })
      );

      act(() => {
        result.current.handleFaqPress();
      });

      expect(mockRouter.push).toHaveBeenCalledWith('/faq');
    });
  });

  describe('cleanup', () => {
    it('should cleanup on unmount', () => {
      const { result, unmount } = renderHook(() => 
        useCardsScreen({ cardWidth: 300, cardSpacing: 16 })
      );

      // Set some state
      act(() => {
        result.current.handleInsurancePress({
          id: 'ins-1',
          type: 'vida' as InsuranceType,
          title: 'Test',
          description: 'Test',
          coverage: 'Hasta',
          coverageAmount: 100000,
          monthlyPrice: 50,
          currency: 'USD',
          icon: 'heart',
          color: '#FF3B30',
          benefits: ['Beneficio 1'],
        });
      });

      // Unmount should not throw
      expect(() => unmount()).not.toThrow();
    });
  });
});
