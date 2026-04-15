import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('Config', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  it('getConfigSafe returns partial config when env is incomplete', async () => {
    const { getConfigSafe } = await import('@/lib/config');
    const config = getConfigSafe();
    expect(config).toBeDefined();
  });

  it('uses a writable temp database path in production when DATABASE_PATH is unset', async () => {
    delete process.env.DATABASE_PATH;
    process.env = { ...process.env, NODE_ENV: 'production' };

    const { getConfig } = await import('@/lib/config');
    const config = getConfig();

    expect(path.isAbsolute(config.DATABASE_PATH)).toBe(true);
    expect(config.DATABASE_PATH.startsWith(os.tmpdir())).toBe(true);
    expect(config.DATABASE_PATH.endsWith(path.join('officepilot', 'officepilot.db'))).toBe(true);
  });
});
