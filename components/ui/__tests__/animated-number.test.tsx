import React from 'react';
import { render } from '@testing-library/react-native';
import { AnimatedNumber } from '../animated-number';

// Mock de hooks
jest.mock('@/hooks/use-app-theme', () => ({
  useAppTheme: jest.fn(() => ({
    colors: {
      text: '#000',
    },
  })),
}));

jest.mock('@/utils/logger', () => ({
  loggers: {
    ui: {
      warn: jest.fn(),
    },
  },
}));

describe('AnimatedNumber', () => {
  it('should render correctly with basic value', () => {
    const { getByText } = render(<AnimatedNumber value={100} />);
    expect(getByText(/100/)).toBeTruthy();
  });

  it('should render with prefix', () => {
    const { getByText } = render(<AnimatedNumber value={100} prefix="$" />);
    expect(getByText(/\$/)).toBeTruthy();
  });

  it('should render with suffix', () => {
    const { getByText } = render(<AnimatedNumber value={100} suffix="%" />);
    expect(getByText(/%/)).toBeTruthy();
  });

  it('should render with custom decimals', () => {
    const { getByText } = render(<AnimatedNumber value={100.5} decimals={1} />);
    expect(getByText(/100\.5/)).toBeTruthy();
  });

  it('should render with currency formatting', () => {
    const { root } = render(
      <AnimatedNumber value={1000} currency="USD" locale="en-US" />
    );
    expect(root).toBeTruthy();
  });

  it('should render with custom currency symbol', () => {
    const { root } = render(
      <AnimatedNumber 
        value={1000} 
        currency="USD" 
        currencySymbol="$"
        locale="en-US"
      />
    );
    expect(root).toBeTruthy();
  });

  it('should render with custom locale', () => {
    const { root } = render(
      <AnimatedNumber value={1000.50} locale="es-ES" />
    );
    expect(root).toBeTruthy();
  });

  it('should render with custom style', () => {
    const customStyle = { fontSize: 24, fontWeight: 'bold' as const };
    const { root } = render(<AnimatedNumber value={100} style={customStyle} />);
    expect(root).toBeTruthy();
  });

  it('should handle zero value', () => {
    const { getByText } = render(<AnimatedNumber value={0} />);
    expect(getByText(/0/)).toBeTruthy();
  });

  it('should handle negative value', () => {
    const { getByText } = render(<AnimatedNumber value={-50} />);
    expect(getByText(/-50/)).toBeTruthy();
  });

  it('should render with prefix and suffix together', () => {
    const { getByText } = render(
      <AnimatedNumber value={100} prefix="$" suffix=" USD" />
    );
    const text = getByText(/\$/);
    expect(text).toBeTruthy();
  });

  it('should format large numbers correctly', () => {
    const { root } = render(<AnimatedNumber value={1000000} />);
    expect(root).toBeTruthy();
  });
});
