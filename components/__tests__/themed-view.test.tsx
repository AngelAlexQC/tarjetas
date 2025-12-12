import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemedView } from '../themed-view';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Text } from 'react-native';

jest.mock('@/hooks/use-app-theme');

describe('ThemedView', () => {
  const mockTheme = {
    helpers: {
      getSurface: jest.fn((level: number) => {
        const colors: Record<number, string> = {
          0: '#FFFFFF',
          1: '#F5F5F5',
          2: '#EEEEEE',
          3: '#E0E0E0',
        };
        return colors[level] || '#FFFFFF';
      }),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  describe('rendering', () => {
    it('should render children correctly', () => {
      const { getByText } = render(
        <ThemedView>
          <Text>Child Component</Text>
        </ThemedView>
      );
      
      expect(getByText('Child Component')).toBeTruthy();
    });

    it('should apply default surface level 0', () => {
      const { root } = render(<ThemedView testID="themed-view" />);
      
      expect(mockTheme.helpers.getSurface).toHaveBeenCalledWith(0);
    });

    it('should apply surface level 1', () => {
      const { root } = render(<ThemedView surface={1} testID="themed-view" />);
      
      expect(mockTheme.helpers.getSurface).toHaveBeenCalledWith(1);
    });

    it('should apply surface level 2', () => {
      const { root } = render(<ThemedView surface={2} testID="themed-view" />);
      
      expect(mockTheme.helpers.getSurface).toHaveBeenCalledWith(2);
    });

    it('should apply surface level 3', () => {
      const { root } = render(<ThemedView surface={3} testID="themed-view" />);
      
      expect(mockTheme.helpers.getSurface).toHaveBeenCalledWith(3);
    });
  });

  describe('styling', () => {
    it('should apply background color from theme', () => {
      const { getByTestId } = render(<ThemedView testID="themed-view" />);
      const view = getByTestId('themed-view');
      
      expect(view.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ backgroundColor: '#FFFFFF' })
        ])
      );
    });

    it('should merge custom styles with theme styles', () => {
      const customStyle = { padding: 20, margin: 10 };
      const { getByTestId } = render(
        <ThemedView style={customStyle} testID="themed-view" />
      );
      const view = getByTestId('themed-view');
      
      expect(view.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ backgroundColor: '#FFFFFF' }),
          customStyle
        ])
      );
    });

    it('should allow overriding background color via style prop', () => {
      const customStyle = { backgroundColor: '#FF0000' };
      const { getByTestId } = render(
        <ThemedView style={customStyle} testID="themed-view" />
      );
      const view = getByTestId('themed-view');
      
      // Custom style should be applied after theme style
      expect(view.props.style).toEqual(
        expect.arrayContaining([
          customStyle
        ])
      );
    });
  });

  describe('surface levels', () => {
    it('should use different colors for different surface levels', () => {
      const { getByTestId: getByTestId0 } = render(
        <ThemedView surface={0} testID="surface-0" />
      );
      const { getByTestId: getByTestId1 } = render(
        <ThemedView surface={1} testID="surface-1" />
      );
      
      const view0 = getByTestId0('surface-0');
      const view1 = getByTestId1('surface-1');
      
      expect(view0.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ backgroundColor: '#FFFFFF' })
        ])
      );
      
      expect(view1.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ backgroundColor: '#F5F5F5' })
        ])
      );
    });
  });

  describe('props forwarding', () => {
    it('should forward all View props', () => {
      const { getByTestId } = render(
        <ThemedView 
          testID="themed-view"
          accessible={true}
          accessibilityLabel="Test View"
        />
      );
      const view = getByTestId('themed-view');
      
      expect(view.props.accessible).toBe(true);
      expect(view.props.accessibilityLabel).toBe('Test View');
    });
  });
});
