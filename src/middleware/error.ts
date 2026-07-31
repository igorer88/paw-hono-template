import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import type { AppInstance } from '@/types'

export const errorHandler = (err: Error, c: Context<AppInstance>) => {
  console.error(`[Worker Error]: ${err.message}`, err.stack)

  const status: ContentfulStatusCode =
    c.res.status === 200 || !c.res.status ? 500 : (c.res.status as ContentfulStatusCode)
  const isServerError = status >= 500

  return c.json(
    {
      success: false,
      description: 'Something went wrong',
      error: {
        // Never expose internal error details for server errors; only local dev may see the stack
        message: isServerError ? 'Internal Server Error' : err.message,
        stack: c.env.ENVIRONMENT === 'development' ? err.stack : undefined
      }
    },
    status
  )
}

export const notFoundHandler = (c: Context<AppInstance>) => {
  return c.json(
    {
      success: false,
      description: 'Verify the URL and HTTP method',
      error: { message: `Route not found: ${c.req.method} ${c.req.path}` }
    },
    404
  )
}
