import { cors } from 'hono/cors'
import type { Context, Next } from 'hono'
import type { AppInstance } from '@/types'

const globToRegex = (pattern: string): RegExp => {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`^${escaped.replace(/\*/g, '.*')}$`)
}

const DEV_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]'])

export const customCors = async (c: Context<AppInstance>, next: Next) => {
  const raw = c.env.ALLOWED_ORIGIN || ''
  const allowedOrigins = raw
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  const corsMiddleware = cors({
    origin: origin => {
      if (!origin) return origin

      try {
        const hostname = new URL(origin).hostname
        if (c.env.ENVIRONMENT === 'development' && DEV_HOSTNAMES.has(hostname)) return origin
      } catch {
        return null
      }

      const matched = allowedOrigins.some(allowed => {
        if (allowed.includes('*')) return globToRegex(allowed).test(origin)
        return origin === allowed
      })

      return matched ? origin : null
    },
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    exposeHeaders: ['X-Request-Id'],
    maxAge: 86400 // Cache preflight requests for 24 hours
  })
  return corsMiddleware(c, next)
}
