import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  OPENAI_API_KEY: z.string().default(''),
  GEMINI_API_KEY: z.string().default(''),
  AI_PROVIDER: z.enum(['openai', 'gemini']).default('openai'),
  DATABASE_PATH: z.string().default('./data/officepilot.db'),
  NEXT_PUBLIC_APP_NAME: z.string().default('OfficePilot'),
  NEXT_PUBLIC_DEFAULT_LANGUAGE: z.enum(['en', 'fr', 'ht']).default('en'),
  MAX_FILE_SIZE_MB: z.coerce.number().default(25),
  SESSION_TTL_HOURS: z.coerce.number().default(72),
  ADMIN_API_KEY: z.string().default('change-me-in-production'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type EnvConfig = z.infer<typeof envSchema>;

let _config: EnvConfig | null = null;

export function getConfig(): EnvConfig {
  if (_config) return _config;
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const formatted = result.error.issues
      .map((i) => `  ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${formatted}`);
  }
  _config = result.data;
  return _config;
}

export function getConfigSafe(): Partial<EnvConfig> {
  try {
    return getConfig();
  } catch {
    return {};
  }
}
