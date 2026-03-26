import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(8),
  JWT_REFRESH_SECRET: z.string().min(8),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL: z.string().default('7d'),
  SPACES_ENDPOINT: z.string().url(),
  SPACES_BUCKET: z.string().min(1),
  SPACES_REGION: z.string().min(1),
  SPACES_ACCESS_KEY: z.string().min(1),
  SPACES_SECRET_KEY: z.string().min(1),
  SPACES_CDN_BASE_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().optional(),
  APP_URL: z.string().url()
});

export const env = envSchema.parse(process.env);
