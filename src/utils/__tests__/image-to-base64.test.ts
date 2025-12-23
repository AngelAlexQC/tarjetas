import { convertImageToBase64, getLogoHtmlForPdf } from '../image-to-base64';

// Mock logging
jest.mock('@/core/logging', () => ({
  loggers: {
    ui: {
      error: jest.fn(),
    },
  },
}));

// Mock fetch
global.fetch = jest.fn();

// Store original FileReader
const OriginalFileReader = global.FileReader;

// Mock FileReader that resolves immediately
class MockFileReader {
  onloadend: (() => void) | null = null;
  onerror: ((error: Error) => void) | null = null;
  result: string | null = null;

  readAsDataURL(_blob: Blob) {
    // Resolve synchronously for tests
    this.result = 'data:image/png;base64,mockBase64Data';
    if (this.onloadend) {
      this.onloadend();
    }
  }
}

describe('convertImageToBase64', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.FileReader = MockFileReader as unknown as typeof FileReader;
  });

  afterAll(() => {
    global.FileReader = OriginalFileReader;
  });

  it('should convert image URL to base64 successfully', async () => {
    const mockBlob = new Blob(['test'], { type: 'image/png' });
    (global.fetch as jest.Mock).mockResolvedValue({
      blob: () => Promise.resolve(mockBlob),
    });

    const result = await convertImageToBase64('https://example.com/image.png');

    expect(result).toBe('data:image/png;base64,mockBase64Data');
    expect(global.fetch).toHaveBeenCalledWith('https://example.com/image.png');
  });

  it('should return null on fetch error', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const result = await convertImageToBase64('https://example.com/image.png');

    expect(result).toBeNull();
  });

  it('should handle FileReader error', async () => {
    const mockBlob = new Blob(['test'], { type: 'image/png' });
    (global.fetch as jest.Mock).mockResolvedValue({
      blob: () => Promise.resolve(mockBlob),
    });

    // Mock FileReader to trigger error synchronously
    class ErrorFileReader {
      onloadend: (() => void) | null = null;
      onerror: ((error: Error) => void) | null = null;

      readAsDataURL(_blob: Blob) {
        if (this.onerror) {
          this.onerror(new Error('FileReader error'));
        }
      }
    }

    global.FileReader = ErrorFileReader as unknown as typeof FileReader;

    await expect(convertImageToBase64('https://example.com/image.png')).rejects.toThrow();
  });
});

describe('getLogoHtmlForPdf', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.FileReader = MockFileReader as unknown as typeof FileReader;
  });

  afterAll(() => {
    global.FileReader = OriginalFileReader;
  });

  it('should return image HTML when logo URL is provided and conversion succeeds', async () => {
    const mockBlob = new Blob(['test'], { type: 'image/png' });
    (global.fetch as jest.Mock).mockResolvedValue({
      blob: () => Promise.resolve(mockBlob),
    });

    const result = await getLogoHtmlForPdf(
      'https://example.com/logo.png',
      'Test Bank',
      '#000000',
      40
    );

    expect(result).toContain('<img src="data:image/png;base64');
    expect(result).toContain('height: 40px');
  });

  it('should return text logo when logo URL is not provided', async () => {
    const result = await getLogoHtmlForPdf(
      undefined,
      'Test Bank',
      '#FF0000',
      40
    );

    expect(result).toContain('<div class="brand-logo"');
    expect(result).toContain('Test Bank');
    expect(result).toContain('color: #FF0000');
    expect(result).toContain('font-size: 24px');
  });

  it('should return text logo when image conversion fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const result = await getLogoHtmlForPdf(
      'https://example.com/logo.png',
      'Test Bank',
      '#00FF00',
      50
    );

    expect(result).toContain('<div class="brand-logo"');
    expect(result).toContain('Test Bank');
    expect(result).toContain('color: #00FF00');
  });

  it('should use custom height parameter', async () => {
    const result = await getLogoHtmlForPdf(
      undefined,
      'Test Bank',
      '#000000',
      60
    );

    expect(result).toContain('font-size: 36px'); // 60 * 0.6
  });

  it('should handle empty logo URL', async () => {
    const result = await getLogoHtmlForPdf(
      '',
      'Test Bank',
      '#000000'
    );

    expect(result).toContain('Test Bank');
  });
});
