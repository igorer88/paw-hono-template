import { Hono } from 'hono'
import { healthRouter } from './health'
import type { AppInstance } from '@/types'

const bindings = {
  ENVIRONMENT: 'development' as const,
  API_SECRET_KEY: 'test-secret',
  ALLOWED_ORIGIN: 'https://app.example.com'
}

describe('Health endpoint', () => {
  let app: Hono<AppInstance>

  beforeEach(() => {
    app = new Hono<AppInstance>()
    app.route('/health', healthRouter)
  })

  it('returns 200 status', async () => {
    const res = await app.request('/health', {}, bindings)
    expect(res.status).toBe(200)
  })

  it('returns correct response shape', async () => {
    const res = await app.request('/health', {}, bindings)
    const body = await res.json()

    expect(body).toMatchObject({
      success: true,
      description: 'Health check passed',
      data: { message: 'Hello Hono!' }
    })
  })
})
