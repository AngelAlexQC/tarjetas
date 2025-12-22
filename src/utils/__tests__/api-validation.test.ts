/**
 * Tests for API Validation Utilities
 *
 * Tests para las utilidades de validación que usan neverthrow Result pattern.
 */

import { z } from 'zod';
import {
    createApiValidator,
    parseApiData,
    validateApiData,
    validateOptionalApiData,
} from '../api-validation';
import { AppError, ErrorCode } from '@/core/types/result';

// Test schemas
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

const UserArraySchema = z.array(UserSchema);

describe('validateApiData', () => {
  it('should return Ok with valid data', () => {
    const validData = { id: '1', name: 'John', email: 'john@example.com' };
    const result = validateApiData(UserSchema, validData, 'user');

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toEqual(validData);
    }
  });

  it('should return Err with invalid data', () => {
    const invalidData = { id: '1', name: 'John', email: 'invalid-email' };
    const result = validateApiData(UserSchema, invalidData, 'user');

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(AppError);
      expect(result.error.code).toBe(ErrorCode.VALIDATION);
    }
  });

  it('should return Err with missing required fields', () => {
    const incompleteData = { id: '1' };
    const result = validateApiData(UserSchema, incompleteData, 'user');

    expect(result.isErr()).toBe(true);
  });

  it('should handle null data', () => {
    const result = validateApiData(UserSchema, null, 'user');
    expect(result.isErr()).toBe(true);
  });

  it('should validate arrays correctly', () => {
    const validArray = [
      { id: '1', name: 'John', email: 'john@example.com' },
      { id: '2', name: 'Jane', email: 'jane@example.com' },
    ];
    const result = validateApiData(UserArraySchema, validArray, 'users');

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toHaveLength(2);
    }
  });

  it('should support match for exhaustive handling', () => {
    const validData = { id: '1', name: 'John', email: 'john@example.com' };
    const result = validateApiData(UserSchema, validData, 'user');

    const output = result.match(
      (user) => `User: ${user.name}`,
      (error) => `Error: ${error.message}`
    );

    expect(output).toBe('User: John');
  });

  it('should support unwrapOr for default values', () => {
    const invalidData = { id: '1' };
    const result = validateApiData(UserSchema, invalidData, 'user');

    const defaultUser = { id: '0', name: 'Guest', email: 'guest@example.com' };
    const user = result.unwrapOr(defaultUser);

    expect(user).toEqual(defaultUser);
  });
});

describe('parseApiData', () => {
  it('should return validated data for valid input', () => {
    const validData = { id: '1', name: 'John', email: 'john@example.com' };
    const result = parseApiData(UserSchema, validData, 'user');

    expect(result).toEqual(validData);
  });

  it('should throw AppError for invalid input', () => {
    const invalidData = { id: '1', name: 'John' }; // missing email

    expect(() => parseApiData(UserSchema, invalidData, 'user')).toThrow();
  });

  it('should throw with correct error code', () => {
    const invalidData = { id: '1' };

    try {
      parseApiData(UserSchema, invalidData, 'user');
      fail('Expected to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe(ErrorCode.VALIDATION);
    }
  });
});

describe('validateOptionalApiData', () => {
  it('should return Ok(undefined) for null data', () => {
    const result = validateOptionalApiData(UserSchema, null, 'user');

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toBeUndefined();
    }
  });

  it('should return Ok(undefined) for undefined data', () => {
    const result = validateOptionalApiData(UserSchema, undefined, 'user');

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toBeUndefined();
    }
  });

  it('should return Ok with validated data for valid input', () => {
    const validData = { id: '1', name: 'John', email: 'john@example.com' };
    const result = validateOptionalApiData(UserSchema, validData, 'user');

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toEqual(validData);
    }
  });

  it('should return Err for invalid non-null data', () => {
    const invalidData = { id: '1' };
    const result = validateOptionalApiData(UserSchema, invalidData, 'user');

    expect(result.isErr()).toBe(true);
  });
});

describe('createApiValidator', () => {
  it('should create a reusable validator that returns Result', () => {
    const validateUser = createApiValidator(UserSchema, 'user');

    const validData = { id: '1', name: 'John', email: 'john@example.com' };
    const result = validateUser(validData);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toEqual(validData);
    }
  });

  it('should return Err on invalid data', () => {
    const validateUser = createApiValidator(UserSchema, 'user');
    const result = validateUser({ id: '1' });

    expect(result.isErr()).toBe(true);
  });

  it('should work with arrays', () => {
    const validateUsers = createApiValidator(UserArraySchema, 'users');

    const validArray = [{ id: '1', name: 'John', email: 'john@example.com' }];

    const result = validateUsers(validArray);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toHaveLength(1);
    }
  });
});
