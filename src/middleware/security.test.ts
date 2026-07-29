import { Hono } from 'hono'
import { customCors } from './security'
import type { AppInstance } from '@/types'

const bindings = {
  ENVIRONMENT: 'development' as const,
  API_SECRET_KEY: 'test-secret',
  APP_DOMAIN: 'example.com',
}

describe('customCors', () => {
  let app: Hono<AppInstance>

  beforeEach(() => {
    app = new Hono<AppInstance>()
    app.use('*', customCors)
    app.get('/test', (c) => c.json({ success: true }))
  })

  it('allows localhost origins', async () => {
    const res = await app.request('/test', {
      headers: { Origin: 'http://localhost:5173' },
    }, bindings)

    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:5173')
  })

  it('allows APP_DOMAIN subdomains', async () => {
    const res = await app.request('/test', {
      headers: { Origin: 'https://app.example.com' },
    }, bindings)

    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://app.example.com')
  })

  it('returns fallback for unknown origins', async () => {
    const res = await app.request('/test', {
      headers: { Origin: 'https://evil.com' },
    }, bindings)

    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://example.com')
  })

  it('handles OPTIONS preflight requests', async () => {
    const res = await app.request('/test', {
      method: 'OPTIONS',
      headers: { Origin: 'http://localhost:5173' },
    }, bindings)

    expect(res.status).toBe(204)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:5173')
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('GET')
  })

  it('sets preflight cache header to 24 hours', async () => {
    const res = await app.request('/test', {
      method: 'OPTIONS',
      headers: { Origin: 'http://localhost:5173' },
    }, bindings)

    expect(res.headers.get('Access-Control-Max-Age')).toBe('86400')
  })

  it('does not set CORS header when no origin is provided', async () => {
    const res = await app.request('/test', {}, bindings)

    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull()
  })
})
