import { getClientIp, anonymizeIp, normalizeIp } from './ip'

describe('getClientIp', () => {
  it('returns cf-connecting-ip when present', () => {
    const headers = new Headers({ 'cf-connecting-ip': '203.0.113.1' })
    expect(getClientIp(headers)).toBe('203.0.113.1')
  })

  it('uses the rightmost x-forwarded-for entry', () => {
    const headers = new Headers({ 'x-forwarded-for': '198.51.100.2, 192.0.2.1' })
    expect(getClientIp(headers)).toBe('192.0.2.1')
  })

  it('falls back to x-real-ip', () => {
    const headers = new Headers({ 'x-real-ip': '10.0.0.1' })
    expect(getClientIp(headers)).toBe('10.0.0.1')
  })

  it('prefers cf-connecting-ip over x-forwarded-for', () => {
    const headers = new Headers({
      'cf-connecting-ip': '203.0.113.1',
      'x-forwarded-for': '198.51.100.2'
    })
    expect(getClientIp(headers)).toBe('203.0.113.1')
  })

  it('ignores non-IP garbage in headers', () => {
    const headers = new Headers({
      'x-forwarded-for': 'evil garbage, 203.0.113.1',
      'x-real-ip': 'not-an-ip'
    })
    expect(getClientIp(headers)).toBe('203.0.113.1')
  })

  it('returns null when no valid ip header is present', () => {
    expect(getClientIp(new Headers({ 'x-real-ip': 'garbage' }))).toBeNull()
  })

  it('returns null when no ip headers are present', () => {
    expect(getClientIp(new Headers())).toBeNull()
  })
})

describe('normalizeIp', () => {
  it('accepts a valid IPv4', () => {
    expect(normalizeIp('203.0.113.1')).toBe('203.0.113.1')
  })

  it('accepts a bracketed IPv6', () => {
    expect(normalizeIp('[2001:db8::1]')).toBe('2001:db8::1')
  })

  it('accepts a plain IPv6', () => {
    expect(normalizeIp('2001:db8::1')).toBe('2001:db8::1')
  })

  it('rejects out-of-range IPv4 octets', () => {
    expect(normalizeIp('999.1.1.1')).toBeNull()
  })

  it('rejects empty and whitespace-only values', () => {
    expect(normalizeIp('')).toBeNull()
    expect(normalizeIp('   ')).toBeNull()
  })

  it('returns null for nullish input', () => {
    expect(normalizeIp(null)).toBeNull()
    expect(normalizeIp(undefined)).toBeNull()
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
