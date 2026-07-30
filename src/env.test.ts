import { envSchema, validateEnv } from './env'

describe('envSchema', () => {
  it('passes with valid env', () => {
    const result = envSchema.parse({
      ENVIRONMENT: 'development',
      API_SECRET_KEY: 'secret',
      ALLOWED_ORIGIN: 'https://app.example.com',
      LOGGER_LEVELS: 'debug'
    })
    expect(result.ENVIRONMENT).toBe('development')
    expect(result.API_SECRET_KEY).toBe('secret')
    expect(result.ALLOWED_ORIGIN).toBe('https://app.example.com')
    expect(result.LOGGER_LEVELS).toBe('debug')
  })

  it('defaults ALLOWED_ORIGIN to empty string', () => {
    const result = envSchema.parse({
      ENVIRONMENT: 'development',
      API_SECRET_KEY: 'secret'
    })
    expect(result.ALLOWED_ORIGIN).toBe('')
  })

  it('defaults ENVIRONMENT to development', () => {
    const result = envSchema.parse({
      API_SECRET_KEY: 'secret',
      ALLOWED_ORIGIN: 'https://app.example.com'
    })
    expect(result.ENVIRONMENT).toBe('development')
  })

  it('fails when ALLOWED_ORIGIN is missing (undefined)', () => {
    const result = envSchema.safeParse({
      ENVIRONMENT: 'development',
      API_SECRET_KEY: 'secret'
    })
    expect(result.success).toBe(true)
    expect(result.data?.ALLOWED_ORIGIN).toBe('')
  })

  it('fails when API_SECRET_KEY is empty', () => {
    expect(() =>
      envSchema.parse({
        ENVIRONMENT: 'development',
        API_SECRET_KEY: '',
        ALLOWED_ORIGIN: 'https://app.example.com'
      })
    ).toThrow()
  })

  it('fails when ENVIRONMENT is invalid', () => {
    expect(() =>
      envSchema.parse({
        ENVIRONMENT: 'invalid',
        API_SECRET_KEY: 'secret',
        ALLOWED_ORIGIN: 'https://app.example.com'
      })
    ).toThrow()
  })

  it('fails when API_SECRET_KEY is missing', () => {
    expect(() =>
      envSchema.parse({ ENVIRONMENT: 'development', ALLOWED_ORIGIN: 'https://app.example.com' })
    ).toThrow()
  })

  it('defaults LOGGER_LEVELS to info', () => {
    const result = envSchema.parse({
      API_SECRET_KEY: 'secret',
      ALLOWED_ORIGIN: 'https://app.example.com'
    })
    expect(result.LOGGER_LEVELS).toBe('info')
  })

  it('accepts all valid LOGGER_LEVELS values', () => {
    for (const level of ['none', 'info', 'debug'] as const) {
      const result = envSchema.parse({
        API_SECRET_KEY: 'secret',
        LOGGER_LEVELS: level
      })
      expect(result.LOGGER_LEVELS).toBe(level)
    }
  })

  it('fails when LOGGER_LEVELS is invalid', () => {
    expect(() =>
      envSchema.parse({
        API_SECRET_KEY: 'secret',
        LOGGER_LEVELS: 'verbose'
      })
    ).toThrow()
  })

  it('defaults IP_LOG_LEVEL to partial', () => {
    const result = envSchema.parse({
      API_SECRET_KEY: 'secret',
      ALLOWED_ORIGIN: 'https://app.example.com'
    })
    expect(result.IP_LOG_LEVEL).toBe('partial')
  })

  it('accepts all valid IP_LOG_LEVEL values', () => {
    for (const level of ['none', 'full', 'partial'] as const) {
      const result = envSchema.parse({
        API_SECRET_KEY: 'secret',
        IP_LOG_LEVEL: level
      })
      expect(result.IP_LOG_LEVEL).toBe(level)
    }
  })

  it('fails when IP_LOG_LEVEL is invalid', () => {
    expect(() =>
      envSchema.parse({
        API_SECRET_KEY: 'secret',
        IP_LOG_LEVEL: 'enabled'
      })
    ).toThrow()
  })
})

describe('validateEnv', () => {
  it('returns parsed data on success', () => {
    const result = validateEnv({
      API_SECRET_KEY: 'secret',
      ALLOWED_ORIGIN: 'https://app.example.com'
    })
    expect(result.ENVIRONMENT).toBe('development')
  })

  it('throws a descriptive error on failure', () => {
    expect(() =>
      validateEnv({ API_SECRET_KEY: '', ALLOWED_ORIGIN: 'https://app.example.com' })
    ).toThrow('Invalid environment variables')
  })
})
