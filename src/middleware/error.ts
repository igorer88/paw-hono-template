import { HTTPException } from 'hono/http-exception'
import type { Context } from 'hono'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import type { AppInstance } from '@/types'

export const errorHandler = (err: Error, c: Context<AppInstance>) => {
  console.error(`[Worker Error]: ${err.message}`, err.stack)

  const status: ContentfulStatusCode =
    c.res.status === 200 || !c.res.status
      ? err instanceof HTTPException
        ? (err.status as ContentfulStatusCode)
        : 500
      : (c.res.status as ContentfulStatusCode)
  const isServerError = status >= 500
  const isClientError = status >= 400 && status < 500

  return c.json(
    {
      success: false,
      description: 'Something went wrong',
      error: {
        // Never expose internal error details; only HTTPException messages (the deliberate,
        // handler-authored path) surface on client errors. Local dev may still see the stack.
        message:
          isServerError || !isClientError || !(err instanceof HTTPException)
            ? 'Internal Server Error'
            : err.message,
        stack: c.env.ENVIRONMENT === 'development' ? err.stack : undefined
      },
      requestId: c.get('requestId')
    },
    status
  )
}

export const notFoundHandler = (c: Context<AppInstance>) => {
  return c.json(
    {
      success: false,
      description: 'Verify the URL and HTTP method',
      error: { message: `Route not found: ${c.req.method} ${c.req.path}` },
      requestId: c.get('requestId')
    },
    404
  )
}
