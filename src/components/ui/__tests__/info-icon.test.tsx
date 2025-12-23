import React from 'react';
import { render } from '@testing-library/react-native';
import { InfoIcon } from '../info-icon';

// Mock de hooks
jest.mock('@/hooks/use-app-theme', () => ({
  useAppTheme: jest.fn(() => ({
    colors: {
      textSecondary: '#666',
    },
  })),
}));

describe('InfoIcon', () => {
  it('should render correctly with default props', () => {
    const { root } = render(<InfoIcon />);
    expect(root).toBeTruthy();
  });

  it('should render with custom size', () => {
    const { root } = render(<InfoIcon size={24} />);
    expect(root).toBeTruthy();
  });

  it('should render with custom color', () => {
    const { root } = render(<InfoIcon color="#FF0000" />);
    expect(root).toBeTruthy();
  });

  it('should render with custom opacity', () => {
    const { root } = render(<InfoIcon opacity={0.8} />);
    expect(root).toBeTruthy();
  });

  it('should render with all custom props', () => {
    const { root } = render(
      <InfoIcon size={32} color="#00FF00" opacity={1} />
    );
    expect(root).toBeTruthy();
  });
});
