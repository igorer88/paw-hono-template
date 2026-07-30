import { Hono } from 'hono'
import { customCors } from './security'
import type { AppInstance } from '@/types'

const bindings = {
  ENVIRONMENT: 'development' as const,
  API_SECRET_KEY: 'test-secret',
  ALLOWED_ORIGIN: 'https://app.example.com,https://*.example.com'
}

const noAllowedBindings = {
  ENVIRONMENT: 'development' as const,
  API_SECRET_KEY: 'test-secret',
  ALLOWED_ORIGIN: ''
}

describe('customCors', () => {
  let app: Hono<AppInstance>

  beforeEach(() => {
    app = new Hono<AppInstance>()
    app.use('*', customCors)
    app.get('/test', c => c.json({ success: true }))
  })

  it('allows http localhost origins', async () => {
    const res = await app.request(
      '/test',
      {
        headers: { Origin: 'http://localhost:5173' }
      },
      bindings
    )

    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:5173')
  })

  it('allows https localhost origins', async () => {
    const res = await app.request(
      '/test',
      {
        headers: { Origin: 'https://localhost:5173' }
      },
      bindings
    )

    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://localhost:5173')
  })

  it('allows localhost without port', async () => {
    const res = await app.request(
      '/test',
      {
        headers: { Origin: 'http://localhost' }
      },
      bindings
    )

    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost')
  })

  it('allows origin matching ALLOWED_ORIGIN exact entry', async () => {
    const res = await app.request(
      '/test',
      {
        headers: { Origin: 'https://app.example.com' }
      },
      bindings
    )

    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://app.example.com')
  })

  it('allows origin matching ALLOWED_ORIGIN wildcard entry', async () => {
    const res = await app.request(
      '/test',
      {
        headers: { Origin: 'https://api.example.com' }
      },
      bindings
    )

    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://api.example.com')
  })

  it('returns fallback for unknown origins', async () => {
    const res = await app.request(
      '/test',
      {
        headers: { Origin: 'https://evil.com' }
      },
      bindings
    )

    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://app.example.com')
  })

  it('returns null for unknown origins when ALLOWED_ORIGIN is empty', async () => {
    const res = await app.request(
      '/test',
      {
        headers: { Origin: 'https://evil.com' }
      },
      noAllowedBindings
    )

    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull()
  })

  it('handles OPTIONS preflight requests', async () => {
    const res = await app.request(
      '/test',
      {
        method: 'OPTIONS',
        headers: { Origin: 'http://localhost:5173' }
      },
      bindings
    )

    expect(res.status).toBe(204)
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:5173')
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('GET')
  })

  it('sets preflight cache header to 24 hours', async () => {
    const res = await app.request(
      '/test',
      {
        method: 'OPTIONS',
        headers: { Origin: 'http://localhost:5173' }
      },
      bindings
    )

    expect(res.headers.get('Access-Control-Max-Age')).toBe('86400')
  })

  it('does not set CORS header when no origin is provided', async () => {
    const res = await app.request('/test', {}, bindings)

    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull()
  })
})
