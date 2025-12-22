import { fireEvent, render } from '@testing-library/react-native';
import { NameInputScreen } from '../name-input-screen';

// Mock Hooks
jest.mock('@/hooks/use-app-theme', () => ({
  useAppTheme: () => ({
    colors: {
      background: '#ffffff',
      textSecondary: '#666666',
    },
    tenant: {
      mainColor: '#0000ff',
    },
  }),
}));

jest.mock('@/hooks/use-responsive-layout', () => ({
  useResponsiveLayout: () => ({
    screenWidth: 375,
    horizontalPadding: 20,
  }),
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0 }),
}));

jest.mock('react-native-reanimated', () => {
  const { View } = require('react-native');
  return {
    default: {
      View,
      createAnimatedComponent: (component: any) => component,
    },
    View,
    FadeInUp: {
      duration: () => ({ delay: () => ({}) }),
      springify: () => ({}),
      delay: () => ({ duration: () => ({}) }),
    },
    FadeInDown: {
      duration: () => ({ delay: () => ({}) }),
      delay: () => ({ duration: () => ({}) }),
    },
  };
});


// Mock UI Components
jest.mock('@/components/ui/themed-button', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return {
    ThemedButton: (props: any) => (
      <TouchableOpacity testID="themed-button" onPress={props.onPress} disabled={props.disabled} {...props}>
          <Text>{props.title}</Text>
      </TouchableOpacity>
    ),
  };
});

jest.mock('@/components/ui/themed-input', () => {
  const { View, Text, TextInput } = require('react-native');
  return {
    ThemedInput: (props: any) => (
      <View testID="themed-input-container">
          <Text>{props.label}</Text>
          <TextInput {...props} />
      </View>
    ),
  };
});

jest.mock('@/components/themed-text', () => {
  const { Text } = require('react-native');
  return {
    ThemedText: ({ children, ...props }: any) => <Text {...props}>{children}</Text>,
  };
});

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => 'Icon',
}));

describe('NameInputScreen', () => {
  const mockOnContinue = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = render(<NameInputScreen onContinue={mockOnContinue} />);
    expect(getByText('¡Hola!')).toBeTruthy();
    expect(getByText('¿Cómo te gustaría que te llamemos?')).toBeTruthy();
  });

  it('disables continue button when input is empty', () => {
    const { getByTestId } = render(<NameInputScreen onContinue={mockOnContinue} />);
    const button = getByTestId('themed-button');
    // TouchableOpacity sets accessibilityState.disabled when disabled prop is true
    expect(button.props.accessibilityState?.disabled).toBe(true);
  });

  it('enables continue button when input has text', () => {
    const { getByPlaceholderText, getByTestId } = render(<NameInputScreen onContinue={mockOnContinue} />);
    
    const input = getByPlaceholderText('Ej. Sofía');
    fireEvent.changeText(input, 'Sofia');

    const button = getByTestId('themed-button');
    // When disabled=false, accessibilityState.disabled should be false or undefined
    expect(button.props.accessibilityState?.disabled).toBeFalsy();
  });

  it('calls onContinue with trimmed name', () => {
    const { getByPlaceholderText, getByText } = render(<NameInputScreen onContinue={mockOnContinue} />);
    
    const input = getByPlaceholderText('Ej. Sofía');
    fireEvent.changeText(input, '  Sofia  ');

    const button = getByText('Continuar');
    fireEvent.press(button);

    expect(mockOnContinue).toHaveBeenCalledWith('Sofia');
  });
});
