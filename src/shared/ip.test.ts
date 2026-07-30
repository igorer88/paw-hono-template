import { Hono } from 'hono'
import { getClientIp, anonymizeIp } from './ip'

describe('getClientIp', () => {
  const createReq = (headers: Record<string, string>) => {
    const app = new Hono()
    app.get('/test', c => c.json({ ip: getClientIp(c) }))
    return app.request('/test', { headers })
  }

  it('returns cf-connecting-ip when present', async () => {
    const res = await createReq({ 'cf-connecting-ip': '203.0.113.1' })
    const body = await res.json()
    expect(body.ip).toBe('203.0.113.1')
  })

  it('falls back to x-forwarded-for first entry', async () => {
    const res = await createReq({
      'x-forwarded-for': '198.51.100.2, 192.0.2.1'
    })
    const body = await res.json()
    expect(body.ip).toBe('198.51.100.2')
  })

  it('falls back to x-real-ip', async () => {
    const res = await createReq({ 'x-real-ip': '10.0.0.1' })
    const body = await res.json()
    expect(body.ip).toBe('10.0.0.1')
  })

  it('prefers cf-connecting-ip over x-forwarded-for', async () => {
    const res = await createReq({
      'cf-connecting-ip': '203.0.113.1',
      'x-forwarded-for': '198.51.100.2'
    })
    const body = await res.json()
    expect(body.ip).toBe('203.0.113.1')
  })

  it('returns null when no ip headers are present', async () => {
    const res = await createReq({})
    const body = await res.json()
    expect(body.ip).toBeNull()
  })
})

describe('anonymizeIp', () => {
  it('masks last octet of IPv4', () => {
    expect(anonymizeIp('192.168.1.100')).toBe('192.168.1.xxx')
  })

  it('masks last group of IPv6', () => {
    expect(anonymizeIp('2001:db8::1')).toBe('2001:db8::xxxx')
  })

  it('handles full IPv6 address', () => {
    expect(anonymizeIp('2001:0db8:85a3:0000:0000:8a2e:0370:7334')).toBe(
      '2001:0db8:85a3:0000:0000:8a2e:0370:xxxx'
    )
  })

  it('does not modify non-ip strings', () => {
    expect(anonymizeIp('unknown')).toBe('unknown')
  })
})
