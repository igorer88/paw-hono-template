import {
  generateRequestId,
  sanitizeRequestId,
  extractRequestId,
  extractTraceParent
} from './requestId'

describe('generateRequestId', () => {
  it('returns a UUID v4 string', () => {
    expect(generateRequestId()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    )
  })

  it('returns unique values', () => {
    expect(generateRequestId()).not.toBe(generateRequestId())
  })
})

describe('sanitizeRequestId', () => {
  it('accepts allowed characters', () => {
    expect(sanitizeRequestId('abc-123.xyz_4:5')).toBe('abc-123.xyz_4:5')
  })

  it('trims surrounding whitespace', () => {
    expect(sanitizeRequestId('  abc  ')).toBe('abc')
  })

  it('rejects empty or whitespace-only values', () => {
    expect(sanitizeRequestId('')).toBeNull()
    expect(sanitizeRequestId('   ')).toBeNull()
  })

  it('rejects values with internal spaces', () => {
    expect(sanitizeRequestId('bad value')).toBeNull()
  })

  it('rejects values longer than 64 characters', () => {
    expect(sanitizeRequestId('a'.repeat(65))).toBeNull()
    expect(sanitizeRequestId('a'.repeat(64))).toBe('a'.repeat(64))
  })

  it('returns null for nullish input', () => {
    expect(sanitizeRequestId(null)).toBeNull()
    expect(sanitizeRequestId(undefined)).toBeNull()
  })
})

describe('extractRequestId', () => {
  it('prefers x-request-id over x-correlation-id', () => {
    const headers = new Headers({ 'x-request-id': 'a', 'x-correlation-id': 'b' })
    expect(extractRequestId(headers)).toBe('a')
  })

  it('falls back to x-correlation-id', () => {
    const headers = new Headers({ 'x-correlation-id': 'b' })
    expect(extractRequestId(headers)).toBe('b')
  })

  it('returns null when absent or invalid', () => {
    expect(extractRequestId(new Headers())).toBeNull()
    expect(extractRequestId(new Headers({ 'x-request-id': 'not valid' }))).toBeNull()
  })
})

describe('extractTraceParent', () => {
  const valid = '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01'

  it('accepts a valid traceparent', () => {
    expect(extractTraceParent(new Headers({ traceparent: valid }))).toBe(valid)
  })

  it('rejects a short trace id', () => {
    expect(
      extractTraceParent(new Headers({ traceparent: '00-4bf9-00f067aa0ba902b7-01' }))
    ).toBeNull()
  })

  it('rejects a missing flags field', () => {
    expect(
      extractTraceParent(
        new Headers({ traceparent: '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7' })
      )
    ).toBeNull()
  })

  it('rejects the reserved ff version', () => {
    expect(
      extractTraceParent(
        new Headers({ traceparent: 'ff-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01' })
      )
    ).toBeNull()
  })

  it('rejects non-hex fields', () => {
    expect(
      extractTraceParent(
        new Headers({ traceparent: 'zz-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01' })
      )
    ).toBeNull()
  })

  it('returns null when absent', () => {
    expect(extractTraceParent(new Headers())).toBeNull()
  })
})
