import { useTour } from '@/contexts/tour-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Text, View } from 'react-native';
import { InfoTooltip } from '../info-tooltip';

// Mock dependencies
jest.mock('@/hooks/use-app-theme');

jest.mock('@/contexts/tour-context', () => ({
  useTour: jest.fn(),
}));

jest.mock('@/utils/logger', () => ({
  loggers: {
    ui: {
      warn: jest.fn(),
      error: jest.fn(),
    },
  },
}));

jest.mock('expo-blur', () => ({
  BlurView: 'BlurView',
}));

jest.mock('expo-calendar', () => ({
  requestCalendarPermissionsAsync: jest.fn(() => 
    Promise.resolve({ status: 'granted' })
  ),
  getCalendarsAsync: jest.fn(() => Promise.resolve([{ id: '1' }])),
  getDefaultCalendarAsync: jest.fn(() => Promise.resolve({ id: '1' })),
  createEventAsync: jest.fn(() => Promise.resolve('event-id')),
  openEventInCalendar: jest.fn(),
  EntityTypes: { EVENT: 'event' },
  CalendarAccessLevel: { OWNER: 'owner', EDITOR: 'editor' },
}));

jest.mock('react-native-reanimated', () => {
  return {
    ...jest.requireActual('react-native-reanimated/mock'),
    useSharedValue: jest.fn(() => ({ value: 0 })),
    useAnimatedProps: jest.fn(() => ({})),
    useAnimatedStyle: jest.fn(() => ({})),
    withTiming: jest.fn((value, _config, callback) => {
      if (callback) callback(true);
      return value;
    }),
    withSpring: jest.fn((value) => value),
    runOnJS: jest.fn((fn) => fn),
    FadeIn: { duration: () => ({ delay: () => ({}) }) },
    FadeOut: { duration: () => ({}) },
    Easing: {
      linear: 'linear',
      inOut: jest.fn((fn) => fn),
    },
    createAnimatedComponent: jest.fn((component) => component),
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(() => ({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  })),
}));

