/**
 * Tests for API Validation Utilities
 */

import { z } from 'zod';
import {
    createApiParser,
    parseApiData,
    parseOptionalApiData,
    validateApiData
} from '../api-validation';
import { AppError, ErrorCode } from '../errors';

// Test schemas
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

const UserArraySchema = z.array(UserSchema);

describe('validateApiData', () => {
  it('should return success with valid data', () => {
    const validData = { id: '1', name: 'John', email: 'john@example.com' };
    const result = validateApiData(UserSchema, validData, 'user');
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  it('should return error with invalid data', () => {
    const invalidData = { id: '1', name: 'John', email: 'invalid-email' };
    const result = validateApiData(UserSchema, invalidData, 'user');
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(AppError);
      expect(result.error.code).toBe(ErrorCode.VALIDATION_ERROR);
    }
  });

  it('should return error with missing required fields', () => {
    const incompleteData = { id: '1' };
    const result = validateApiData(UserSchema, incompleteData, 'user');
    
    expect(result.success).toBe(false);
  });

  it('should handle null data', () => {
    const result = validateApiData(UserSchema, null, 'user');
    expect(result.success).toBe(false);
  });

  it('should validate arrays correctly', () => {
    const validArray = [
      { id: '1', name: 'John', email: 'john@example.com' },
      { id: '2', name: 'Jane', email: 'jane@example.com' },
    ];
    const result = validateApiData(UserArraySchema, validArray, 'users');
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(2);
    }
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
    
    expect(() => parseApiData(UserSchema, invalidData, 'user')).toThrow(AppError);
  });

  it('should throw with correct error code', () => {
    const invalidData = { id: '1' };
    
    try {
      parseApiData(UserSchema, invalidData, 'user');
      fail('Expected to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe(ErrorCode.VALIDATION_ERROR);
    }
  });
});

describe('parseOptionalApiData', () => {
  it('should return undefined for null data', () => {
    const result = parseOptionalApiData(UserSchema, null, 'user');
    expect(result).toBeUndefined();
  });

  it('should return undefined for undefined data', () => {
    const result = parseOptionalApiData(UserSchema, undefined, 'user');
    expect(result).toBeUndefined();
  });

  it('should return validated data for valid input', () => {
    const validData = { id: '1', name: 'John', email: 'john@example.com' };
    const result = parseOptionalApiData(UserSchema, validData, 'user');
    
    expect(result).toEqual(validData);
  });

  it('should throw for invalid non-null data', () => {
    const invalidData = { id: '1' };
    
    expect(() => parseOptionalApiData(UserSchema, invalidData, 'user')).toThrow(AppError);
  });
});

describe('createApiParser', () => {
  it('should create a reusable parser', () => {
    const parseUser = createApiParser(UserSchema, 'user');
    
    const validData = { id: '1', name: 'John', email: 'john@example.com' };
    const result = parseUser(validData);
    
    expect(result).toEqual(validData);
  });

  it('should throw on invalid data', () => {
    const parseUser = createApiParser(UserSchema, 'user');
    
    expect(() => parseUser({ id: '1' })).toThrow(AppError);
  });

  it('should work with arrays', () => {
    const parseUsers = createApiParser(UserArraySchema, 'users');
    
    const validArray = [
      { id: '1', name: 'John', email: 'john@example.com' },
    ];
    
    const result = parseUsers(validArray);
    expect(result).toHaveLength(1);
  });
});
