import { convertImageToBase64, getLogoHtmlForPdf } from '../image-to-base64';

describe('image-to-base64', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('convertImageToBase64', () => {
    it('should convert image URL to base64 successfully', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });
      const mockBase64 = 'data:image/png;base64,dGVzdA==';

      global.fetch = jest.fn().mockResolvedValue({
        blob: () => Promise.resolve(mockBlob),
      });

      const mockFileReader = {
        readAsDataURL: jest.fn(),
        onloadend: jest.fn(),
        onerror: jest.fn(),
        result: mockBase64,
      };

      jest.spyOn(global, 'FileReader').mockImplementation(() => mockFileReader as any);

      const promise = convertImageToBase64('https://example.com/logo.png');
      
      // Simulate FileReader onloadend
      mockFileReader.onloadend?.();

      const result = await promise;
      expect(result).toBe(mockBase64);
      expect(global.fetch).toHaveBeenCalledWith('https://example.com/logo.png');
    });

    it('should return null on fetch error', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const result = await convertImageToBase64('https://example.com/logo.png');
      
      expect(result).toBeNull();
    });

    it('should return null on FileReader error', async () => {
      const mockBlob = new Blob(['test'], { type: 'image/png' });

      global.fetch = jest.fn().mockResolvedValue({
        blob: () => Promise.resolve(mockBlob),
      });

      const mockFileReader = {
        readAsDataURL: jest.fn(),
        onloadend: jest.fn(),
        onerror: jest.fn(),
      };

      jest.spyOn(global, 'FileReader').mockImplementation(() => mockFileReader as any);

      const promise = convertImageToBase64('https://example.com/logo.png');
      
      // Simulate FileReader onerror
      mockFileReader.onerror?.(new Error('FileReader error') as any);

      const result = await promise;
      expect(result).toBeNull();
    });
  });

  describe('getLogoHtmlForPdf', () => {
    it('should return image HTML when logo URL is provided and conversion succeeds', async () => {
      const mockBase64 = 'data:image/png;base64,dGVzdA==';
      
      jest.spyOn(global, 'fetch').mockResolvedValue({
        blob: () => Promise.resolve(new Blob(['test'], { type: 'image/png' })),
      } as any);

      const mockFileReader = {
        readAsDataURL: jest.fn(),
        onloadend: jest.fn(),
        onerror: jest.fn(),
        result: mockBase64,
      };

      jest.spyOn(global, 'FileReader').mockImplementation(() => mockFileReader as any);

      const promise = getLogoHtmlForPdf('https://example.com/logo.png', 'TestBank', '#FF0000', 50);
      
      // Simulate FileReader success
      mockFileReader.onloadend?.();

      const result = await promise;
      
      expect(result).toContain(`src="${mockBase64}"`);
      expect(result).toContain('height: 50px');
      expect(result).toContain('object-fit: contain');
    });

    it('should return fallback text HTML when logo URL is not provided', async () => {
      const result = await getLogoHtmlForPdf(undefined, 'TestBank', '#FF0000', 50);
      
      expect(result).toContain('TestBank');
      expect(result).toContain('color: #FF0000');
      expect(result).toContain('font-size: 30px');
      expect(result).toContain('text-transform: uppercase');
    });

    it('should return fallback text HTML when image conversion fails', async () => {
      jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

      const result = await getLogoHtmlForPdf('https://example.com/logo.png', 'TestBank', '#FF0000');
      
      expect(result).toContain('TestBank');
      expect(result).toContain('color: #FF0000');
    });

    it('should use default height when not specified', async () => {
      const result = await getLogoHtmlForPdf(undefined, 'TestBank', '#FF0000');
      
      expect(result).toContain('font-size: 24px'); // 40 * 0.6 = 24
    });
  });
});
