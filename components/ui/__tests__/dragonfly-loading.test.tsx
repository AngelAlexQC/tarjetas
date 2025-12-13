import React from 'react';
import { render } from '@testing-library/react-native';
import { DragonflyLoading } from '../dragonfly-loading';

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

describe('DragonflyLoading', () => {
  it('should render correctly with default props', () => {
    const { root } = render(<DragonflyLoading />);
    expect(root).toBeTruthy();
  });

  it('should render with custom width', () => {
    const { root } = render(<DragonflyLoading width={150} />);
    expect(root).toBeTruthy();
  });

  it('should render with custom height', () => {
    const { root } = render(<DragonflyLoading height={150} />);
    expect(root).toBeTruthy();
  });

  it('should render with custom color', () => {
    const { root } = render(<DragonflyLoading color="#FF0000" />);
    expect(root).toBeTruthy();
  });

  it('should render with custom style', () => {
    const customStyle = { marginTop: 20 };
    const { root } = render(<DragonflyLoading style={customStyle} />);
    expect(root).toBeTruthy();
  });

  it('should render with all custom props', () => {
    const { root } = render(
      <DragonflyLoading 
        width={200}
        height={200}
        color="#00FF00"
        style={{ marginTop: 10 }}
      />
    );
    expect(root).toBeTruthy();
  });
});
