import { cors } from 'hono/cors'
import type { Context, Next } from 'hono'

export const customCors = async (c: Context, next: Next) => {
  const domain = c.env.APP_DOMAIN

  const corsMiddleware = cors({
    origin: (origin) => {
      // Allow local development configurations or specific trusted domains
      if (!origin || origin.startsWith('http://localhost:') || origin.endsWith(`.${domain}`)) {
        return origin
      }
      return `https://${domain}`
    },
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400, // Cache preflight requests for 24 hours
  })
  return corsMiddleware(c, next)
}



