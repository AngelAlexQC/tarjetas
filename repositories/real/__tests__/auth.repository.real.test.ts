import { RealAuthRepository } from '../auth.repository.real';
import { httpClient } from '@/api/http-client';
import type { LoginRequest, RegisterRequest } from '../../schemas/auth.schema';

jest.mock('@/api/http-client');

describe('RealAuthRepository', () => {
  let repository: RealAuthRepository;

  beforeEach(() => {
    repository = new RealAuthRepository();
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse = {
        success: true,
        data: {
          token: 'mock-token',
          refreshToken: 'mock-refresh-token',
          user: {
            id: '1',
            email: 'test@example.com',
            name: 'Test User',
          },
        },
      };

      (httpClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await repository.login(loginRequest);

      expect(result).toEqual(mockResponse.data);
      expect(httpClient.post).toHaveBeenCalledWith(
        expect.any(String),
        loginRequest,
        { skipAuth: true }
      );
    });

    it('should throw error on failed login', async () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      const mockResponse = {
        success: false,
        error: 'Invalid credentials',
      };

      (httpClient.post as jest.Mock).mockResolvedValue(mockResponse);

      await expect(repository.login(loginRequest)).rejects.toThrow('Invalid credentials');
    });

    it('should throw generic error when no error message provided', async () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockResponse = {
        success: false,
      };

      (httpClient.post as jest.Mock).mockResolvedValue(mockResponse);

      await expect(repository.login(loginRequest)).rejects.toThrow('Error al iniciar sesión');
    });
  });

  describe('logout', () => {
    it('should call logout endpoint', async () => {
      (httpClient.post as jest.Mock).mockResolvedValue({ success: true });

      await repository.logout();

      expect(httpClient.post).toHaveBeenCalledWith(expect.any(String));
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh token', async () => {
      const mockResponse = {
        success: true,
        data: {
          token: 'new-mock-token',
        },
      };

      (httpClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await repository.refreshToken();

      expect(result).toBe('new-mock-token');
      expect(httpClient.post).toHaveBeenCalledWith(expect.any(String));
    });

    it('should throw error on failed refresh', async () => {
      const mockResponse = {
        success: false,
        error: 'Token expired',
      };

      (httpClient.post as jest.Mock).mockResolvedValue(mockResponse);

      await expect(repository.refreshToken()).rejects.toThrow('Token expired');
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user when successful', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      };

      const mockResponse = {
        success: true,
        data: mockUser,
      };

      (httpClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await repository.getCurrentUser();

      expect(result).toEqual(mockUser);
      expect(httpClient.get).toHaveBeenCalledWith(expect.any(String));
    });

    it('should return null on failed request', async () => {
      const mockResponse = {
        success: false,
      };

      (httpClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await repository.getCurrentUser();

      expect(result).toBeNull();
    });

    it('should return null when no data', async () => {
      const mockResponse = {
        success: true,
        data: null,
      };

      (httpClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await repository.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should successfully update profile', async () => {
      const updateData = {
        name: 'Updated Name',
      };

      const mockResponse = {
        success: true,
        data: {
          id: '1',
          email: 'test@example.com',
          name: 'Updated Name',
        },
      };

      (httpClient.put as jest.Mock).mockResolvedValue(mockResponse);

      const result = await repository.updateProfile(updateData);

      expect(result).toEqual(mockResponse.data);
      expect(httpClient.put).toHaveBeenCalledWith(
        expect.any(String),
        updateData
      );
    });

    it('should throw error on failed update', async () => {
      const updateData = {
        name: 'Updated Name',
      };

      const mockResponse = {
        success: false,
        error: 'Update failed',
      };

      (httpClient.put as jest.Mock).mockResolvedValue(mockResponse);

      await expect(repository.updateProfile(updateData)).rejects.toThrow('Update failed');
    });
  });

  describe('register', () => {
    it('should successfully register new user', async () => {
      const registerRequest: RegisterRequest = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        tenantId: 'tenant-1',
      };

      const mockResponse = {
        success: true,
        data: {
          user: {
            id: '2',
            email: 'newuser@example.com',
            name: 'New User',
          },
          requiresEmailVerification: true,
        },
      };

      (httpClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await repository.register(registerRequest);

      expect(result).toEqual(mockResponse.data);
      expect(httpClient.post).toHaveBeenCalledWith(
        expect.any(String),
        registerRequest,
        { skipAuth: true }
      );
    });
  });
});
