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

  it('defaults ENVIRONMENT to development', () => {
    const result = envSchema.parse({ ALLOWED_ORIGIN: 'https://app.example.com' })
    expect(result.ENVIRONMENT).toBe('development')
  })

  it('defaults LOGGER_LEVELS to info', () => {
    const result = envSchema.parse({ ALLOWED_ORIGIN: 'https://app.example.com' })
    expect(result.LOGGER_LEVELS).toBe('info')
  })

  it('accepts all valid LOGGER_LEVELS values', () => {
    for (const level of ['none', 'info', 'debug'] as const) {
      const result = envSchema.parse({ LOGGER_LEVELS: level })
      expect(result.LOGGER_LEVELS).toBe(level)
    }
  })

  it('fails when LOGGER_LEVELS is invalid', () => {
    expect(() => envSchema.parse({ LOGGER_LEVELS: 'verbose' })).toThrow()
  })

  it('defaults IP_LOG_LEVEL to partial', () => {
    const result = envSchema.parse({ ALLOWED_ORIGIN: 'https://app.example.com' })
    expect(result.IP_LOG_LEVEL).toBe('partial')
  })

  it('accepts all valid IP_LOG_LEVEL values', () => {
    for (const level of ['none', 'full', 'partial'] as const) {
      const result = envSchema.parse({ IP_LOG_LEVEL: level })
      expect(result.IP_LOG_LEVEL).toBe(level)
    }
  })

  it('fails when IP_LOG_LEVEL is invalid', () => {
    expect(() => envSchema.parse({ IP_LOG_LEVEL: 'enabled' })).toThrow()
  })

  it('preserves unknown bindings via passthrough', () => {
    const result = envSchema.parse({
      ENVIRONMENT: 'production',
      MY_KV: { value: 1 }
    })
    expect(result.MY_KV).toEqual({ value: 1 })
  })

  it('rejects bare * in ALLOWED_ORIGIN', () => {
    expect(() => envSchema.parse({ ALLOWED_ORIGIN: '*' })).toThrow('explicit origins only')
    expect(() => envSchema.parse({ ALLOWED_ORIGIN: 'https://a.com,*' })).toThrow(
      'explicit origins only'
    )
  })

  it('accepts wildcard suffixes in ALLOWED_ORIGIN', () => {
    const result = envSchema.parse({ ALLOWED_ORIGIN: 'https://*.example.com' })
    expect(result.ALLOWED_ORIGIN).toBe('https://*.example.com')
  })
})

describe('validateEnv', () => {
  it('returns parsed data on success', () => {
    const result = validateEnv({ ALLOWED_ORIGIN: 'https://app.example.com' })
    expect(result.ENVIRONMENT).toBe('development')
  })

  it('throws a descriptive error on failure', () => {
    expect(() => validateEnv({ ENVIRONMENT: 'bogus' })).toThrow('Invalid environment variables')
  })
})
