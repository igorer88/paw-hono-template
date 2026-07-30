import { z } from 'zod'

export const LoggerLevel = {
  NONE: 'none',
  INFO: 'info',
  DEBUG: 'debug'
} as const

export type LoggerLevel = (typeof LoggerLevel)[keyof typeof LoggerLevel]

export const IpLogLevel = {
  NONE: 'none',
  FULL: 'full',
  PARTIAL: 'partial'
} as const

export type IpLogLevel = (typeof IpLogLevel)[keyof typeof IpLogLevel]

export const envSchema = z.object({
  ENVIRONMENT: z.enum(['production', 'staging', 'development']).default('development'),
  API_SECRET_KEY: z.string().min(1, 'API_SECRET_KEY must be a non-empty string'),
  ALLOWED_ORIGIN: z.string().default(''),
  LOGGER_LEVELS: z.enum(['none', 'info', 'debug']).default('info'),
  IP_LOG_LEVEL: z.enum(['none', 'full', 'partial']).default('partial')
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
