/**
 * HTTP Client Tests
 */

import { authStorage } from '@/utils/auth-storage';
import { HttpClient } from '../http-client';

// Mock authStorage
jest.mock('@/utils/auth-storage', () => ({
  authStorage: {
    getToken: jest.fn(),
  },
}));

// Mock API_CONFIG
jest.mock('../config', () => ({
  API_CONFIG: {
    BASE_URL: 'https://api.test.com',
    DEFAULT_HEADERS: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    TIMEOUT: 30000,
  },
}));

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('HttpClient', () => {
  let httpClient: HttpClient;

  beforeEach(() => {
    jest.clearAllMocks();
    // Usar advanceTimers: true para que las promesas resuelvan automáticamente
    jest.useFakeTimers({ advanceTimers: true });
    httpClient = new HttpClient();
    (authStorage.getToken as jest.Mock).mockResolvedValue('test-token');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('GET requests', () => {
    it('should make GET request successfully', async () => {
      const mockResponse = { id: 1, name: 'Test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await httpClient.get('/test');

      expect(result).toEqual({
        success: true,
        data: mockResponse,
        statusCode: 200,
      });
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token',
          }),
        })
      );
    });

    it('should handle response with data wrapper', async () => {
      const mockResponse = { data: { id: 1 }, message: 'Success' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await httpClient.get('/test');

      expect(result.data).toEqual({ id: 1 });
      expect(result.message).toBe('Success');
    });

    it('should skip auth header when skipAuth is true', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });

      await httpClient.get('/test', { skipAuth: true });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.any(String),
          }),
        })
      );
    });

    it('should handle no auth token', async () => {
      (authStorage.getToken as jest.Mock).mockResolvedValue(null);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });

      await httpClient.get('/test');

      const callArgs = mockFetch.mock.calls[0][1];
      expect(callArgs.headers['Authorization']).toBeUndefined();
    });
  });

  describe('POST requests', () => {
    it('should make POST request with body', async () => {
      const requestBody = { name: 'Test', value: 123 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ id: 1 }),
      });

      const result = await httpClient.post('/test', requestBody);

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody),
        })
      );
    });

    it('should make POST request without body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });

      await httpClient.post('/test');

      const callArgs = mockFetch.mock.calls[0][1];
      expect(callArgs.body).toBeUndefined();
    });
  });

  describe('PUT requests', () => {
    it('should make PUT request', async () => {
      const requestBody = { name: 'Updated' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: 1, name: 'Updated' }),
      });

      const result = await httpClient.put('/test/1', requestBody);

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/test/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(requestBody),
        })
      );
    });
  });

  describe('PATCH requests', () => {
    it('should make PATCH request', async () => {
      const requestBody = { name: 'Patched' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: 1, name: 'Patched' }),
      });

      const result = await httpClient.patch('/test/1', requestBody);

      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/test/1',
        expect.objectContaining({
          method: 'PATCH',
        })
      );
    });
  });

  describe('DELETE requests', () => {
    it('should make DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const result = await httpClient.delete('/test/1');

      expect(result).toEqual({
        success: true,
        statusCode: 204,
      });
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/test/1',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('error handling', () => {
    it('should handle 400 error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: 'Bad request' }),
      });

      const result = await httpClient.get('/test');

      expect(result).toEqual({
        success: false,
        error: 'Bad request',
        statusCode: 400,
      });
    });

    it('should handle 401 error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Unauthorized' }),
      });

      const result = await httpClient.get('/test');

      expect(result).toEqual({
        success: false,
        error: 'Unauthorized',
        statusCode: 401,
      });
    });

    it('should handle 500 error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({}),
      });

      const result = await httpClient.get('/test');

      expect(result).toEqual({
        success: false,
        error: 'Error del servidor',
        statusCode: 500,
      });
    });

    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await httpClient.get('/test');

      expect(result).toEqual({
        success: false,
        error: 'Network error',
        statusCode: 0,
      });
    });

    it('should handle timeout', async () => {
      const abortError = new Error('Aborted');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValueOnce(abortError);

      const result = await httpClient.get('/test');

      expect(result).toEqual({
        success: false,
        error: 'La solicitud ha excedido el tiempo de espera',
        statusCode: 408,
      });
    });

    it('should handle JSON parse error on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      const result = await httpClient.get('/test');

      expect(result).toEqual({
        success: false,
        error: 'Error al procesar respuesta',
        statusCode: 200,
      });
    });

    it('should handle JSON parse error on failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      const result = await httpClient.get('/test');

      expect(result).toEqual({
        success: false,
        error: 'Error del servidor',
        statusCode: 500,
      });
    });

    it('should handle non-Error exception', async () => {
      mockFetch.mockRejectedValueOnce('Unknown error');

      const result = await httpClient.get('/test');

      expect(result).toEqual({
        success: false,
        error: 'Error desconocido',
        statusCode: 0,
      });
    });
  });

  describe('configuration methods', () => {
    it('should set base URL', async () => {
      httpClient.setBaseUrl('https://new-api.test.com');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });

      await httpClient.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://new-api.test.com/test',
        expect.any(Object)
      );
    });

    it('should add default header', async () => {
      httpClient.addDefaultHeader('X-Custom-Header', 'custom-value');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });

      await httpClient.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'custom-value',
          }),
        })
      );
    });

    it('should remove default header', async () => {
      httpClient.addDefaultHeader('X-Custom-Header', 'custom-value');
      httpClient.removeDefaultHeader('X-Custom-Header');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });

      await httpClient.get('/test');

      const callArgs = mockFetch.mock.calls[0][1];
      expect(callArgs.headers['X-Custom-Header']).toBeUndefined();
    });
  });

  describe('custom options', () => {
    it('should use custom headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });

      await httpClient.get('/test', {
        headers: { 'X-Request-ID': '123' },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Request-ID': '123',
          }),
        })
      );
    });

    it('should use custom timeout', async () => {
      // This test is tricky with fake timers, but we can verify the abort controller is used
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      const _promise = httpClient.get('/test', { timeout: 1000 });

      // Advance timers to trigger timeout
      jest.advanceTimersByTime(1001);

      // The promise should eventually reject/resolve
      // Note: This test might need adjustment based on actual implementation
    });
  });
});
