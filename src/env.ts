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
    IP_LOG_LEVEL: z.enum(ipLogLevelValues).default(IpLogLevel.PARTIAL),
    REQUEST_TIMEOUT_MS: z.coerce.number().int().min(1).default(10000),
    MAX_BODY_SIZE: z.coerce.number().int().min(1).default(1_000_000)
  })
  .passthrough()
  .superRefine((val, ctx) => {
    const origins = val.ALLOWED_ORIGIN.split(',')
      .map(s => s.trim())
      .filter(Boolean)
    for (const origin of origins) {
      if (origin === '*') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['ALLOWED_ORIGIN'],
          message: 'Bare "*" is not allowed; use explicit origins only'
        })
        continue
      }
      let parsed: URL
      try {
        parsed = new URL(origin)
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['ALLOWED_ORIGIN'],
          message: `"${origin}" is not a valid origin; use the form https://host[:port]`
        })
        continue
      }
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['ALLOWED_ORIGIN'],
          message: `"${origin}" must use an explicit http:// or https:// scheme`
        })
      }
      if (parsed.origin !== origin) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['ALLOWED_ORIGIN'],
          message: `"${origin}" must be a bare origin (no path, query, fragment, or trailing slash)`
        })
      }
      if (origin.includes('*') && !/^\*\.\w/.test(parsed.hostname)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['ALLOWED_ORIGIN'],
          message: `"${origin}" wildcard must be a leading label like https://*.example.com`
        })
      }
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
