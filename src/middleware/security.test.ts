import { Hono } from 'hono'
import { customCors } from './security'
import type { AppInstance } from '@/types'

const bindings = {
  ENVIRONMENT: 'development' as const,
  ALLOWED_ORIGIN: 'https://app.example.com,https://*.example.com'
}

const noAllowedBindings = {
  ENVIRONMENT: 'development' as const,
  ALLOWED_ORIGIN: ''
}

const productionBindings = {
  ENVIRONMENT: 'production' as const,
  ALLOWED_ORIGIN: 'https://app.example.com'
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

  it('denies unknown origins instead of falling back', async () => {
    const res = await app.request(
      '/test',
      {
        headers: { Origin: 'https://evil.com' }
      },
      bindings
    )

    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull()
  })

  it('denies localhost origins in production', async () => {
    const res = await app.request(
      '/test',
      {
        headers: { Origin: 'http://localhost:5173' }
      },
      productionBindings
    )

    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull()
  })

  it('allows allowlisted origin in production', async () => {
    const res = await app.request(
      '/test',
      {
        headers: { Origin: 'https://app.example.com' }
      },
      productionBindings
    )

    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://app.example.com')
  })

  it('allows 127.0.0.1 origins in development', async () => {
    const res = await app.request(
      '/test',
      {
        headers: { Origin: 'http://127.0.0.1:5173' }
      },
      bindings
    )

    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('http://127.0.0.1:5173')
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

  it('exposes the X-Request-Id header to browser clients', async () => {
    const res = await app.request(
      '/test',
      {
        headers: { Origin: 'http://localhost:5173' }
      },
      bindings
    )

    expect(res.headers.get('Access-Control-Expose-Headers')).toContain('X-Request-Id')
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
