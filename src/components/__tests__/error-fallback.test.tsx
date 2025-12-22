/**
 * ErrorFallback Component Tests
 */

import { fireEvent, render } from '@test-utils';
import React from 'react';
import { ErrorFallback } from '../error-fallback';

// Mock de los hooks
jest.mock('@/ui/theming/use-app-theme', () => ({
  useAppTheme: () => ({
    colors: {
      background: '#FFFFFF',
      text: '#000000',
      textSecondary: '#666666',
      surfaceHigher: '#F5F5F5',
      border: '#E0E0E0',
    },
    tenant: {
      mainColor: '#007AFF',
    },
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Silenciar el logger durante los tests
jest.mock('@/core/logging/logger', () => ({
  createLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
  loggers: {
    ui: {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    },
  },
}));

describe('ErrorFallback', () => {
  const mockRetry = jest.fn();
  const mockError = new Error('Test error message');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render error message', () => {
    const { getByText } = render(
      <ErrorFallback error={mockError} retry={mockRetry} />
    );

    // En desarrollo muestra el mensaje real
    expect(getByText('Test error message')).toBeTruthy();
  });

  it('should render default title', () => {
    const { getByText } = render(
      <ErrorFallback error={mockError} retry={mockRetry} />
    );

    expect(getByText('Algo salió mal')).toBeTruthy();
  });

  it('should render custom title', () => {
    const { getByText } = render(
      <ErrorFallback error={mockError} retry={mockRetry} title="Custom Title" />
    );

    expect(getByText('Custom Title')).toBeTruthy();
  });

  it('should call retry when button is pressed', () => {
    const { getByText } = render(
      <ErrorFallback error={mockError} retry={mockRetry} />
    );

    fireEvent.press(getByText('Intentar de nuevo'));

    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it('should not show home button by default', () => {
    const { queryByText } = render(
      <ErrorFallback error={mockError} retry={mockRetry} />
    );

    expect(queryByText('Ir al inicio')).toBeNull();
  });

  it('should show home button when showHomeButton is true', () => {
    const mockGoHome = jest.fn();
    const { getByText } = render(
      <ErrorFallback
        error={mockError}
        retry={mockRetry}
        showHomeButton
        onGoHome={mockGoHome}
      />
    );

    expect(getByText('Ir al inicio')).toBeTruthy();
  });

  it('should call onGoHome when home button is pressed', () => {
    const mockGoHome = jest.fn();
    const { getByText } = render(
      <ErrorFallback
        error={mockError}
        retry={mockRetry}
        showHomeButton
        onGoHome={mockGoHome}
      />
    );

    fireEvent.press(getByText('Ir al inicio'));

    expect(mockGoHome).toHaveBeenCalledTimes(1);
  });
});
