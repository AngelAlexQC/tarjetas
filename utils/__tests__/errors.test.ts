/**
 * AppError Tests
 * 
 * Tests para el sistema de errores tipados.
 */

import { AppError, ErrorCode, success, failure, isAppError } from '../errors';

describe('AppError', () => {
  describe('constructor', () => {
    it('should create error with code and default message', () => {
      const error = new AppError(ErrorCode.NETWORK_ERROR);
      expect(error.code).toBe(ErrorCode.NETWORK_ERROR);
      expect(error.message).toBe('Error de conexión. Verifica tu conexión a internet.');
    });

    it('should create error with custom message', () => {
      const error = new AppError(ErrorCode.NETWORK_ERROR, 'Custom message');
      expect(error.message).toBe('Custom message');
    });

    it('should preserve original error', () => {
      const originalError = new Error('Original');
      const error = new AppError(ErrorCode.UNKNOWN, 'Wrapped', { originalError });
      expect(error.originalError).toBe(originalError);
    });

    it('should preserve details', () => {
      const details = { field: 'email', value: 'invalid' };
      const error = new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid', { details });
      expect(error.details).toEqual(details);
    });
  });

  describe('static factory methods', () => {
    it('should create network error', () => {
      const error = AppError.network('Connection failed');
      expect(error.code).toBe(ErrorCode.NETWORK_ERROR);
      expect(error.message).toBe('Connection failed');
    });

    it('should create timeout error', () => {
      const error = AppError.timeout();
      expect(error.code).toBe(ErrorCode.TIMEOUT);
    });

    it('should create validation error with details', () => {
      const error = AppError.validation('Invalid email', { field: 'email' });
      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.details).toEqual({ field: 'email' });
    });

    it('should create unauthorized error', () => {
      const error = AppError.unauthorized();
      expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
    });

    it('should create session expired error', () => {
      const error = AppError.sessionExpired();
      expect(error.code).toBe(ErrorCode.SESSION_EXPIRED);
    });
  });

  describe('fromHttpStatus', () => {
    it('should map 400 to INVALID_INPUT', () => {
      const error = AppError.fromHttpStatus(400);
      expect(error.code).toBe(ErrorCode.INVALID_INPUT);
    });

    it('should map 401 to UNAUTHORIZED', () => {
      const error = AppError.fromHttpStatus(401);
      expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
    });

    it('should map 403 to OPERATION_NOT_ALLOWED', () => {
      const error = AppError.fromHttpStatus(403);
      expect(error.code).toBe(ErrorCode.OPERATION_NOT_ALLOWED);
    });

    it('should map 500 to SERVER_ERROR', () => {
      const error = AppError.fromHttpStatus(500);
      expect(error.code).toBe(ErrorCode.SERVER_ERROR);
    });

    it('should map unknown status to UNKNOWN', () => {
      const error = AppError.fromHttpStatus(999);
      expect(error.code).toBe(ErrorCode.UNKNOWN);
    });
  });

  describe('from', () => {
    it('should return same error if already AppError', () => {
      const original = new AppError(ErrorCode.NETWORK_ERROR);
      const result = AppError.from(original);
      expect(result).toBe(original);
    });

    it('should wrap Error', () => {
      const original = new Error('Something went wrong');
      const result = AppError.from(original);
      expect(result.code).toBe(ErrorCode.UNKNOWN);
      expect(result.message).toBe('Something went wrong');
      expect(result.originalError).toBe(original);
    });

    it('should wrap string', () => {
      const result = AppError.from('String error');
      expect(result.code).toBe(ErrorCode.UNKNOWN);
      expect(result.message).toBe('String error');
    });
  });
});

describe('Result helpers', () => {
  describe('success', () => {
    it('should create success result', () => {
      const result = success({ name: 'John' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ name: 'John' });
      }
    });
  });

  describe('failure', () => {
    it('should create failure result', () => {
      const error = new AppError(ErrorCode.NETWORK_ERROR);
      const result = failure(error);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(error);
      }
    });
  });
});

describe('isAppError', () => {
  it('should return true for AppError', () => {
    const error = new AppError(ErrorCode.UNKNOWN);
    expect(isAppError(error)).toBe(true);
  });

  it('should return false for regular Error', () => {
    const error = new Error('Regular error');
    expect(isAppError(error)).toBe(false);
  });

  it('should return false for non-error', () => {
    expect(isAppError('string')).toBe(false);
    expect(isAppError(null)).toBe(false);
    expect(isAppError(undefined)).toBe(false);
  });
});
