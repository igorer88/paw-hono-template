import { cors } from 'hono/cors'
import type { Context, Next } from 'hono'

const globToRegex = (pattern: string): RegExp => {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`^${escaped.replace(/\*/g, '.*')}$`)
}

export const customCors = async (c: Context, next: Next) => {
  const raw = c.env.ALLOWED_ORIGIN || ''
  const allowedOrigins = raw
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)

  const corsMiddleware = cors({
    origin: origin => {
      if (!origin) return origin

      try {
        if (new URL(origin).hostname === 'localhost') return origin
      } catch {
        return null
      }

      const matched = allowedOrigins.some(allowed => {
        if (allowed.includes('*')) return globToRegex(allowed).test(origin)
        return origin === allowed
      })

      if (matched) return origin

      return allowedOrigins[0] || null
    },
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400 // Cache preflight requests for 24 hours
  })
  return corsMiddleware(c, next)
}
