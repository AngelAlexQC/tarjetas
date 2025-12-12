import { useAppTheme } from '@/hooks/use-app-theme';
import { render } from '@testing-library/react-native';
import React from 'react';
import { AuthLogoHeader } from '../auth-logo-header';

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

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

describe('AuthLogoHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAppTheme as jest.Mock).mockReturnValue({
      colors: {
        background: '#FFFFFF',
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

  it('should render correctly with default props', () => {
    const { root } = render(<AuthLogoHeader />);
    expect(root).toBeTruthy();
  });

  it('should render with small size', () => {
    const { root } = render(<AuthLogoHeader size="small" />);
    expect(root).toBeTruthy();
  });

  it('should render with medium size', () => {
    const { root } = render(<AuthLogoHeader size="medium" />);
    expect(root).toBeTruthy();
  });

  it('should render with large size', () => {
    const { root } = render(<AuthLogoHeader size="large" />);
    expect(root).toBeTruthy();
  });

  it('should render with subtitle when showSubtitle is true', () => {
    const { getByText } = render(<AuthLogoHeader showSubtitle />);
    expect(getByText('Agilidad Tecnológica')).toBeTruthy();
  });

  it('should not render subtitle when showSubtitle is false', () => {
    const { queryByText } = render(<AuthLogoHeader showSubtitle={false} />);
    expect(queryByText('Agilidad Tecnológica')).toBeNull();
  });

  it('should render with custom style', () => {
    const customStyle = { marginTop: 50 };
    const { root } = render(<AuthLogoHeader style={customStyle} />);
    expect(root).toBeTruthy();
  });

  it('should render large size with subtitle', () => {
    const { getByText, root } = render(
      <AuthLogoHeader size="large" showSubtitle />
    );
    expect(root).toBeTruthy();
    expect(getByText('Agilidad Tecnológica')).toBeTruthy();
  });
});
