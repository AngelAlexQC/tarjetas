import { useAppTheme } from '@/hooks/use-app-theme';
import { render } from '@testing-library/react-native';
import React from 'react';
import { PoweredBy } from '../powered-by';

// Mock dependencies
jest.mock('@/hooks/use-app-theme');

jest.mock('react-native-reanimated', () => {
  return {
    ...jest.requireActual('react-native-reanimated/mock'),
    useSharedValue: jest.fn(() => ({ value: 0 })),
    useAnimatedProps: jest.fn(() => ({})),
    useAnimatedStyle: jest.fn(() => ({})),
    withRepeat: jest.fn((animation) => animation),
    withTiming: jest.fn((value) => value),
    withSequence: jest.fn((...animations) => animations[0]),
    createAnimatedComponent: jest.fn((component) => component),
    Easing: {
      inOut: jest.fn((fn) => fn),
      sin: jest.fn(),
      ease: jest.fn(),
    },
  };
});

describe('PoweredBy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAppTheme as jest.Mock).mockReturnValue({
      colors: {
        textTertiary: '#999999',
        textSecondary: '#666666',
      },
      tenant: {
        mainColor: '#007AFF',
      },
      helpers: {
        getText: jest.fn(() => '#000000'),
      },
    });
  });

  it('should render correctly', () => {
    const { getByText } = render(<PoweredBy />);
    expect(getByText('Powered by')).toBeTruthy();
  });

  it('should render Libélula text', () => {
    const { getByText } = render(<PoweredBy />);
    expect(getByText('Libélula')).toBeTruthy();
  });

  it('should render Soft text', () => {
    const { getByText } = render(<PoweredBy />);
    expect(getByText('Soft')).toBeTruthy();
  });

  it('should render with custom style', () => {
    const customStyle = { marginTop: 20 };
    const { root } = render(<PoweredBy style={customStyle} />);
    expect(root).toBeTruthy();
  });

  it('should render all brand elements together', () => {
    const { getByText, root } = render(<PoweredBy />);
    expect(root).toBeTruthy();
    expect(getByText('Powered by')).toBeTruthy();
    expect(getByText('Libélula')).toBeTruthy();
    expect(getByText('Soft')).toBeTruthy();
  });
});
