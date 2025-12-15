import { render } from '@testing-library/react-native';
import React from 'react';
import { LoadingScreen } from '../loading-screen';

// Mock useAppTheme for ThemedText and ThemedView
jest.mock('@/hooks/use-app-theme', () => ({
  useAppTheme: jest.fn(() => ({
    tenant: {
      mainColor: '#007AFF',
    },
    colors: {
      background: '#FFFFFF',
      text: '#000000',
    },
    helpers: {
      getText: jest.fn(() => '#000000'),
      getSurface: jest.fn(() => '#FFFFFF'),
    },
  })),
}));

// react-native-reanimated está mockeado globalmente en jest.setup.ts

describe('LoadingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly with default props', () => {
    const { getByText } = render(<LoadingScreen />);
    expect(getByText('Cargando...')).toBeTruthy();
  });

  it('should render with custom message', () => {
    const { getByText } = render(<LoadingScreen message="Por favor espera..." />);
    expect(getByText('Por favor espera...')).toBeTruthy();
  });

  it('should not show message when showMessage is false', () => {
    const { queryByText } = render(<LoadingScreen showMessage={false} />);
    expect(queryByText('Cargando...')).toBeNull();
  });

  it('should show message when showMessage is true', () => {
    const { getByText } = render(<LoadingScreen showMessage={true} />);
    expect(getByText('Cargando...')).toBeTruthy();
  });

  it('should render with custom message and showMessage true', () => {
    const { getByText } = render(
      <LoadingScreen message="Procesando..." showMessage={true} />
    );
    expect(getByText('Procesando...')).toBeTruthy();
  });

  it('should render correctly with all default values', () => {
    const { root } = render(<LoadingScreen />);
    expect(root).toBeTruthy();
  });
});
