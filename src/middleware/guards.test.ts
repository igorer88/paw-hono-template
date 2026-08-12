import { Hono } from 'hono'
import { errorHandler } from './error'
import { bodyLimitGuard, requestTimeout } from './guards'
import type { AppInstance } from '@/types'

const bindings = {
  ENVIRONMENT: 'development' as const,
  ALLOWED_ORIGIN: '',
  REQUEST_TIMEOUT_MS: 20,
  MAX_BODY_SIZE: 10
}

const createApp = () => {
  const app = new Hono<AppInstance>()
  app.use('*', requestTimeout)
  app.use('*', bodyLimitGuard)
  app.onError(errorHandler)
  app.get('/slow', async () => {
    await new Promise(resolve => setTimeout(resolve, 500))
    return new Response('done')
  })
  app.get('/ping', () => new Response('pong'))
  app.post('/echo', async c => c.json({ length: (await c.req.text()).length }))
  return app
}

describe('requestTimeout', () => {
  it('returns 504 when a route exceeds the configured timeout', async () => {
    const res = await createApp().request('/slow', {}, bindings)
    expect(res.status).toBe(504)

    const body = (await res.json()) as { success: boolean }
    expect(body.success).toBe(false)
  })
})

describe('bodyLimitGuard', () => {
  it('returns 413 when the body exceeds the configured limit', async () => {
    const res = await createApp().request(
      '/echo',
      { method: 'POST', body: 'x'.repeat(20) },
      bindings
    )
    expect(res.status).toBe(413)

    const body = (await res.json()) as { error: { message: string } }
    expect(body.error.message).toBe('Payload Too Large')
  })

  it('passes bodies under the limit through to the route', async () => {
    const res = await createApp().request('/echo', { method: 'POST', body: 'hello' }, bindings)
    expect(res.status).toBe(200)

    const body = (await res.json()) as { length: number }
    expect(body.length).toBe(5)
  })

  it('leaves bodyless requests untouched', async () => {
    const res = await createApp().request('/ping', {}, bindings)
    expect(res.status).toBe(200)
  })
})
