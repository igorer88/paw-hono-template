import { Hono } from 'hono'
import { correlationId } from './correlation'
import type { AppInstance } from '@/types'

const bindings = {
  ENVIRONMENT: 'development' as const,
  ALLOWED_ORIGIN: 'https://app.example.com'
}

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

const createApp = () => {
  const app = new Hono<AppInstance>()
  app.use('*', correlationId)
  app.get('/test', c => c.json({ requestId: c.get('requestId') }))
  return app
}

describe('correlationId', () => {
  it('generates and returns a request id when none is provided', async () => {
    const app = createApp()
    const res = await app.request('/test', {}, bindings)
    const header = res.headers.get('x-request-id')
    expect(header).toMatch(UUID_V4)
    const body = (await res.json()) as { requestId: string }
    expect(body.requestId).toBe(header)
  })

  it('honors an inbound x-request-id', async () => {
    const app = createApp()
    const res = await app.request('/test', { headers: { 'x-request-id': 'caller-123' } }, bindings)
    expect(res.headers.get('x-request-id')).toBe('caller-123')
    const body = (await res.json()) as { requestId: string }
    expect(body.requestId).toBe('caller-123')
  })

  it('falls back to x-correlation-id', async () => {
    const app = createApp()
    const res = await app.request(
      '/test',
      { headers: { 'x-correlation-id': 'corr-456' } },
      bindings
    )
    expect(res.headers.get('x-request-id')).toBe('corr-456')
  })

  it('ignores an invalid inbound id and generates its own', async () => {
    const app = createApp()
    const res = await app.request('/test', { headers: { 'x-request-id': 'bad value' } }, bindings)
    const header = res.headers.get('x-request-id')
    expect(header).toMatch(UUID_V4)
  })

  it('sets the header and envelope on error responses', async () => {
    const app = new Hono<AppInstance>()
    app.use('*', correlationId)
    app.get('/boom', () => {
      throw new Error('boom')
    })
    app.onError((err, c) => {
      return c.json(
        { success: false, error: { message: 'boom' }, requestId: c.get('requestId') },
        500
      )
    })

    const res = await app.request('/boom', {}, bindings)
    const header = res.headers.get('x-request-id')
    expect(header).toMatch(UUID_V4)
    const body = (await res.json()) as { requestId: string }
    expect(body.requestId).toBe(header)
  })
})
