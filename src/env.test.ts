import { envSchema, validateEnv } from './env'

describe('envSchema', () => {
  it('passes with valid env', () => {
    const result = envSchema.parse({
      ENVIRONMENT: 'development',
      ALLOWED_ORIGIN: 'https://app.example.com',
      LOGGER_LEVELS: 'debug'
    })
    expect(result.ENVIRONMENT).toBe('development')
    expect(result.ALLOWED_ORIGIN).toBe('https://app.example.com')
    expect(result.LOGGER_LEVELS).toBe('debug')
  })

  it('defaults ALLOWED_ORIGIN to empty string', () => {
    const result = envSchema.parse({ ENVIRONMENT: 'development' })
    expect(result.ALLOWED_ORIGIN).toBe('')
  })

  it('fails when ENVIRONMENT is missing', () => {
    expect(() => envSchema.parse({ ALLOWED_ORIGIN: 'https://app.example.com' })).toThrow()
    expect(() => validateEnv({ ALLOWED_ORIGIN: 'https://app.example.com' })).toThrow(
      'Invalid environment variables'
    )
  })

  it('defaults LOGGER_LEVELS to info', () => {
    const result = envSchema.parse({
      ENVIRONMENT: 'development',
      ALLOWED_ORIGIN: 'https://app.example.com'
    })
    expect(result.LOGGER_LEVELS).toBe('info')
  })

  it('accepts all valid LOGGER_LEVELS values', () => {
    for (const level of ['none', 'info', 'debug'] as const) {
      const result = envSchema.parse({ ENVIRONMENT: 'development', LOGGER_LEVELS: level })
      expect(result.LOGGER_LEVELS).toBe(level)
    }
  })

  it('fails when LOGGER_LEVELS is invalid', () => {
    expect(() =>
      envSchema.parse({ ENVIRONMENT: 'development', LOGGER_LEVELS: 'verbose' })
    ).toThrow()
  })

  it('defaults IP_LOG_LEVEL to partial', () => {
    const result = envSchema.parse({
      ENVIRONMENT: 'development',
      ALLOWED_ORIGIN: 'https://app.example.com'
    })
    expect(result.IP_LOG_LEVEL).toBe('partial')
  })

  it('accepts all valid IP_LOG_LEVEL values', () => {
    for (const level of ['none', 'full', 'partial'] as const) {
      const result = envSchema.parse({ ENVIRONMENT: 'development', IP_LOG_LEVEL: level })
      expect(result.IP_LOG_LEVEL).toBe(level)
    }
  })

  it('fails when IP_LOG_LEVEL is invalid', () => {
    expect(() => envSchema.parse({ ENVIRONMENT: 'development', IP_LOG_LEVEL: 'enabled' })).toThrow()
  })

  it('preserves unknown bindings via passthrough', () => {
    const result = envSchema.parse({
      ENVIRONMENT: 'production',
      MY_KV: { value: 1 }
    })
    expect(result.MY_KV).toEqual({ value: 1 })
  })

  it('rejects bare * in ALLOWED_ORIGIN', () => {
    expect(() => envSchema.parse({ ENVIRONMENT: 'development', ALLOWED_ORIGIN: '*' })).toThrow(
      'explicit origins only'
    )
    expect(() =>
      envSchema.parse({ ENVIRONMENT: 'development', ALLOWED_ORIGIN: 'https://a.com,*' })
    ).toThrow('explicit origins only')
  })

  it('accepts wildcard suffixes in ALLOWED_ORIGIN', () => {
    const result = envSchema.parse({
      ENVIRONMENT: 'development',
      ALLOWED_ORIGIN: 'https://*.example.com'
    })
    expect(result.ALLOWED_ORIGIN).toBe('https://*.example.com')
  })

  it('accepts an explicit http origin', () => {
    const result = envSchema.parse({
      ENVIRONMENT: 'development',
      ALLOWED_ORIGIN: 'http://internal.example.com'
    })
    expect(result.ALLOWED_ORIGIN).toBe('http://internal.example.com')
  })

  it('accepts origins with explicit ports', () => {
    const result = envSchema.parse({
      ENVIRONMENT: 'development',
      ALLOWED_ORIGIN: 'https://app.example.com:8443'
    })
    expect(result.ALLOWED_ORIGIN).toBe('https://app.example.com:8443')
  })

  it('accepts multiple comma-separated origins', () => {
    const result = envSchema.parse({
      ENVIRONMENT: 'development',
      ALLOWED_ORIGIN: 'https://app.example.com, https://*.example.org'
    })
    expect(result.ALLOWED_ORIGIN).toBe('https://app.example.com, https://*.example.org')
  })

  it('rejects scheme-less origins in ALLOWED_ORIGIN', () => {
    expect(() =>
      envSchema.parse({ ENVIRONMENT: 'development', ALLOWED_ORIGIN: 'app.example.com' })
    ).toThrow('not a valid origin')
    expect(() =>
      envSchema.parse({ ENVIRONMENT: 'development', ALLOWED_ORIGIN: '*.example.com' })
    ).toThrow('not a valid origin')
  })

  it('rejects non-http schemes in ALLOWED_ORIGIN', () => {
    expect(() =>
      envSchema.parse({ ENVIRONMENT: 'development', ALLOWED_ORIGIN: 'file://app.example.com' })
    ).toThrow('explicit http:// or https://')
    expect(() =>
      envSchema.parse({ ENVIRONMENT: 'development', ALLOWED_ORIGIN: 'ws://app.example.com' })
    ).toThrow('explicit http:// or https://')
  })

  it('rejects origins with a path, query, fragment, or trailing slash', () => {
    expect(() =>
      envSchema.parse({ ENVIRONMENT: 'development', ALLOWED_ORIGIN: 'https://app.example.com/' })
    ).toThrow('bare origin')
    expect(() =>
      envSchema.parse({
        ENVIRONMENT: 'development',
        ALLOWED_ORIGIN: 'https://app.example.com/callback'
      })
    ).toThrow('bare origin')
    expect(() =>
      envSchema.parse({ ENVIRONMENT: 'development', ALLOWED_ORIGIN: 'https://app.example.com?x=1' })
    ).toThrow('bare origin')
    expect(() =>
      envSchema.parse({ ENVIRONMENT: 'development', ALLOWED_ORIGIN: 'https://app.example.com#top' })
    ).toThrow('bare origin')
  })

  it('rejects wildcards that are not a leading subdomain label', () => {
    expect(() =>
      envSchema.parse({ ENVIRONMENT: 'development', ALLOWED_ORIGIN: 'https://sub.*.com' })
    ).toThrow('wildcard must be a leading label')
  })

  it('defaults REQUEST_TIMEOUT_MS to 10000', () => {
    const result = envSchema.parse({
      ENVIRONMENT: 'development',
      ALLOWED_ORIGIN: 'https://app.example.com'
    })
    expect(result.REQUEST_TIMEOUT_MS).toBe(10000)
  })

  it('defaults MAX_BODY_SIZE to 1000000', () => {
    const result = envSchema.parse({
      ENVIRONMENT: 'development',
      ALLOWED_ORIGIN: 'https://app.example.com'
    })
    expect(result.MAX_BODY_SIZE).toBe(1_000_000)
  })

  it('coerces numeric guard settings from strings', () => {
    const result = envSchema.parse({
      ENVIRONMENT: 'development',
      REQUEST_TIMEOUT_MS: '5000',
      MAX_BODY_SIZE: '512'
    })
    expect(result.REQUEST_TIMEOUT_MS).toBe(5000)
    expect(result.MAX_BODY_SIZE).toBe(512)
  })

  it('rejects non-positive guard settings', () => {
    expect(() => envSchema.parse({ ENVIRONMENT: 'development', REQUEST_TIMEOUT_MS: 0 })).toThrow()
    expect(() => envSchema.parse({ ENVIRONMENT: 'development', MAX_BODY_SIZE: -1 })).toThrow()
  })
})

describe('validateEnv', () => {
  it('returns parsed data on success', () => {
    const result = validateEnv({
      ENVIRONMENT: 'development',
      ALLOWED_ORIGIN: 'https://app.example.com'
    })
    expect(result.ENVIRONMENT).toBe('development')
  })

  it('throws a descriptive error on failure', () => {
    expect(() => validateEnv({ ENVIRONMENT: 'bogus' })).toThrow('Invalid environment variables')
  })
})
