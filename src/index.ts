import { Hono } from 'hono'
import { secureHeaders } from 'hono/secure-headers'
import { envSchema } from '@/env'
import { customCors, customLogger, errorHandler, notFoundHandler } from '@/middleware'
import { healthRouter } from '@/routes/health'
import type { AppInstance } from '@/types'

// 1. Initialize App with strict types
const app = new Hono<AppInstance>()

// 2. Global Guardrails & Utilities
app.use('*', customLogger)
app.use('*', secureHeaders()) // Sets HSTS, XSS protection, CSP headers
app.use('*', customCors)

// 3. Centralized Error Handlers (Prevents leaking stack traces)
app.onError(errorHandler)
app.notFound(notFoundHandler)

// 4. Modular Routes (Mount your sub-routers here)
app.route('/health', healthRouter)

// Example index route
app.get('/', c => c.text('🚀 Paw Hono Worker Engine Active.'))

// 5. Wrangler entrypoint — validates env vars at cold start, fails fast
export default {
  fetch(request: Request, env: Record<string, unknown>, executionContext: ExecutionContext) {
    const validatedEnv = envSchema.parse(env)
    return app.fetch(request, validatedEnv, executionContext)
  }
}
