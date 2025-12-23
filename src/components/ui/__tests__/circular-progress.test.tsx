import { useAppTheme } from '@/hooks/use-app-theme';
import { render } from '@testing-library/react-native';
import React from 'react';
import { CircularProgress } from '../circular-progress';

// react-native-reanimated está mockeado globalmente en jest.setup.ts

// Mock useAppTheme for ThemedText
jest.mock('@/hooks/use-app-theme');

describe('CircularProgress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAppTheme as jest.Mock).mockReturnValue({
      tenant: {
        mainColor: '#007AFF',
      },
      helpers: {
        getText: jest.fn(() => '#000000'),
      },
    });
  });

  it('should render correctly with basic props', () => {
    const { root } = render(<CircularProgress value={50} max={100} />);
    expect(root).toBeTruthy();
  });

  it('should render with custom size', () => {
    const { root } = render(
      <CircularProgress value={50} max={100} size={100} />
    );
    expect(root).toBeTruthy();
  });

  it('should render with custom strokeWidth', () => {
    const { root } = render(
      <CircularProgress value={50} max={100} strokeWidth={8} />
    );
    expect(root).toBeTruthy();
  });

  it('should render with custom color', () => {
    const { root } = render(
      <CircularProgress value={50} max={100} color="#FF0000" />
    );
    expect(root).toBeTruthy();
  });

  it('should render with custom backgroundColor', () => {
    const { root } = render(
      <CircularProgress value={50} max={100} backgroundColor="rgba(0,0,0,0.2)" />
    );
    expect(root).toBeTruthy();
  });

  it('should show text by default', () => {
    const { getByText } = render(<CircularProgress value={50} max={100} />);
    expect(getByText('50%')).toBeTruthy();
  });

  it('should hide text when showText is false', () => {
    const { queryByText } = render(
      <CircularProgress value={50} max={100} showText={false} />
    );
    expect(queryByText('50%')).toBeNull();
  });

  it('should use custom formatText function', () => {
    const formatText = (value: number, _percentage: number) => `${value}/100`;
    const { getByText } = render(
      <CircularProgress value={50} max={100} formatText={formatText} />
    );
    expect(getByText('50/100')).toBeTruthy();
  });

  it('should handle 0 value', () => {
    const { getByText } = render(<CircularProgress value={0} max={100} />);
    expect(getByText('0%')).toBeTruthy();
  });

  it('should handle 100% value', () => {
    const { getByText } = render(<CircularProgress value={100} max={100} />);
    expect(getByText('100%')).toBeTruthy();
  });

  it('should cap value at 100%', () => {
    const { getByText } = render(<CircularProgress value={150} max={100} />);
    expect(getByText('100%')).toBeTruthy();
  });

  it('should handle negative values', () => {
    const { getByText } = render(<CircularProgress value={-10} max={100} />);
    expect(getByText('0%')).toBeTruthy();
  });

  it('should render with custom textStyle', () => {
    const textStyle = { fontWeight: '400' as const };
    const { root } = render(
      <CircularProgress value={50} max={100} textStyle={textStyle} />
    );
    expect(root).toBeTruthy();
  });

  it('should render with custom duration', () => {
    const { root } = render(
      <CircularProgress value={50} max={100} duration={2000} />
    );
    expect(root).toBeTruthy();
  });
});
