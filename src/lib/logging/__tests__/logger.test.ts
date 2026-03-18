import { describe, it, expect } from 'vitest';
import { logger, setLogLevel } from '@/lib/logging';

describe('Logger', () => {
  it('should have standard log methods', () => {
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
  });

  it('should accept log level changes', () => {
    expect(() => setLogLevel('debug')).not.toThrow();
    expect(() => setLogLevel('error')).not.toThrow();
    // Reset
    setLogLevel('info');
  });

  it('should log without throwing', () => {
    expect(() => logger.info('test message')).not.toThrow();
    expect(() => logger.info('test with meta', { key: 'value' })).not.toThrow();
    expect(() => logger.error('error message', { code: 500 })).not.toThrow();
  });
});
