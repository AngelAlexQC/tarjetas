import { fireEvent, render } from '@testing-library/react-native';
import { LoginScreen } from '../login-screen';

// Mock Hooks
jest.mock('@/hooks/use-app-theme', () => ({
  useAppTheme: () => ({
    colors: {
      background: '#ffffff',
      textSecondary: '#666666',
    },
    tenant: {
      mainColor: '#0000ff',
      branding: { images: {} }
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

jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    login: jest.fn(),
    getRememberedUsername: jest.fn().mockResolvedValue(null),
  }),
}));


// Mock UI Components
jest.mock('@/components/ui/themed-button', () => {
  const { View, Text } = require('react-native');
  return {
    ThemedButton: (props: any) => (
      <View testID="themed-button" {...props}>
        <Text>{props.title}</Text>
      </View>
    ),
  };
});

jest.mock('@/components/ui/themed-input', () => {
  const { View, Text } = require('react-native');
  return {
    ThemedInput: (props: any) => (
      <View testID="themed-input" {...props}>
         <Text>{props.label}</Text>
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

jest.mock('@/components/ui/auth-logo-header', () => {
  const { View } = require('react-native');
  return {
    AuthLogoHeader: () => <View testID="auth-logo-header" />,
  };
});

jest.mock('expo-image', () => {
  const { View } = require('react-native');
  return {
    ImageBackground: ({ children }: any) => <View>{children}</View>,
  };
});

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => 'Icon',
}));

jest.mock('lucide-react-native', () => ({
  LockKeyhole: () => 'Icon',
  Mail: () => 'Icon',
  User: () => 'Icon',
}));

describe('LoginScreen', () => {
  const mockOnLoginSuccess = jest.fn();
  const mockOnRecoverUser = jest.fn();
  const mockOnRegister = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = render(
      <LoginScreen 
        onLoginSuccess={mockOnLoginSuccess} 
        onRecoverUser={mockOnRecoverUser}
        onRegister={mockOnRegister}
      />
    );

    expect(getByText('Iniciar Sesión')).toBeTruthy();
    expect(getByText('Registrarme')).toBeTruthy();
    expect(getByText('Olvidé mi usuario')).toBeTruthy();
  });

  it('calls onRecoverUser when link is pressed', () => {
    const { getByText } = render(
      <LoginScreen 
        onLoginSuccess={mockOnLoginSuccess} 
        onRecoverUser={mockOnRecoverUser}
        onRegister={mockOnRegister}
      />
    );

    fireEvent.press(getByText('Olvidé mi usuario'));
    expect(mockOnRecoverUser).toHaveBeenCalled();
  });

  it('calls onRegister when register button is pressed', () => {
    const { getByText } = render(
      <LoginScreen 
        onLoginSuccess={mockOnLoginSuccess} 
        onRecoverUser={mockOnRecoverUser}
        onRegister={mockOnRegister}
      />
    );

    fireEvent.press(getByText('Registrarme'));
    expect(mockOnRegister).toHaveBeenCalled();
  });
});
