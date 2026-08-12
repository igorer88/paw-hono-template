import { Hono } from 'hono'
import { secureHeaders } from 'hono/secure-headers'
import { validateEnv } from '@/env'
import {
  bodyLimitGuard,
  customCors,
  customLogger,
  correlationId,
  errorHandler,
  notFoundHandler,
  requestTimeout
} from '@/middleware'
import { healthRouter } from '@/routes/health'
import type { AppInstance } from '@/types'

// 1. Initialize App with strict types
const app = new Hono<AppInstance>()

// 2. Global Guardrails & Utilities
app.use('*', correlationId) // First: stamp a request id before any logging/error handling
app.use('*', customLogger)
app.use('*', requestTimeout) // Abort requests that exceed REQUEST_TIMEOUT_MS
app.use('*', bodyLimitGuard) // Reject bodies larger than MAX_BODY_SIZE
app.use(
  '*',
  secureHeaders({
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: []
    }
  })
)
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
    return app.fetch(request, validateEnv(env), executionContext)
  }
}
