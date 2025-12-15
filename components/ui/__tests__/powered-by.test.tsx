import { useAppTheme } from '@/hooks/use-app-theme';
import { render } from '@testing-library/react-native';
import React from 'react';
import { PoweredBy } from '../powered-by';

// Mock dependencies
jest.mock('@/hooks/use-app-theme');

// react-native-reanimated está mockeado globalmente en jest.setup.ts

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
