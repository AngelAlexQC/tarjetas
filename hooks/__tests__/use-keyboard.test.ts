import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useKeyboard } from '../use-keyboard';
import { Keyboard, Platform } from 'react-native';

jest.mock('react-native', () => ({
  Keyboard: {
    addListener: jest.fn(),
  },
  Platform: {
    OS: 'ios',
  },
}));

describe('useKeyboard', () => {
  let mockListeners: Record<string, (e?: any) => void> = {};

  beforeEach(() => {
    jest.clearAllMocks();
    mockListeners = {};

    (Keyboard.addListener as jest.Mock).mockImplementation((event, callback) => {
      mockListeners[event] = callback;
      return {
        remove: jest.fn(),
      };
    });
  });

  describe('iOS platform', () => {
    beforeAll(() => {
      Platform.OS = 'ios';
    });

    it('should initialize with keyboard hidden', () => {
      const { result } = renderHook(() => useKeyboard());

      expect(result.current.isKeyboardVisible).toBe(false);
      expect(result.current.keyboardHeight).toBe(0);
    });

    it('should show keyboard on keyboardWillShow event', () => {
      const { result } = renderHook(() => useKeyboard());

      act(() => {
        mockListeners['keyboardWillShow']?.({
          endCoordinates: { height: 350 },
        });
      });

      expect(result.current.isKeyboardVisible).toBe(true);
      expect(result.current.keyboardHeight).toBe(350);
    });

    it('should hide keyboard on keyboardWillHide event', () => {
      const { result } = renderHook(() => useKeyboard());

      act(() => {
        mockListeners['keyboardWillShow']?.({
          endCoordinates: { height: 350 },
        });
      });

      expect(result.current.isKeyboardVisible).toBe(true);

      act(() => {
        mockListeners['keyboardWillHide']?.();
      });

      expect(result.current.isKeyboardVisible).toBe(false);
      expect(result.current.keyboardHeight).toBe(0);
    });
  });

  describe('Android platform', () => {
    beforeAll(() => {
      Platform.OS = 'android';
    });

    afterAll(() => {
      Platform.OS = 'ios';
    });

    it('should use keyboardDidShow/Hide events on Android', () => {
      const { result } = renderHook(() => useKeyboard());

      act(() => {
        mockListeners['keyboardDidShow']?.({
          endCoordinates: { height: 300 },
        });
      });

      expect(result.current.isKeyboardVisible).toBe(true);
      expect(result.current.keyboardHeight).toBe(300);

      act(() => {
        mockListeners['keyboardDidHide']?.();
      });

      expect(result.current.isKeyboardVisible).toBe(false);
    });
  });

  describe('cleanup', () => {
    it('should remove listeners on unmount', () => {
      const removeMock = jest.fn();
      (Keyboard.addListener as jest.Mock).mockReturnValue({
        remove: removeMock,
      });

      const { unmount } = renderHook(() => useKeyboard());

      unmount();

      expect(removeMock).toHaveBeenCalledTimes(2);
    });
  });

  describe('multiple show/hide cycles', () => {
    it('should handle multiple keyboard show/hide cycles', () => {
      Platform.OS = 'ios';
      const { result } = renderHook(() => useKeyboard());

      act(() => {
        mockListeners['keyboardWillShow']?.({
          endCoordinates: { height: 300 },
        });
      });
      expect(result.current.isKeyboardVisible).toBe(true);

      act(() => {
        mockListeners['keyboardWillHide']?.();
      });
      expect(result.current.isKeyboardVisible).toBe(false);

      act(() => {
        mockListeners['keyboardWillShow']?.({
          endCoordinates: { height: 400 },
        });
      });
      expect(result.current.isKeyboardVisible).toBe(true);
      expect(result.current.keyboardHeight).toBe(400);
    });
  });
});
