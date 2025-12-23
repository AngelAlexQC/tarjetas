import { renderHook } from '@testing-library/react-native';
import { useResponsiveLayout } from '../use-responsive-layout';
import { useWindowDimensions } from 'react-native';

jest.mock('react-native', () => ({
  useWindowDimensions: jest.fn(),
}));

describe('useResponsiveLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('small screen (portrait)', () => {
    it('should detect small screen in portrait', () => {
      (useWindowDimensions as jest.Mock).mockReturnValue({ width: 350, height: 600 });

      const { result } = renderHook(() => useResponsiveLayout());

      expect(result.current.isSmall).toBe(true);
      expect(result.current.isMedium).toBe(false);
      expect(result.current.isLarge).toBe(false);
      expect(result.current.isPortrait).toBe(true);
      expect(result.current.isLandscape).toBe(false);
      expect(result.current.orientation).toBe('portrait');
    });
  });

  describe('medium screen (tablet portrait)', () => {
    it('should detect medium screen', () => {
      (useWindowDimensions as jest.Mock).mockReturnValue({ width: 600, height: 800 });

      const { result } = renderHook(() => useResponsiveLayout());

      expect(result.current.isSmall).toBe(false);
      expect(result.current.isMedium).toBe(true);
      expect(result.current.isLarge).toBe(false);
    });
  });

  describe('large screen (tablet/desktop)', () => {
    it('should detect large screen', () => {
      (useWindowDimensions as jest.Mock).mockReturnValue({ width: 1024, height: 768 });

      const { result } = renderHook(() => useResponsiveLayout());

      expect(result.current.isSmall).toBe(false);
      expect(result.current.isMedium).toBe(false);
      expect(result.current.isLarge).toBe(true);
      expect(result.current.contentMaxWidth).not.toBe('100%');
    });
  });

  describe('landscape orientation', () => {
    it('should detect landscape orientation', () => {
      (useWindowDimensions as jest.Mock).mockReturnValue({ width: 800, height: 600 });

      const { result } = renderHook(() => useResponsiveLayout());

      expect(result.current.isLandscape).toBe(true);
      expect(result.current.isPortrait).toBe(false);
      expect(result.current.orientation).toBe('landscape');
    });
  });

  describe('dimensions', () => {
    it('should return correct screen dimensions', () => {
      (useWindowDimensions as jest.Mock).mockReturnValue({ width: 375, height: 812 });

      const { result } = renderHook(() => useResponsiveLayout());

      expect(result.current.screenWidth).toBe(375);
      expect(result.current.screenHeight).toBe(812);
    });
  });

  describe('padding', () => {
    it('should have different padding for different screen sizes', () => {
      (useWindowDimensions as jest.Mock).mockReturnValue({ width: 350, height: 600 });
      const { result: smallResult } = renderHook(() => useResponsiveLayout());
      const smallPadding = smallResult.current.horizontalPadding;

      (useWindowDimensions as jest.Mock).mockReturnValue({ width: 768, height: 1024 });
      const { result: largeResult } = renderHook(() => useResponsiveLayout());
      const largePadding = largeResult.current.horizontalPadding;

      expect(smallPadding).toBeDefined();
      expect(largePadding).toBeDefined();
    });
  });

  describe('content max width', () => {
    it('should set max width for large screens', () => {
      (useWindowDimensions as jest.Mock).mockReturnValue({ width: 1200, height: 800 });

      const { result } = renderHook(() => useResponsiveLayout());

      expect(result.current.isLarge).toBe(true);
      expect(result.current.contentMaxWidth).not.toBe('100%');
    });

    it('should use 100% width for small screens', () => {
      (useWindowDimensions as jest.Mock).mockReturnValue({ width: 350, height: 600 });

      const { result } = renderHook(() => useResponsiveLayout());

      expect(result.current.contentMaxWidth).toBe('100%');
    });
  });
});
