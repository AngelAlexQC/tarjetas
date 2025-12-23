import { useAppTheme } from '@/hooks/use-app-theme';
import { fireEvent, render } from '@testing-library/react-native';
import { Search } from 'lucide-react-native';
import React from 'react';
import { ThemedInput } from '../themed-input';

// Mock dependencies
jest.mock('@/hooks/use-app-theme');

jest.mock('lucide-react-native', () => ({
  Search: () => 'SearchIcon',
}));

describe('ThemedInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAppTheme as jest.Mock).mockReturnValue({
      colors: {
        surface: '#FFFFFF',
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
    const { root } = render(<ThemedInput placeholder="Enter text" />);
    expect(root).toBeTruthy();
  });

  it('should render with label', () => {
    const { getByText } = render(
      <ThemedInput label="Email" placeholder="Enter email" />
    );
    expect(getByText('Email')).toBeTruthy();
  });

  it('should render with icon', () => {
    const { root } = render(
      <ThemedInput placeholder="Search" icon={<Search />} />
    );
    expect(root).toBeTruthy();
  });

  it('should render error message', () => {
    const { getByText } = render(
      <ThemedInput placeholder="Email" error="Invalid email address" />
    );
    expect(getByText('Invalid email address')).toBeTruthy();
  });

  it('should not render error when not provided', () => {
    const { queryByText } = render(<ThemedInput placeholder="Email" />);
    expect(queryByText('Invalid email')).toBeNull();
  });

  it('should handle text input', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <ThemedInput 
        placeholder="Enter text" 
        onChangeText={onChangeText}
      />
    );
    fireEvent.changeText(getByPlaceholderText('Enter text'), 'Hello');
    expect(onChangeText).toHaveBeenCalledWith('Hello');
  });

  it('should render with containerStyle', () => {
    const containerStyle = { marginTop: 20 };
    const { root } = render(
      <ThemedInput placeholder="Text" containerStyle={containerStyle} />
    );
    expect(root).toBeTruthy();
  });

  it('should render with input style', () => {
    const inputStyle = { fontSize: 18 };
    const { root } = render(
      <ThemedInput placeholder="Text" style={inputStyle} />
    );
    expect(root).toBeTruthy();
  });

  it('should render with all props combined', () => {
    const { getByText, getByPlaceholderText } = render(
      <ThemedInput 
        label="Username"
        placeholder="Enter username"
        icon={<Search />}
        containerStyle={{ marginBottom: 20 }}
      />
    );
    expect(getByText('Username')).toBeTruthy();
    expect(getByPlaceholderText('Enter username')).toBeTruthy();
  });

  it('should pass through TextInput props', () => {
    const { getByPlaceholderText } = render(
      <ThemedInput 
        placeholder="Password"
        secureTextEntry
        autoCapitalize="none"
      />
    );
    expect(getByPlaceholderText('Password')).toBeTruthy();
  });

  it('should render with value prop', () => {
    const { getByDisplayValue } = render(
      <ThemedInput placeholder="Text" value="Test value" />
    );
    expect(getByDisplayValue('Test value')).toBeTruthy();
  });
});
