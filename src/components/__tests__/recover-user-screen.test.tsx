import { useUserRecovery } from '@/hooks/use-user-recovery';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { RecoverUserScreen } from '../auth/recover-user-screen';

// Mock Hooks
jest.mock('@/hooks/use-app-theme', () => ({
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

jest.mock('@/hooks/use-responsive-layout', () => ({
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
        View: View,
        createAnimatedComponent: (component: any) => component,
    },
    FadeInUp: {
        duration: () => ({ delay: () => ({}) }),
        springify: () => ({}),
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
    const { getByText } = render(<RecoverUserScreen onBack={mockOnBack} onSuccess={mockOnSuccess} />);
    expect(getByText('Recuperar Usuario')).toBeTruthy();
    expect(getByText('Ingresa tus datos para localizar tu usuario')).toBeTruthy();
  });

  it('validates missing document ID', async () => {
    const { getByText } = render(<RecoverUserScreen onBack={mockOnBack} onSuccess={mockOnSuccess} />);
    const submitBtn = getByText('Recuperar Usuario');
    
    fireEvent.press(submitBtn);

    expect(mockSetError).toHaveBeenCalledWith('Ingresa tu número de documento');
  });

  it('validates verification method requirements', async () => {
      // Test DOB validation (default)
      const { getByPlaceholderText, getByText } = render(<RecoverUserScreen onBack={mockOnBack} onSuccess={mockOnSuccess} />);
      // Input has placeholder "Ej. 1723456789" based on previous file read
      const docInput = getByPlaceholderText('Ej. 1723456789');
      fireEvent.changeText(docInput, '123456');

      const submitBtn = getByText('Recuperar Usuario');
      fireEvent.press(submitBtn);
      
      expect(mockSetError).toHaveBeenCalledWith('Ingresa tu fecha de nacimiento');
  });

  it('calls recoverUser with correct data upon success', async () => {
    mockRecoverUser.mockResolvedValue({
        success: true,
        username: 'foundUser',
        maskedEmail: 'f***@test.com'
    });

    const { getByPlaceholderText, getByText, findByText } = render(<RecoverUserScreen onBack={mockOnBack} onSuccess={mockOnSuccess} />);
    
    // Fill Document
    fireEvent.changeText(getByPlaceholderText('Ej. 1723456789'), '123456');
    
    // Fill DOB
    fireEvent.changeText(getByPlaceholderText('DD/MM/AAAA'), '01/01/1990');

    fireEvent.press(getByText('Recuperar Usuario'));

    await waitFor(() => {
        expect(mockRecoverUser).toHaveBeenCalledWith({
            documentType: 'CC', // Default
            documentId: '123456',
            birthDate: '01/01/1990',
            pin: undefined
        });
    });

    // Expect success screen
    const userText = await findByText('foundUser');
    expect(userText).toBeTruthy();
  });
});
