/**
 * Mock Auth Repository Tests
 */

import { MockAuthRepository } from '../auth.repository.mock';

jest.mock('@/core/http/config', () => ({
  API_CONFIG: {
    USE_MOCK_API: true,
    MOCK_DELAY: 10,
  },
}));

describe('MockAuthRepository', () => {
  let repository: MockAuthRepository;

  beforeEach(() => {
    repository = new MockAuthRepository();
    jest.useFakeTimers({ advanceTimers: true });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const result = await repository.login({
        username: 'testuser',
        password: 'password123',
      });
      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should return user with provided username', async () => {
      const result = await repository.login({
        username: 'myuser',
        password: 'password123',
      });
      expect(result.user.username).toBe('myuser');
      expect(result.user.email).toContain('myuser');
    });

    it('should throw for empty username', async () => {
      await expect(
        repository.login({ username: '', password: 'pass1234' })
      ).rejects.toThrow();
    });

    it('should throw for empty password', async () => {
      await expect(
        repository.login({ username: 'user', password: '' })
      ).rejects.toThrow();
    });

    it('should throw for short password', async () => {
      await expect(
        repository.login({ username: 'user', password: '123' })
      ).rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      await repository.login({ username: 'test', password: 'password' });
      await expect(repository.logout()).resolves.not.toThrow();
    });
  });

  describe('refreshToken', () => {
    it('should return a new token', async () => {
      const token = await repository.refreshToken();
      expect(token).toContain('mock_token_refreshed');
    });

    it('should return different tokens each call', async () => {
      const token1 = await repository.refreshToken();
      const token2 = await repository.refreshToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('getCurrentUser', () => {
    it('should return user after login', async () => {
      await repository.login({ username: 'testuser', password: 'password' });
      const user = await repository.getCurrentUser();
      expect(user?.username).toBe('testuser');
    });

    it('should return mock user when not logged in', async () => {
      const user = await repository.getCurrentUser();
      expect(user).toBeDefined();
      expect(user).toHaveProperty('id');
    });
  });

  describe('updateProfile', () => {
    it('should update profile', async () => {
      await repository.login({ username: 'test', password: 'password' });
      const user = await repository.updateProfile({ name: 'New Name' });
      expect(user.name).toBe('New Name');
    });

    it('should preserve existing data', async () => {
      await repository.login({ username: 'test', password: 'password' });
      const user = await repository.updateProfile({ name: 'New' });
      expect(user.username).toBe('test');
    });
  });
});