describe('InfoTooltip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAppTheme as jest.Mock).mockReturnValue({
      colors: {
        text: '#000000',
        textSecondary: '#666666',
        borderSubtle: 'rgba(0,0,0,0.1)',
      },
      isDark: false,
      tenant: {
        mainColor: '#007AFF',
      },
      helpers: {
        getText: jest.fn(() => '#000000'),
      },
    });
    (useTour as jest.Mock).mockReturnValue({
      register: jest.fn(),
      unregister: jest.fn(),
      onTooltipClosed: jest.fn(),
      stopTour: jest.fn(),
    });
  });

  it('should render children correctly', () => {
    const { getByText } = render(
      <InfoTooltip content="This is tooltip content">
        <Text>Trigger</Text>
      </InfoTooltip>
    );
    expect(getByText('Trigger')).toBeTruthy();
  });

  it('should have correct accessibility props', () => {
    const { getByRole } = render(
      <InfoTooltip content="Tooltip content" title="Info">
        <Text>Trigger</Text>
      </InfoTooltip>
    );
    expect(getByRole('button')).toBeTruthy();
  });

  it('should render with title prop', () => {
    const { getByText } = render(
      <InfoTooltip content="Content" title="Title">
        <Text>Trigger</Text>
      </InfoTooltip>
    );
    expect(getByText('Trigger')).toBeTruthy();
  });

  it('should render with different placements', () => {
    const placements = ['top', 'bottom', 'left', 'right'] as const;
    
    placements.forEach(placement => {
      const { getByText, unmount } = render(
        <InfoTooltip content="Content" placement={placement}>
          <Text>Trigger {placement}</Text>
        </InfoTooltip>
      );
      expect(getByText(`Trigger ${placement}`)).toBeTruthy();
      unmount();
    });
  });

  it('should render with press trigger mode', () => {
    const { getByText } = render(
      <InfoTooltip content="Content" triggerMode="press">
        <Text>Press me</Text>
      </InfoTooltip>
    );
    expect(getByText('Press me')).toBeTruthy();
  });

  it('should render with longPress trigger mode', () => {
    const { getByText } = render(
      <InfoTooltip content="Content" triggerMode="longPress">
        <Text>Long press me</Text>
      </InfoTooltip>
    );
    expect(getByText('Long press me')).toBeTruthy();
  });

  it('should render with tourKey prop', () => {
    const { getByText } = render(
      <InfoTooltip content="Content" tourKey="test-tour">
        <Text>Tour trigger</Text>
      </InfoTooltip>
    );
    expect(getByText('Tour trigger')).toBeTruthy();
  });

  it('should render with tourOrder prop', () => {
    const { getByText } = render(
      <InfoTooltip content="Content" tourKey="test" tourOrder={1}>
        <Text>Tour order trigger</Text>
      </InfoTooltip>
    );
    expect(getByText('Tour order trigger')).toBeTruthy();
  });

  it('should render with tourDuration prop', () => {
    const { getByText } = render(
      <InfoTooltip content="Content" tourKey="test" tourDuration={3000}>
        <Text>Tour duration trigger</Text>
      </InfoTooltip>
    );
    expect(getByText('Tour duration trigger')).toBeTruthy();
  });

  it('should render with targetBorderRadius prop', () => {
    const { getByText } = render(
      <InfoTooltip content="Content" targetBorderRadius={20}>
        <Text>Radius trigger</Text>
      </InfoTooltip>
    );
    expect(getByText('Radius trigger')).toBeTruthy();
  });

  it('should call onPress callback when provided and triggerMode is longPress', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <InfoTooltip content="Content" triggerMode="longPress" onPress={onPress}>
        <Text>Callback trigger</Text>
      </InfoTooltip>
    );
    fireEvent.press(getByText('Callback trigger'));
    expect(onPress).toHaveBeenCalled();
  });

  it('should render with calendarEvent prop', () => {
    const calendarEvent = {
      title: 'Payment Due',
      startDate: new Date('2025-01-15'),
      notes: 'Remember to pay',
    };
    
    const { getByText } = render(
      <InfoTooltip content="Payment info" calendarEvent={calendarEvent}>
        <Text>Calendar trigger</Text>
      </InfoTooltip>
    );
    expect(getByText('Calendar trigger')).toBeTruthy();
  });

  it('should render with extraContent as ReactNode', () => {
    const { getByText } = render(
      <InfoTooltip 
        content="Content" 
        extraContent={<View><Text>Extra</Text></View>}
      >
        <Text>Extra content trigger</Text>
      </InfoTooltip>
    );
    expect(getByText('Extra content trigger')).toBeTruthy();
  });

  it('should render with extraContent as function', () => {
    const extraContentFn = ({ close }: { close: () => void }) => (
      <View>
        <Text onPress={close}>Close</Text>
      </View>
    );
    
    const { getByText } = render(
      <InfoTooltip content="Content" extraContent={extraContentFn}>
        <Text>Function trigger</Text>
      </InfoTooltip>
    );
    expect(getByText('Function trigger')).toBeTruthy();
  });

  it('should allow children to be any React node', () => {
    const { root } = render(
      <InfoTooltip content="Content">
        <View>
          <Text>Complex</Text>
          <Text>Children</Text>
        </View>
      </InfoTooltip>
    );
    expect(root).toBeTruthy();
  });

  it('should register with tour context when tourKey is provided', () => {
    const mockRegister = jest.fn();
    (useTour as jest.Mock).mockReturnValue({
      register: mockRegister,
      unregister: jest.fn(),
      onTooltipClosed: jest.fn(),
      stopTour: jest.fn(),
    });
    
    render(
      <InfoTooltip content="Content" tourKey="test-key">
        <Text>Trigger</Text>
      </InfoTooltip>
    );
    
    expect(mockRegister).toHaveBeenCalled();
  });
});
