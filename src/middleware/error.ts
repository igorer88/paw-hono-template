import type { Context } from 'hono'

export const errorHandler = (err: Error, c: Context) => {
  console.error(`[Worker Error]: ${err.message}`, err.stack)
  
  const status: number = c.res.status === 200 || !c.res.status ? 500 : c.res.status
  
  return c.json({
    success: false,
    description: 'Something went wrong',
    error: {
      message: err.message || 'Internal Server Error',
      // Only expose stack traces in local development environments
      stack: c.env.ENVIRONMENT === 'development' ? err.stack : undefined
    }
  }, status)
}

export const notFoundHandler = (c: Context) => {
  return c.json({
    success: false,
    description: 'Verify the URL and HTTP method',
    error: { message: `Route not found: ${c.req.method} ${c.req.path}` }
  }, 404)
}


