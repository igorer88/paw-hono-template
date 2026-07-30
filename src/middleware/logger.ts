import { logger as honoLogger } from 'hono/logger'
import type { Context, Next } from 'hono'
import { LoggerLevel } from '@/env'

export const customLogger = async (c: Context, next: Next) => {
  if (c.env.LOGGER_LEVELS === LoggerLevel.NONE) return next()

  await honoLogger()(c, next)

  if (c.env.LOGGER_LEVELS === LoggerLevel.DEBUG) {
    console.log('  Headers:', Object.fromEntries(c.req.raw.headers))
    const url = new URL(c.req.url)
    if (url.search) console.log('  Query:', url.searchParams.toString())
  }
}
