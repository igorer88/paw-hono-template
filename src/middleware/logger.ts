import { logger as honoLogger } from 'hono/logger'
import type { Context, Next } from 'hono'
import { LoggerLevel, IpLogLevel } from '@/env'
import { getClientIp, anonymizeIp } from '@/shared/ip'

export const customLogger = async (c: Context, next: Next) => {
  if (c.env.LOGGER_LEVELS === LoggerLevel.NONE) return next()

  await honoLogger()(c, next)

  if (c.env.IP_LOG_LEVEL !== IpLogLevel.NONE) {
    const ip = getClientIp(c)
    if (ip) {
      const display = c.env.IP_LOG_LEVEL === IpLogLevel.PARTIAL ? anonymizeIp(ip) : ip
      console.log('  IP:', display)
    }
  }

  if (c.env.LOGGER_LEVELS === LoggerLevel.DEBUG) {
    console.log('  Headers:', Object.fromEntries(c.req.raw.headers))
    const url = new URL(c.req.url)
    if (url.search) console.log('  Query:', url.searchParams.toString())
  }
}
