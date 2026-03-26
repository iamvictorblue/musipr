import { z } from 'zod';

export const baseEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development')
});

export type BaseEnv = z.infer<typeof baseEnvSchema>;
