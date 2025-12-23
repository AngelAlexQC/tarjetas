/**
 * Tests for main card components
 * 
 * These tests verify basic rendering for card-related components.
 */
import { render } from '@testing-library/react-native';
import React from 'react';

// Import components after mocks
import { createMockCard } from '@test-utils';
import { CardCarousel } from '../card-carousel';
import { CreditCard } from '../credit-card';
import { SummaryPanel } from '../summary-panel';

// Mock all heavy dependencies
jest.mock('@/hooks/use-app-theme', () => ({
  useAppTheme: () => ({
    isDark: false,
    colors: {
      text: '#000',
      surface: '#FFF',
    },
    tenant: { mainColor: '#007AFF' },
    helpers: { 
      getText: () => '#000',
      getSurface: () => '#FFF',
    },
  }),
}));

jest.mock('@/hooks/use-responsive-layout', () => ({
  useResponsiveLayout: () => ({ 
    isSmall: false, 
    isMedium: true, 
    isLarge: false,
    screenWidth: 375,
    isLandscape: false,
    itemSpacing: 20,
    cardWidth: 300,
    cardHeight: 190,
  }),
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: any) => children,
}));

jest.mock('react-native-reanimated', () => {
  const RN = require('react-native');
  return {
    default: {
      View: RN.View,
      createAnimatedComponent: (c: any) => c,
    },
    View: RN.View,
    useSharedValue: () => ({ value: 0 }),
    useAnimatedStyle: () => ({}),
    withSpring: (v: any) => v,
    withTiming: (v: any) => v,
    FadeIn: { duration: () => ({ delay: () => ({ springify: () => ({}) }) }) },
    FadeOut: { duration: () => ({}) },
    LinearTransition: { springify: () => ({ damping: () => ({ stiffness: () => ({}) }) }) },
    ZoomIn: { duration: () => ({}) },
    SlideInDown: { springify: () => ({}) },
    SlideOutDown: {},
    FadeInUp: { delay: () => ({ duration: () => ({}) }) },
  };
});

jest.mock('expo-blur', () => ({
  BlurView: 'BlurView',
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

jest.mock('lucide-react-native', () => ({
  DollarSign: () => null,
  Info: () => null,
  Check: () => null,
  XCircle: () => null,
  Share2: () => null,
  Calendar: () => null,
  ChevronDown: () => null,
}));

jest.mock('@/components/ui/card-background-patterns', () => ({
  CardBackgroundPattern: () => null,
}));

jest.mock('@/components/ui/card-brand-icons', () => ({
  CardBrandIcons: {
    visa: () => null,
    mastercard: () => null,
    amex: () => null,
  },
}));

jest.mock('@/components/ui/chip-icon', () => ({
  ChipIcon: () => null,
}));

jest.mock('@/components/ui/info-tooltip', () => ({
  InfoTooltip: ({ children }: any) => children,
}));

jest.mock('@/components/ui/circular-progress', () => ({
  CircularProgress: () => null,
}));

jest.mock('@/components/ui/animated-number', () => ({
  AnimatedNumber: () => null,
}));

jest.mock('@/components/ui/info-icon', () => ({
  InfoIcon: () => null,
}));

jest.mock('@/components/ui/financial-icons', () => ({
  FinancialIcons: {
    money: () => null,
    wallet: () => null,
    chart: () => null,
    settings: () => null,
    calendar: () => null,
    creditCard: () => null,
    transfer: () => null,
  },
}));

jest.mock('@/components/ui/dragonfly-logo', () => ({
  DragonflyLogo: () => null,
}));

jest.mock('@/components/ui/tab-icons', () => ({
  SettingsIcon: () => null,
}));

jest.mock('@/components/ui/themed-button', () => ({
  ThemedButton: () => null,
}));

jest.mock('@/components/navigation/navigation-button', () => ({
  NavigationButton: () => null,
}));

jest.mock('@/constants/card-actions', () => ({
  getAvailableActions: () => [
    { id: 'pay', title: 'Pagar', icon: 'money' },
    { id: 'statements', title: 'Estados', icon: 'chart' },
  ],
}));

jest.mock('@/constants/card-types', () => ({
  CARD_TYPE_LABELS: {
    credit: 'Crédito',
    debit: 'Débito',
    virtual: 'Virtual',
  },
  getCardDesign: () => ({
    gradientColors: ['#1a1a2e', '#16213e'],
    textColor: '#FFFFFF',
  }),
}));

jest.mock('@/utils/formatters/date', () => ({
  formatCardExpiry: (date: string) => date,
}));

jest.mock('@/utils/formatters/currency', () => ({
  formatCurrency: (amount: number) => `$${amount}`,
}));

jest.mock('@/utils/logger', () => ({
  loggers: {
    ui: { error: jest.fn() },
    biometric: { debug: jest.fn(), error: jest.fn() },
  },
}));

jest.mock('expo-image', () => ({
  Image: () => null,
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

jest.mock('@/components/themed-text', () => ({
  ThemedText: ({ children, style, ...props }: any) => {
    const { Text } = require('react-native');
    return <Text style={style} {...props}>{children}</Text>;
  },
}));

describe('Card Components Integration', () => {
  const mockCard = createMockCard({
    id: '1',
    cardNumber: '•••• •••• •••• 1234',
    cardHolder: 'JOHN DOE',
    expiryDate: '12/27',
    cardType: 'credit',
    cardBrand: 'visa',
    creditLimit: 10000,
    availableCredit: 8500,
    balance: 1500,
  });

  describe('CardCarousel', () => {
    it('renders with cards', async () => {
      const { findByText } = render(
        <CardCarousel
          cards={[mockCard]}
          activeCardIndex={0}
          cardWidth={300}
          cardHeight={190}
          cardSpacing={20}
          screenWidth={375}
          flatListRef={{ current: null }}
          onCardPress={jest.fn()}
          onViewableItemsChanged={jest.fn()}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        />
      );
      expect(await findByText('JOHN DOE')).toBeTruthy();
    });

    it('renders empty state', () => {
      const { getByText } = render(
        <CardCarousel
          cards={[]}
          activeCardIndex={0}
          cardWidth={300}
          cardHeight={190}
          cardSpacing={20}
          screenWidth={375}
          flatListRef={{ current: null }}
          onCardPress={jest.fn()}
          onViewableItemsChanged={jest.fn()}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        />
      );
      expect(getByText('No hay tarjetas disponibles')).toBeTruthy();
    });
  });

  describe('CreditCard', () => {
    it('renders card details', () => {
      const { getByText } = render(<CreditCard card={mockCard} />);
      expect(getByText('•••• •••• •••• 1234')).toBeTruthy();
      expect(getByText('JOHN DOE')).toBeTruthy();
    });
  });

  describe('SummaryPanel', () => {
    it('renders items', () => {
      const items = [
        { label: 'Subtotal', value: '$100.00' },
        { label: 'Total', value: '$116.00', isTotal: true },
      ];
      const { getByText } = render(<SummaryPanel items={items} />);
      expect(getByText('Subtotal')).toBeTruthy();
      expect(getByText('$100.00')).toBeTruthy();
      expect(getByText('Total')).toBeTruthy();
    });

    it('renders with title', () => {
      const { getByText } = render(
        <SummaryPanel items={[]} title="Resumen" />
      );
      expect(getByText('Resumen')).toBeTruthy();
    });
  });
});
