import { z } from 'zod'

export const envSchema = z.object({
  ENVIRONMENT: z.enum(['production', 'staging', 'development']).default('development'),
  API_SECRET_KEY: z.string().min(1, 'API_SECRET_KEY must be a non-empty string'),
  ALLOWED_ORIGIN: z.string().default('')
})

export type ValidatedBindings = z.infer<typeof envSchema>

export const validateEnv = (env: Record<string, unknown>): ValidatedBindings => {
  const result = envSchema.safeParse(env)
  if (!result.success) {
    console.error('[Env Validation Error]', result.error.flatten())
    throw new Error(
      `Invalid environment variables: ${JSON.stringify(result.error.flatten().fieldErrors)}`
    )
  }
  return result.data
}
