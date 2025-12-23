import { useAppTheme } from '@/hooks/use-app-theme';
import { fireEvent, render } from '@testing-library/react-native';
import { CreditCard } from 'lucide-react-native';
import React from 'react';
import { OptionCard } from '../option-card';

// Mock dependencies
jest.mock('@/hooks/use-app-theme');

jest.mock('lucide-react-native', () => ({
  Check: 'Check',
  CreditCard: () => 'CreditCardIcon',
}));

describe('OptionCard', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppTheme as jest.Mock).mockReturnValue({
      colors: {
        surface: '#FFFFFF',
        surfaceHigher: '#F5F5F5',
        border: '#E0E0E0',
        text: '#000000',
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

  it('should render correctly with basic props', () => {
    const { getByText } = render(
      <OptionCard title="Option 1" onPress={mockOnPress} />
    );
    expect(getByText('Option 1')).toBeTruthy();
  });

  it('should render with description', () => {
    const { getByText } = render(
      <OptionCard 
        title="Option 1" 
        description="This is a description"
        onPress={mockOnPress} 
      />
    );
    expect(getByText('This is a description')).toBeTruthy();
  });

  it('should render with icon', () => {
    const { root } = render(
      <OptionCard 
        title="Option 1" 
        icon={<CreditCard />}
        onPress={mockOnPress} 
      />
    );
    expect(root).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const { getByText } = render(
      <OptionCard title="Option 1" onPress={mockOnPress} />
    );
    fireEvent.press(getByText('Option 1'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should render selected state', () => {
    const { root } = render(
      <OptionCard title="Option 1" selected onPress={mockOnPress} />
    );
    expect(root).toBeTruthy();
  });

  it('should render unselected state', () => {
    const { root } = render(
      <OptionCard title="Option 1" selected={false} onPress={mockOnPress} />
    );
    expect(root).toBeTruthy();
  });

  it('should render with custom style', () => {
    const customStyle = { marginTop: 20 };
    const { root } = render(
      <OptionCard title="Option 1" onPress={mockOnPress} style={customStyle} />
    );
    expect(root).toBeTruthy();
  });

  it('should render with rightElement', () => {
    const { root } = render(
      <OptionCard 
        title="Option 1" 
        onPress={mockOnPress}
        rightElement={<></>}
      />
    );
    expect(root).toBeTruthy();
  });

  it('should render with iconColor', () => {
    const { root } = render(
      <OptionCard 
        title="Option 1" 
        icon={<CreditCard />}
        iconColor="#FF0000"
        onPress={mockOnPress} 
      />
    );
    expect(root).toBeTruthy();
  });

  it('should render with all props combined', () => {
    const { getByText, root } = render(
      <OptionCard 
        title="Option 1" 
        description="Description"
        icon={<CreditCard />}
        iconColor="#FF0000"
        selected
        onPress={mockOnPress} 
        style={{ padding: 10 }}
      />
    );
    expect(root).toBeTruthy();
    expect(getByText('Option 1')).toBeTruthy();
    expect(getByText('Description')).toBeTruthy();
  });
});
