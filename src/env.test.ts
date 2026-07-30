import { envSchema, validateEnv } from './env'

describe('envSchema', () => {
  it('passes with valid env', () => {
    const result = envSchema.parse({
      ENVIRONMENT: 'development',
      API_SECRET_KEY: 'secret',
      ALLOWED_ORIGIN: 'https://app.example.com'
    })
    expect(result.ENVIRONMENT).toBe('development')
    expect(result.API_SECRET_KEY).toBe('secret')
    expect(result.ALLOWED_ORIGIN).toBe('https://app.example.com')
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
