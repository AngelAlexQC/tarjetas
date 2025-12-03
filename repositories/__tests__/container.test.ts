/**
 * Repository Container Tests
 */

import { RepositoryContainer, cardRepository$, authRepository$ } from '../container';
import { MockCardRepository } from '../mock/card.repository.mock';
import { MockAuthRepository } from '../mock/auth.repository.mock';

// Mock the API_CONFIG
jest.mock('@/api/config', () => ({
  API_CONFIG: {
    USE_MOCK_API: true,
    BASE_URL: 'https://mock.api.com',
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
  },
}));

describe('RepositoryContainer', () => {
  beforeEach(() => {
    // Reset the container before each test
    RepositoryContainer.reset();
  });

  describe('getCardRepository', () => {
    it('should return a card repository', () => {
      const repo = RepositoryContainer.getCardRepository();

      expect(repo).toBeDefined();
      expect(typeof repo.getCards).toBe('function');
      expect(typeof repo.getCardById).toBe('function');
    });

    it('should return the same instance on multiple calls (singleton)', () => {
      const repo1 = RepositoryContainer.getCardRepository();
      const repo2 = RepositoryContainer.getCardRepository();

      expect(repo1).toBe(repo2);
    });

    it('should return MockCardRepository when USE_MOCK_API is true', () => {
      const repo = RepositoryContainer.getCardRepository();

      expect(repo).toBeInstanceOf(MockCardRepository);
    });
  });

  describe('getAuthRepository', () => {
    it('should return an auth repository', () => {
      const repo = RepositoryContainer.getAuthRepository();

      expect(repo).toBeDefined();
      expect(typeof repo.login).toBe('function');
      expect(typeof repo.logout).toBe('function');
    });

    it('should return the same instance on multiple calls (singleton)', () => {
      const repo1 = RepositoryContainer.getAuthRepository();
      const repo2 = RepositoryContainer.getAuthRepository();

      expect(repo1).toBe(repo2);
    });

    it('should return MockAuthRepository when USE_MOCK_API is true', () => {
      const repo = RepositoryContainer.getAuthRepository();

      expect(repo).toBeInstanceOf(MockAuthRepository);
    });
  });

  describe('reset', () => {
    it('should create new instances after reset', () => {
      const cardRepo1 = RepositoryContainer.getCardRepository();
      const authRepo1 = RepositoryContainer.getAuthRepository();

      RepositoryContainer.reset();

      const cardRepo2 = RepositoryContainer.getCardRepository();
      const authRepo2 = RepositoryContainer.getAuthRepository();

      // After reset, new instances should be created
      expect(cardRepo1).not.toBe(cardRepo2);
      expect(authRepo1).not.toBe(authRepo2);
    });
  });

  describe('isMockMode', () => {
    it('should return true when USE_MOCK_API is true', () => {
      expect(RepositoryContainer.isMockMode()).toBe(true);
    });
  });

  describe('shortcut functions', () => {
    it('cardRepository$ should return the same as getCardRepository', () => {
      const repo1 = cardRepository$();
      const repo2 = RepositoryContainer.getCardRepository();

      expect(repo1).toBe(repo2);
    });

    it('authRepository$ should return the same as getAuthRepository', () => {
      const repo1 = authRepository$();
      const repo2 = RepositoryContainer.getAuthRepository();

      expect(repo1).toBe(repo2);
    });
  });
});

describe('RepositoryContainer with real API', () => {
  beforeEach(() => {
    RepositoryContainer.reset();
    // Reset the mock to use real API
    jest.resetModules();
  });

  it('should create instances based on configuration', () => {
    // This test ensures the container can be instantiated
    const cardRepo = RepositoryContainer.getCardRepository();
    const authRepo = RepositoryContainer.getAuthRepository();

    expect(cardRepo).toBeDefined();
    expect(authRepo).toBeDefined();
  });
});
