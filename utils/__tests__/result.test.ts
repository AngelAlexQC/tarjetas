/**
 * Result Pattern Tests
 *
 * Tests para el sistema de errores tipados con neverthrow.
 */

import { AppError, ErrorCode, err, isAppError, ok, Result } from '../result';

describe('AppError', () => {
  describe('factory methods', () => {
    it('should create network error', () => {
      const error = AppError.network('Connection failed');
      expect(error.code).toBe(ErrorCode.NETWORK);
      expect(error.message).toBe('Connection failed');
    });

    it('should create network error with default message', () => {
      const error = AppError.network();
      expect(error.code).toBe(ErrorCode.NETWORK);
      expect(error.message).toBe('Error de conexión. Verifica tu internet.');
    });

    it('should create timeout error', () => {
      const error = AppError.timeout();
      expect(error.code).toBe(ErrorCode.TIMEOUT);
    });

    it('should create validation error', () => {
      const error = AppError.validation('Invalid email format');
      expect(error.code).toBe(ErrorCode.VALIDATION);
      expect(error.message).toBe('Invalid email format');
    });

    it('should create unauthorized error', () => {
      const error = AppError.unauthorized();
      expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
    });

    it('should create session expired error', () => {
      const error = AppError.sessionExpired();
      expect(error.code).toBe(ErrorCode.SESSION_EXPIRED);
    });

    it('should create notFound error', () => {
      const error = AppError.notFound('User');
      expect(error.code).toBe(ErrorCode.NOT_FOUND);
      expect(error.message).toBe('User no encontrado');
    });

    it('should create cardBlocked error', () => {
      const error = AppError.cardBlocked();
      expect(error.code).toBe(ErrorCode.CARD_BLOCKED);
    });

    it('should create insufficientFunds error', () => {
      const error = AppError.insufficientFunds();
      expect(error.code).toBe(ErrorCode.INSUFFICIENT_FUNDS);
    });

    it('should create limitExceeded error', () => {
      const error = AppError.limitExceeded();
      expect(error.code).toBe(ErrorCode.LIMIT_EXCEEDED);
    });

    it('should create server error', () => {
      const error = AppError.server('Database connection failed');
      expect(error.code).toBe(ErrorCode.SERVER);
      expect(error.message).toBe('Database connection failed');
    });

    it('should create unknown error', () => {
      const error = AppError.unknown('Something went wrong');
      expect(error.code).toBe(ErrorCode.UNKNOWN);
    });

    it('should preserve cause', () => {
      const originalError = new Error('Original');
      const error = AppError.network('Wrapped', originalError);
      expect(error.cause).toBe(originalError);
    });
  });

  describe('fromHttpStatus', () => {
    it('should map 400 to VALIDATION', () => {
      const error = AppError.fromHttpStatus(400);
      expect(error.code).toBe(ErrorCode.VALIDATION);
    });

    it('should map 401 to UNAUTHORIZED', () => {
      const error = AppError.fromHttpStatus(401);
      expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
    });

    it('should map 403 to OPERATION_NOT_ALLOWED', () => {
      const error = AppError.fromHttpStatus(403);
      expect(error.code).toBe(ErrorCode.OPERATION_NOT_ALLOWED);
    });

    it('should map 404 to NOT_FOUND', () => {
      const error = AppError.fromHttpStatus(404);
      expect(error.code).toBe(ErrorCode.NOT_FOUND);
    });

    it('should map 408 to TIMEOUT', () => {
      const error = AppError.fromHttpStatus(408);
      expect(error.code).toBe(ErrorCode.TIMEOUT);
    });

    it('should map 500 to SERVER', () => {
      const error = AppError.fromHttpStatus(500);
      expect(error.code).toBe(ErrorCode.SERVER);
    });

    it('should map 502 to SERVER', () => {
      const error = AppError.fromHttpStatus(502);
      expect(error.code).toBe(ErrorCode.SERVER);
    });

    it('should map 503 to SERVER', () => {
      const error = AppError.fromHttpStatus(503);
      expect(error.code).toBe(ErrorCode.SERVER);
    });

    it('should map unknown status to UNKNOWN', () => {
      const error = AppError.fromHttpStatus(999);
      expect(error.code).toBe(ErrorCode.UNKNOWN);
    });

    it('should use custom message if provided', () => {
      const error = AppError.fromHttpStatus(401, 'Token expired');
      expect(error.message).toBe('Token expired');
    });
  });

  describe('from', () => {
    it('should return same error if already AppError', () => {
      const original = AppError.network();
      const result = AppError.from(original);
      expect(result).toBe(original);
    });

    it('should wrap Error', () => {
      const original = new Error('Something went wrong');
      const result = AppError.from(original);
      expect(result.code).toBe(ErrorCode.UNKNOWN);
      expect(result.message).toBe('Something went wrong');
      expect(result.cause).toBe(original);
    });

    it('should detect network errors in message', () => {
      const original = new Error('Network request failed');
      const result = AppError.from(original);
      expect(result.code).toBe(ErrorCode.NETWORK);
    });

    it('should detect timeout errors in message', () => {
      const original = new Error('Request timeout exceeded');
      const result = AppError.from(original);
      expect(result.code).toBe(ErrorCode.TIMEOUT);
    });

    it('should wrap string', () => {
      const result = AppError.from('String error');
      expect(result.code).toBe(ErrorCode.UNKNOWN);
      expect(result.message).toBe('String error');
    });

    it('should handle unknown types', () => {
      const result = AppError.from({ some: 'object' });
      expect(result.code).toBe(ErrorCode.UNKNOWN);
    });
  });

  describe('utility methods', () => {
    it('is() should check error code', () => {
      const error = AppError.network();
      expect(error.is(ErrorCode.NETWORK)).toBe(true);
      expect(error.is(ErrorCode.TIMEOUT)).toBe(false);
    });

    it('isAuthError() should detect auth errors', () => {
      expect(AppError.unauthorized().isAuthError()).toBe(true);
      expect(AppError.sessionExpired().isAuthError()).toBe(true);
      expect(AppError.invalidCredentials().isAuthError()).toBe(true);
      expect(AppError.network().isAuthError()).toBe(false);
    });

    it('isNetworkError() should detect network errors', () => {
      expect(AppError.network().isNetworkError()).toBe(true);
      expect(AppError.timeout().isNetworkError()).toBe(true);
      expect(AppError.validation('test').isNetworkError()).toBe(false);
    });

    it('toJSON() should serialize correctly', () => {
      const error = AppError.network('Connection lost');
      const json = error.toJSON();
      expect(json).toEqual({
        name: 'AppError',
        code: ErrorCode.NETWORK,
        message: 'Connection lost',
        cause: undefined,
      });
    });

    it('toJSON() should serialize cause message', () => {
      const cause = new Error('Original error');
      const error = AppError.network('Wrapped', cause);
      const json = error.toJSON();
      expect(json.cause).toBe('Original error');
    });
  });
});

