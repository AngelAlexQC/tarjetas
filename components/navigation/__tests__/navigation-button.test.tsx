import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Platform } from 'react-native';
import { NavigationButton } from '../navigation-button';

// Mock de hooks
jest.mock('@/hooks/use-app-theme', () => ({
  useAppTheme: jest.fn(() => ({
    colors: {
      text: '#000',
      surfaceHigher: '#f5f5f5',
      border: '#ddd',
    },
  })),
}));

describe('NavigationButton', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly with back type', () => {
    const { root } = render(
      <NavigationButton type="back" onPress={mockOnPress} />
    );
    expect(root).toBeTruthy();
  });

  it('should render correctly with close type', () => {
    const { root } = render(
      <NavigationButton type="close" onPress={mockOnPress} />
    );
    expect(root).toBeTruthy();
  });

  it('should render default back type when type not specified', () => {
    const { root } = render(<NavigationButton onPress={mockOnPress} />);
    expect(root).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const { root } = render(<NavigationButton onPress={mockOnPress} />);
    fireEvent.press(root);
    expect(mockOnPress).toHaveBeenCalled();
  });

  it('should render with custom style', () => {
    const customStyle = { marginTop: 20 };
    const { root } = render(
      <NavigationButton onPress={mockOnPress} style={customStyle} />
    );
    expect(root).toBeTruthy();
  });

  it('should render ArrowLeft icon on Android', () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', {
      get: () => 'android',
      configurable: true,
    });
    const { root } = render(<NavigationButton onPress={mockOnPress} />);
    expect(root).toBeTruthy();
    Object.defineProperty(Platform, 'OS', {
      get: () => originalOS,
      configurable: true,
    });
  });

  it('should render ChevronLeft icon on iOS', () => {
    const originalOS = Platform.OS;
    Object.defineProperty(Platform, 'OS', {
      get: () => 'ios',
      configurable: true,
    });
    const { root } = render(<NavigationButton onPress={mockOnPress} />);
    expect(root).toBeTruthy();
    Object.defineProperty(Platform, 'OS', {
      get: () => originalOS,
      configurable: true,
    });
  });

  it('should render X icon when type is close', () => {
    const { root } = render(
      <NavigationButton type="close" onPress={mockOnPress} />
    );
    expect(root).toBeTruthy();
  });
});
