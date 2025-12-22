import { useUserRecovery } from '@/hooks/use-user-recovery';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { RecoverUserScreen } from '../auth/recover-user-screen';

// Mock Hooks
jest.mock('@/ui/theming/use-app-theme', () => ({
  useAppTheme: () => ({
    colors: {
      background: '#ffffff',
      surface: '#ffffff',
      text: '#000000',
      textSecondary: '#666666',
      border: '#eeeeee',
      error: '#ff0000',
    },
    tenant: {
      mainColor: '#0000ff',
    },
  }),
}));

jest.mock('@/contexts/tenant-theme-context', () => ({
  useTenantTheme: () => ({
    currentTheme: {
      features: {
        auth: {
          allowedDocumentTypes: ['CC', 'CE', 'PAS'],
        },
      },
    },
  }),
}));

jest.mock('@/ui/theming/use-responsive-layout', () => ({
  useResponsiveLayout: () => ({
    screenWidth: 375,
    horizontalPadding: 20,
  }),
}));

jest.mock('@/hooks/use-user-recovery', () => ({
  useUserRecovery: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
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
jest.mock('@/ui/primitives/themed-button', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return {
    ThemedButton: (props: any) => (
      <TouchableOpacity testID="themed-button" onPress={props.onPress} disabled={props.disabled} {...props}>
          <Text>{props.title}</Text>
      </TouchableOpacity>
    ),
  };
});

jest.mock('@/ui/primitives/themed-input', () => {
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

jest.mock('@/ui/primitives/themed-text', () => {
  const { Text } = require('react-native');
  return {
    ThemedText: ({ children, ...props }: any) => <Text {...props}>{children}</Text>,
  };
});

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => 'Icon',
}));

describe('RecoverUserScreen', () => {
  const mockRecoverUser = jest.fn();
  const mockSetError = jest.fn();
  const mockOnBack = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useUserRecovery as jest.Mock).mockReturnValue({
      recoverUser: mockRecoverUser,
      isLoading: false,
      error: null,
      setError: mockSetError,
    });
  });

  it('renders correctly', () => {
    const { getAllByText, getByText } = render(<RecoverUserScreen onBack={mockOnBack} onSuccess={mockOnSuccess} />);
    // "Recuperar Usuario" appears as both title and button
    const elements = getAllByText('Recuperar Usuario');
    expect(elements.length).toBeGreaterThanOrEqual(1);
    expect(getByText('Ingresa tus datos para localizar tu usuario')).toBeTruthy();
  });

  it('validates missing document ID', async () => {
    const { getAllByText } = render(<RecoverUserScreen onBack={mockOnBack} onSuccess={mockOnSuccess} />);
    // Get the button (second element with this text)
    const elements = getAllByText('Recuperar Usuario');
    const submitBtn = elements[elements.length - 1]; // Button is the last one
    
    fireEvent.press(submitBtn);

    expect(mockSetError).toHaveBeenCalledWith('Ingresa tu número de documento');
  });

  it('validates verification method requirements', async () => {
      const { getByPlaceholderText, getAllByText } = render(<RecoverUserScreen onBack={mockOnBack} onSuccess={mockOnSuccess} />);
      const docInput = getByPlaceholderText('Ej. 1723456789');
      fireEvent.changeText(docInput, '123456');

      const elements = getAllByText('Recuperar Usuario');
      const submitBtn = elements[elements.length - 1];
      fireEvent.press(submitBtn);
      
      expect(mockSetError).toHaveBeenCalledWith('Ingresa tu fecha de nacimiento');
  });

  it('calls recoverUser with correct data upon success', async () => {
    mockRecoverUser.mockResolvedValue({
        success: true,
        username: 'foundUser',
        maskedEmail: 'f***@test.com'
    });

    const { getByPlaceholderText, getAllByText } = render(<RecoverUserScreen onBack={mockOnBack} onSuccess={mockOnSuccess} />);
    
    // Fill Document
    fireEvent.changeText(getByPlaceholderText('Ej. 1723456789'), '123456');
    
    // Fill DOB
    fireEvent.changeText(getByPlaceholderText('DD/MM/AAAA'), '01/01/1990');

    const elements = getAllByText('Recuperar Usuario');
    fireEvent.press(elements[elements.length - 1]);

    await waitFor(() => {
        expect(mockRecoverUser).toHaveBeenCalledWith({
            documentType: 'CC',
            documentId: '123456',
            birthDate: '01/01/1990',
            pin: undefined
        });
    });
  });
});

