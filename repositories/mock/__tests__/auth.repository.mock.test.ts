/**
 * Mock Auth Repository Tests
 */

import { MockAuthRepository } from '../auth.repository.mock';

jest.mock('@/api/config', () => ({
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
      await repository.login({ username: 'test', password: 'password123' });
      const user = await repository.updateProfile({ name: 'New Name' });
      expect(user.name).toBe('New Name');
    });

    it('should preserve existing data', async () => {
      await repository.login({ username: 'test', password: 'password123' });
      const user = await repository.updateProfile({ name: 'New' });
      expect(user.username).toBe('test');
    });

    it('should work without login using mock user', async () => {
      const user = await repository.updateProfile({ name: 'Updated' });
      expect(user.name).toBe('Updated');
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      const result = await repository.register({
        email: 'new@example.com',
        username: 'newuser',
        password: 'password123',
        fullName: 'New User',
        phone: '1234567890',
      });

      expect(result.success).toBe(true);
      expect(result.requiresVerification).toBe(true);
      expect(result.userId).toBeDefined();
    });

    it('should throw for missing fields', async () => {
      await expect(repository.register({
        email: '',
        username: 'newuser',
        password: 'password123',
        fullName: 'Test',
        phone: '123',
      })).rejects.toThrow('Por favor completa todos los campos obligatorios');
    });

    it('should throw for short password', async () => {
      await expect(repository.register({
        email: 'new@example.com',
        username: 'newuser',
        password: '123',
        fullName: 'Test',
        phone: '123',
      })).rejects.toThrow('La contraseña debe tener al menos 8 caracteres');
    });

    it('should throw for existing email', async () => {
      await expect(repository.register({
        email: 'existing@example.com',
        username: 'newuser',
        password: 'password123',
        fullName: 'Test',
        phone: '123',
      })).rejects.toThrow('Este correo electrónico ya está registrado');
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with correct code', async () => {
      // First register
      await repository.register({
        email: 'verify@example.com',
        username: 'verifyuser',
        password: 'password123',
        fullName: 'Verify User',
        phone: '123',
      });

      const result = await repository.verifyEmail({
        email: 'verify@example.com',
        code: '000000',
      });

      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
      expect(result.user).toBeDefined();
    });

    it('should throw for wrong code', async () => {
      await repository.register({
        email: 'wrong@example.com',
        username: 'wronguser',
        password: 'password123',
        fullName: 'Wrong User',
        phone: '123',
      });

      await expect(repository.verifyEmail({
        email: 'wrong@example.com',
        code: '999999',
      })).rejects.toThrow('Código de verificación incorrecto');
    });

    it('should throw for non-pending email', async () => {
      await expect(repository.verifyEmail({
        email: 'notpending@example.com',
        code: '000000',
      })).rejects.toThrow('No hay registro pendiente para este email');
    });
  });

  describe('resendVerificationCode', () => {
    it('should resend code for pending registration', async () => {
      await repository.register({
        email: 'resend@example.com',
        username: 'resenduser',
        password: 'password123',
        fullName: 'Resend User',
        phone: '123',
      });

      const result = await repository.resendVerificationCode('resend@example.com');
      expect(result.success).toBe(true);
    });

    it('should throw for non-pending email', async () => {
      await expect(repository.resendVerificationCode('notregistered@example.com'))
        .rejects.toThrow('No hay registro pendiente para este email');
    });
  });

  describe('forgotPassword', () => {
    it('should send recovery code', async () => {
      const result = await repository.forgotPassword({
        email: 'recover@example.com',
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('Código');
    });

    it('should throw for empty email', async () => {
      await expect(repository.forgotPassword({ email: '' }))
        .rejects.toThrow('Por favor ingresa tu correo electrónico');
    });
  });

  describe('verifyRecoveryCode', () => {
    it('should verify recovery code successfully', async () => {
      const result = await repository.verifyRecoveryCode({
        email: 'recover@example.com',
        code: '000000',
      });

      expect(result.success).toBe(true);
      expect(result.resetToken).toBeDefined();
    });

    it('should throw for wrong code', async () => {
      await expect(repository.verifyRecoveryCode({
        email: 'recover@example.com',
        code: '123456',
      })).rejects.toThrow('Código de verificación incorrecto');
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const result = await repository.resetPassword({
        email: 'reset@example.com',
        code: '000000',
        newPassword: 'newpassword123',
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('actualizada');
    });

    it('should throw for short password', async () => {
      await expect(repository.resetPassword({
        email: 'reset@example.com',
        code: '000000',
        newPassword: '123',
      })).rejects.toThrow('La contraseña debe tener al menos 8 caracteres');
    });

    it('should throw for wrong code', async () => {
      await expect(repository.resetPassword({
        email: 'reset@example.com',
        code: '999999',
        newPassword: 'newpassword123',
      })).rejects.toThrow('Código de verificación incorrecto');
    });
  });
});
