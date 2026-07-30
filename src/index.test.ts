import worker from './index'

const bindings: Record<string, unknown> = {
  ENVIRONMENT: 'development',
  ALLOWED_ORIGIN: 'https://app.example.com'
}

const ctx = { waitUntil: () => {} } as unknown as ExecutionContext

describe('App integration', () => {
  it('returns 200 for root path', async () => {
    const res = await worker.fetch(new Request('http://localhost/'), bindings, ctx)
    expect(res.status).toBe(200)
  })

  it('returns expected text for root path', async () => {
    const res = await worker.fetch(new Request('http://localhost/'), bindings, ctx)
    const text = await res.text()
    expect(text).toContain('Paw Hono Worker Engine Active')
  })

  it('returns 404 for unknown routes', async () => {
    const res = await worker.fetch(new Request('http://localhost/unknown'), bindings, ctx)
    expect(res.status).toBe(404)

    const body = await res.json()
    expect(body).toMatchObject({
      success: false,
      error: { message: 'Route not found: GET /unknown' }
    })
  })

  it('mounts health router at /health', async () => {
    const res = await worker.fetch(new Request('http://localhost/health'), bindings, ctx)
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.success).toBe(true)
  })

  it('sets security headers on responses', async () => {
    const res = await worker.fetch(new Request('http://localhost/'), bindings, ctx)

    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(res.headers.get('X-XSS-Protection')).toBe('0')
  })

  it('does not set CORS header when no origin is present', async () => {
    const res = await worker.fetch(new Request('http://localhost/'), bindings, ctx)

    expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull()
  })
})
