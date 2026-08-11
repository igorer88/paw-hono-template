import type { Context, Next } from 'hono'
import { LoggerLevel, IpLogLevel } from '@/env'
import { getClientIp, anonymizeIp } from '@/shared/ip'
import type { AppInstance } from '@/types'

const REDACTED = '[REDACTED]'

// Allowlist of headers safe to log in DEBUG. Anything else (credentials,
// tokens, IP headers, custom/internal headers) is redacted.
const LOGGABLE_HEADERS = new Set([
  'accept',
  'accept-encoding',
  'accept-language',
  'cache-control',
  'connection',
  'content-length',
  'content-type',
  'host',
  'user-agent'
])

export const customLogger = async (c: Context<AppInstance>, next: Next) => {
  if (c.env.LOGGER_LEVELS === LoggerLevel.NONE) return next()

  const method = c.req.method
  const path = new URL(c.req.url).pathname
  const skip = method === 'HEAD' || method === 'OPTIONS'

  if (!skip) console.log(`<-- ${method} ${path}`)

  const start = Date.now()
  await next()

  if (!skip) console.log(`--> ${method} ${path} ${c.res.status} ${Date.now() - start}ms`)

  if (c.env.IP_LOG_LEVEL !== IpLogLevel.NONE) {
    const ip = getClientIp(c.req.raw.headers)
    if (ip) {
      const display = c.env.IP_LOG_LEVEL === IpLogLevel.PARTIAL ? anonymizeIp(ip) : ip
      console.log('  IP:', display)
    }
  }

  if (c.env.LOGGER_LEVELS === LoggerLevel.DEBUG) {
    const headers = Object.fromEntries(
      [...c.req.raw.headers].map(([name, value]) => [
        name,
        LOGGABLE_HEADERS.has(name) ? value : REDACTED
      ])
    )
    console.log('  Headers:', headers)
    const url = new URL(c.req.url)
    if (url.search) {
      const params = Object.fromEntries([...url.searchParams.keys()].map(k => [k, REDACTED]))
      console.log('  Query:', params)
    }
  }
}
