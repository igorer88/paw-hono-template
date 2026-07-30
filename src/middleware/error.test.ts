import { Hono } from 'hono'
import { errorHandler, notFoundHandler } from './error'
import type { AppInstance } from '@/types'

const bindings = {
  ENVIRONMENT: 'development' as const,
  ALLOWED_ORIGIN: 'https://app.example.com'
}

const productionBindings = {
  ...bindings,
  ENVIRONMENT: 'production' as const
}

describe('errorHandler', () => {
  it('returns 500 when response status is 200 (unset)', async () => {
    const app = new Hono<AppInstance>()
    app.get('/error', () => {
      throw new Error('unexpected error')
    })
    app.onError(errorHandler)

    const res = await app.request('/error', {}, bindings)
    expect(res.status).toBe(500)
  })

  it('preserves existing error status', async () => {
    const app = new Hono<AppInstance>()
    app.get('/error', () => {
      throw new Error('bad request')
    })
    app.onError((err, c) => {
      c.res = new Response(null, { status: 400 })
      return errorHandler(err, c)
    })

    const res = await app.request('/error', {}, bindings)
    expect(res.status).toBe(400)
  })

  it('includes stack trace in development', async () => {
    const app = new Hono<AppInstance>()
    app.get('/error', () => {
      throw new Error('dev error')
    })
    app.onError(errorHandler)

    const res = await app.request('/error', {}, bindings)
    const body = await res.json()
    expect(body.error.stack).toBeDefined()
    expect(body.error.stack).toContain('Error: dev error')
  })

  it('excludes stack trace in production', async () => {
    const app = new Hono<AppInstance>()
    app.get('/error', () => {
      throw new Error('prod error')
    })
    app.onError(errorHandler)

    const res = await app.request('/error', {}, productionBindings)
    const body = await res.json()
    expect(body.error.stack).toBeUndefined()
  })

  it('returns standard error response shape', async () => {
    const app = new Hono<AppInstance>()
    app.get('/error', () => {
      throw new Error('shape test')
    })
    app.onError(errorHandler)

    const res = await app.request('/error', {}, bindings)
    const body = await res.json()
    expect(body).toMatchObject({
      success: false,
      description: 'Something went wrong',
      error: { message: 'shape test' }
    })
  })
})

describe('notFoundHandler', () => {
  it('returns 404 with method and path in message', async () => {
    const app = new Hono<AppInstance>()
    app.notFound(notFoundHandler)

    const res = await app.request('/unknown', {}, bindings)
    expect(res.status).toBe(404)

    const body = await res.json()
    expect(body).toMatchObject({
      success: false,
      description: 'Verify the URL and HTTP method',
      error: { message: 'Route not found: GET /unknown' }
    })
  })
})
