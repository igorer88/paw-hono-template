import { envSchema, validateEnv } from './env'

describe('envSchema', () => {
  it('passes with valid env', () => {
    const result = envSchema.parse({
      ENVIRONMENT: 'development',
      API_SECRET_KEY: 'secret',
      APP_DOMAIN: 'example.com'
    })
    expect(result.ENVIRONMENT).toBe('development')
    expect(result.API_SECRET_KEY).toBe('secret')
    expect(result.APP_DOMAIN).toBe('example.com')
  })

  it('defaults ENVIRONMENT to development', () => {
    const result = envSchema.parse({
      API_SECRET_KEY: 'secret',
      APP_DOMAIN: 'example.com'
    })
    expect(result.ENVIRONMENT).toBe('development')
  })

  it('fails when APP_DOMAIN is missing', () => {
    expect(() =>
      envSchema.parse({ ENVIRONMENT: 'development', API_SECRET_KEY: 'secret' })
    ).toThrow()
  })

  it('fails when API_SECRET_KEY is empty', () => {
    expect(() =>
      envSchema.parse({
        ENVIRONMENT: 'development',
        API_SECRET_KEY: '',
        APP_DOMAIN: 'example.com'
      })
    ).toThrow()
  })

  it('fails when ENVIRONMENT is invalid', () => {
    expect(() =>
      envSchema.parse({
        ENVIRONMENT: 'invalid',
        API_SECRET_KEY: 'secret',
        APP_DOMAIN: 'example.com'
      })
    ).toThrow()
  })

  it('fails when API_SECRET_KEY is missing', () => {
    expect(() =>
      envSchema.parse({ ENVIRONMENT: 'development', APP_DOMAIN: 'example.com' })
    ).toThrow()
  })
})

describe('validateEnv', () => {
  it('returns parsed data on success', () => {
    const result = validateEnv({
      API_SECRET_KEY: 'secret',
      APP_DOMAIN: 'example.com'
    })
    expect(result.ENVIRONMENT).toBe('development')
  })

  it('throws a descriptive error on failure', () => {
    expect(() => validateEnv({ API_SECRET_KEY: '', APP_DOMAIN: 'example.com' })).toThrow(
      'Invalid environment variables'
    )
  })
})
