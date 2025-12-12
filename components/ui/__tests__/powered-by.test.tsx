import React from 'react';
import { render } from '@testing-library/react-native';
import { PoweredBy } from '../powered-by';
import { useAppTheme } from '@/hooks/use-app-theme';

jest.mock('@/hooks/use-app-theme');
jest.mock('@/components/ui/dragonfly-logo', () => ({
  DragonflyLogo: () => null,
}));

describe('PoweredBy', () => {
  const mockTheme = {
    colors: {
      textTertiary: '#666666',
      textSecondary: '#999999',
    },
  };

  beforeEach(() => {
    (useAppTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  it('should render Powered by text', () => {
    const { getByText } = render(<PoweredBy />);
    expect(getByText('Powered by')).toBeTruthy();
  });

  it('should render LibélulaSoft brand', () => {
    const { getByText } = render(<PoweredBy />);
    expect(getByText(/Libélula/)).toBeTruthy();
    expect(getByText(/Soft/)).toBeTruthy();
  });

  it('should accept custom style', () => {
    const customStyle = { marginTop: 20 };
    const { root } = render(<PoweredBy style={customStyle} />);
    expect(root).toBeTruthy();
  });
});
