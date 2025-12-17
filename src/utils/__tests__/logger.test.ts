/**
 * Logger Tests
 */

import { createLogger, logger, loggers } from '../logger';

describe('Logger', () => {
  let consoleSpy: {
    log: jest.SpyInstance;
    warn: jest.SpyInstance;
    error: jest.SpyInstance;
  };

  beforeEach(() => {
    consoleSpy = {
      log: jest.spyOn(console, 'log').mockImplementation(() => {}),
      warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
      error: jest.spyOn(console, 'error').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    consoleSpy.log.mockRestore();
    consoleSpy.warn.mockRestore();
    consoleSpy.error.mockRestore();
  });

  describe('createLogger', () => {
    it('should create logger with prefix', () => {
      const customLogger = createLogger('TestModule');

      customLogger.info('Test message');

      expect(consoleSpy.log).toHaveBeenCalled();
      const callArg = consoleSpy.log.mock.calls[0][0];
      expect(callArg).toContain('[TestModule]');
      expect(callArg).toContain('Test message');
    });

    it('should include timestamp in message', () => {
      const customLogger = createLogger('Test');

      customLogger.info('Test message');

      const callArg = consoleSpy.log.mock.calls[0][0];
      // Timestamp format HH:MM:SS
      expect(callArg).toMatch(/\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('default logger', () => {
    it('should work without prefix', () => {
      logger.info('Default logger message');

      expect(consoleSpy.log).toHaveBeenCalled();
      const callArg = consoleSpy.log.mock.calls[0][0];
      expect(callArg).toContain('Default logger message');
    });
  });

  describe('log levels', () => {
    it('should log debug messages', () => {
      const customLogger = createLogger('Debug');

      customLogger.debug('Debug message', { detail: 'test' });

      expect(consoleSpy.log).toHaveBeenCalled();
      expect(consoleSpy.log.mock.calls[0][0]).toContain('Debug message');
      expect(consoleSpy.log.mock.calls[0][1]).toEqual({ detail: 'test' });
    });

    it('should log info messages', () => {
      const customLogger = createLogger('Info');

      customLogger.info('Info message');

      expect(consoleSpy.log).toHaveBeenCalled();
      expect(consoleSpy.log.mock.calls[0][0]).toContain('Info message');
    });

    it('should log warn messages', () => {
      const customLogger = createLogger('Warn');

      customLogger.warn('Warning message');

      expect(consoleSpy.warn).toHaveBeenCalled();
      expect(consoleSpy.warn.mock.calls[0][0]).toContain('Warning message');
    });

    it('should log error messages', () => {
      const customLogger = createLogger('Error');

      customLogger.error('Error message', new Error('Test error'));

      expect(consoleSpy.error).toHaveBeenCalled();
      expect(consoleSpy.error.mock.calls[0][0]).toContain('Error message');
    });
  });

  describe('pre-configured loggers', () => {
    it('should have auth logger', () => {
      expect(loggers.auth).toBeDefined();
      
      loggers.auth.info('Auth test');
      
      expect(consoleSpy.log).toHaveBeenCalled();
      expect(consoleSpy.log.mock.calls[0][0]).toContain('[Auth]');
    });

    it('should have cards logger', () => {
      expect(loggers.cards).toBeDefined();
      
      loggers.cards.info('Cards test');
      
      expect(consoleSpy.log).toHaveBeenCalled();
      expect(consoleSpy.log.mock.calls[0][0]).toContain('[Cards]');
    });

    it('should have theme logger', () => {
      expect(loggers.theme).toBeDefined();
    });

    it('should have api logger', () => {
      expect(loggers.api).toBeDefined();
    });

    it('should have ui logger', () => {
      expect(loggers.ui).toBeDefined();
    });

    it('should have formatter logger', () => {
      expect(loggers.formatter).toBeDefined();
    });

    it('should have tour logger', () => {
      expect(loggers.tour).toBeDefined();
    });
  });

  describe('multiple arguments', () => {
    it('should pass multiple arguments to console', () => {
      const customLogger = createLogger('Multi');

      customLogger.info('Message', 'arg1', 'arg2', { key: 'value' });

      expect(consoleSpy.log).toHaveBeenCalled();
      expect(consoleSpy.log.mock.calls[0]).toHaveLength(4);
      expect(consoleSpy.log.mock.calls[0][1]).toBe('arg1');
      expect(consoleSpy.log.mock.calls[0][2]).toBe('arg2');
      expect(consoleSpy.log.mock.calls[0][3]).toEqual({ key: 'value' });
    });
  });
});
