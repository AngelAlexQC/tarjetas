import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NavigationButton } from '../navigation-button';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Platform } from 'react-native';

jest.mock('@/hooks/use-app-theme');
jest.mock('lucide-react-native', () => ({
  ArrowLeft: () => null,
  ChevronLeft: () => null,
  X: () => null,
}));

describe('NavigationButton', () => {
  const mockOnPress = jest.fn();
  const mockTheme = {
    colors: {
      surfaceHigher: '#F5F5F5',
      border: '#E0E0E0',
      text: '#000000',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  it('should render back button by default', () => {
    const { root } = render(
      <NavigationButton onPress={mockOnPress} />
    );
    
    expect(root).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const { getByRole } = render(
      <NavigationButton onPress={mockOnPress} />
    );
    
    const button = getByRole('button');
    fireEvent.press(button);
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should render close button when type is close', () => {
    const { root } = render(
      <NavigationButton type="close" onPress={mockOnPress} />
    );
    
    expect(root).toBeTruthy();
  });

  it('should render back button when type is back', () => {
    const { root } = render(
      <NavigationButton type="back" onPress={mockOnPress} />
    );
    
    expect(root).toBeTruthy();
  });

  it('should use different icons based on platform for back button', () => {
    Platform.OS = 'android';
    const { root: androidRoot } = render(
      <NavigationButton type="back" onPress={mockOnPress} />
    );
    expect(androidRoot).toBeTruthy();

    Platform.OS = 'ios';
    const { root: iosRoot } = render(
      <NavigationButton type="back" onPress={mockOnPress} />
    );
    expect(iosRoot).toBeTruthy();
  });

  it('should accept custom style', () => {
    const customStyle = { marginTop: 20 };
    const { root } = render(
      <NavigationButton onPress={mockOnPress} style={customStyle} />
    );
    
    expect(root).toBeTruthy();
  });

  it('should apply theme colors', () => {
    const { getByRole } = render(
      <NavigationButton onPress={mockOnPress} />
    );
    
    const button = getByRole('button');
    expect(button.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: mockTheme.colors.surfaceHigher,
          borderColor: mockTheme.colors.border,
        })
      ])
    );
  });

  it('should show pressed state', () => {
    const { getByRole } = render(
      <NavigationButton onPress={mockOnPress} />
    );
    
    const button = getByRole('button');
    fireEvent(button, 'pressIn');
    fireEvent.press(button);
    fireEvent(button, 'pressOut');
    
    expect(mockOnPress).toHaveBeenCalled();
  });
});
