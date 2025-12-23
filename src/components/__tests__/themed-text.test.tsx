import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemedText } from '../themed-text';
import { useAppTheme } from '@/hooks/use-app-theme';

jest.mock('@/hooks/use-app-theme');

describe('ThemedText', () => {
  const mockTheme = {
    tenant: {
      mainColor: '#FF0000',
    },
    helpers: {
      getText: jest.fn((variant: string) => {
        const colors: Record<string, string> = {
          primary: '#000000',
          secondary: '#666666',
          tertiary: '#999999',
          disabled: '#CCCCCC',
          inverse: '#FFFFFF',
        };
        return colors[variant] || '#000000';
      }),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  describe('rendering', () => {
    it('should render text with default type and primary variant', () => {
      const { getByText } = render(<ThemedText>Hello World</ThemedText>);
      const text = getByText('Hello World');
      
      expect(text).toBeTruthy();
      expect(mockTheme.helpers.getText).toHaveBeenCalledWith('primary');
    });

    it('should render with title type', () => {
      const { getByText } = render(<ThemedText type="title">Title Text</ThemedText>);
      const text = getByText('Title Text');
      
      expect(text).toBeTruthy();
    });

    it('should render with subtitle type', () => {
      const { getByText } = render(<ThemedText type="subtitle">Subtitle Text</ThemedText>);
      const text = getByText('Subtitle Text');
      
      expect(text).toBeTruthy();
    });

    it('should render with defaultSemiBold type', () => {
      const { getByText } = render(<ThemedText type="defaultSemiBold">Bold Text</ThemedText>);
      const text = getByText('Bold Text');
      
      expect(text).toBeTruthy();
    });

    it('should render with link type using tenant main color', () => {
      const { getByText } = render(<ThemedText type="link">Link Text</ThemedText>);
      const text = getByText('Link Text');
      
      expect(text).toBeTruthy();
      expect(text.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ color: '#FF0000' })
        ])
      );
    });
  });

  describe('variants', () => {
    it('should apply primary variant color', () => {
      const { getByText } = render(<ThemedText variant="primary">Primary Text</ThemedText>);
      const text = getByText('Primary Text');
      
      expect(mockTheme.helpers.getText).toHaveBeenCalledWith('primary');
      expect(text.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ color: '#000000' })
        ])
      );
    });

    it('should apply secondary variant color', () => {
      const { getByText } = render(<ThemedText variant="secondary">Secondary Text</ThemedText>);
      const text = getByText('Secondary Text');
      
      expect(mockTheme.helpers.getText).toHaveBeenCalledWith('secondary');
      expect(text.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ color: '#666666' })
        ])
      );
    });

    it('should apply tertiary variant color', () => {
      const { getByText } = render(<ThemedText variant="tertiary">Tertiary Text</ThemedText>);
      getByText('Tertiary Text');
      
      expect(mockTheme.helpers.getText).toHaveBeenCalledWith('tertiary');
    });

    it('should apply disabled variant color', () => {
      const { getByText } = render(<ThemedText variant="disabled">Disabled Text</ThemedText>);
      getByText('Disabled Text');
      
      expect(mockTheme.helpers.getText).toHaveBeenCalledWith('disabled');
    });

    it('should apply inverse variant color', () => {
      const { getByText } = render(<ThemedText variant="inverse">Inverse Text</ThemedText>);
      getByText('Inverse Text');
      
      expect(mockTheme.helpers.getText).toHaveBeenCalledWith('inverse');
    });
  });

  describe('custom styling', () => {
    it('should merge custom styles with default styles', () => {
      const customStyle = { fontSize: 20, fontWeight: 'bold' as const };
      const { getByText } = render(
        <ThemedText style={customStyle}>Styled Text</ThemedText>
      );
      const text = getByText('Styled Text');
      
      expect(text.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining(customStyle)
        ])
      );
    });

    it('should accept all standard Text props', () => {
      const { getByText } = render(
        <ThemedText 
          numberOfLines={2}
          ellipsizeMode="tail"
          testID="custom-text"
        >
          Long Text
        </ThemedText>
      );
      const text = getByText('Long Text');
      
      expect(text.props.numberOfLines).toBe(2);
      expect(text.props.ellipsizeMode).toBe('tail');
      expect(text.props.testID).toBe('custom-text');
    });
  });

  describe('link type special behavior', () => {
    it('should use tenant main color for link type regardless of variant', () => {
      const { getByText } = render(
        <ThemedText type="link" variant="secondary">Link Text</ThemedText>
      );
      const text = getByText('Link Text');
      
      expect(text.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ color: '#FF0000' })
        ])
      );
      // getText should not be called for link type
      expect(mockTheme.helpers.getText).not.toHaveBeenCalled();
    });
  });
});
