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

const loggerLevelValues = Object.values(LoggerLevel) as [LoggerLevel, ...LoggerLevel[]]
const ipLogLevelValues = Object.values(IpLogLevel) as [IpLogLevel, ...IpLogLevel[]]

export const envSchema = z
  .object({
    ENVIRONMENT: z.enum(['production', 'staging', 'development']),
    ALLOWED_ORIGIN: z.string().default(''),
    LOGGER_LEVELS: z.enum(loggerLevelValues).default(LoggerLevel.INFO),
    IP_LOG_LEVEL: z.enum(ipLogLevelValues).default(IpLogLevel.PARTIAL)
  })
  .passthrough()
  .superRefine((val, ctx) => {
    const origins = val.ALLOWED_ORIGIN.split(',')
      .map(s => s.trim())
      .filter(Boolean)
    if (origins.some(origin => origin === '*')) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['ALLOWED_ORIGIN'],
        message: 'Bare "*" is not allowed; use explicit origins only'
      })
    }
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
