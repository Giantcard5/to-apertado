import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL:                    z.string().url(),
  JWT_SECRET:                      z.string().min(32),
  GOOGLE_CLIENT_ID:                z.string(),
  GOOGLE_CLIENT_SECRET:            z.string(),
  GOOGLE_CALLBACK_URL:             z.string().url(),
  CLOUDFLARE_R2_ACCOUNT_ID:        z.string(),
  CLOUDFLARE_R2_ACCESS_KEY_ID:     z.string(),
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: z.string(),
  CLOUDFLARE_R2_BUCKET:            z.string(),
  CLOUDFLARE_R2_PUBLIC_URL:        z.string().url(),
  GOOGLE_VISION_API_KEY:           z.string(),
  CORS_ORIGIN:                     z.string(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT:     z.coerce.number().default(3001),
})

export const config = envSchema.parse(process.env)