describe('neverthrow Result integration', () => {
  describe('ok/err', () => {
    it('should create Ok result', () => {
      const result: Result<number, AppError> = ok(42);
      expect(result.isOk()).toBe(true);
      expect(result.isErr()).toBe(false);
    });

    it('should create Err result', () => {
      const result: Result<number, AppError> = err(AppError.network());
      expect(result.isErr()).toBe(true);
      expect(result.isOk()).toBe(false);
    });
  });

  describe('match', () => {
    it('should match Ok correctly', () => {
      const result: Result<number, AppError> = ok(42);
      const output = result.match(
        (value) => `Value: ${value}`,
        (error) => `Error: ${error.message}`
      );
      expect(output).toBe('Value: 42');
    });

    it('should match Err correctly', () => {
      const result: Result<number, AppError> = err(AppError.network('Failed'));
      const output = result.match(
        (value) => `Value: ${value}`,
        (error) => `Error: ${error.message}`
      );
      expect(output).toBe('Error: Failed');
    });
  });

  describe('map/mapErr', () => {
    it('should map Ok value', () => {
      const result = ok(10).map((n) => n * 2);
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe(20);
      }
    });

    it('should not map Err value', () => {
      const result: Result<number, AppError> = err(AppError.network());
      const mapped = result.map((n) => n * 2);
      expect(mapped.isErr()).toBe(true);
    });

    it('should mapErr on Err', () => {
      const result: Result<number, AppError> = err(AppError.network());
      const mapped = result.mapErr((e) => AppError.server(e.message));
      expect(mapped.isErr()).toBe(true);
      if (mapped.isErr()) {
        expect(mapped.error.code).toBe(ErrorCode.SERVER);
      }
    });
  });

  describe('andThen', () => {
    it('should chain Ok results', () => {
      const double = (n: number): Result<number, AppError> => ok(n * 2);
      const result = ok(5).andThen(double).andThen(double);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe(20);
      }
    });

    it('should short-circuit on Err', () => {
      const double = (n: number): Result<number, AppError> => ok(n * 2);
      const fail = (_: number): Result<number, AppError> => err(AppError.validation('failed'));

      const result = ok(5).andThen(fail).andThen(double);

      expect(result.isErr()).toBe(true);
    });
  });

  describe('unwrapOr', () => {
    it('should return value for Ok', () => {
      const result = ok(42);
      expect(result.unwrapOr(0)).toBe(42);
    });

    it('should return default for Err', () => {
      const result: Result<number, AppError> = err(AppError.network());
      expect(result.unwrapOr(0)).toBe(0);
    });
  });
});

describe('isAppError', () => {
  it('should return true for AppError', () => {
    const error = AppError.unknown();
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
    expect(isAppError(42)).toBe(false);
  });
});
