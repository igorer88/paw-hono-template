import { Hono } from 'hono'
import { customLogger } from './logger'
import { correlationId } from './correlation'
import { LoggerLevel, IpLogLevel } from '@/env'
import type { AppInstance } from '@/types'
import type { MockInstance } from 'vitest'

const baseBindings = {
  ENVIRONMENT: 'development' as const,
  ALLOWED_ORIGIN: ''
}

const createApp = (opts: { loggerLevel: string; ipLogLevel: string }) => {
  const app = new Hono<AppInstance>()
  app.use('*', correlationId)
  app.use('*', customLogger)
  app.get('/test', c => c.json({ success: true }))
  app.get('/search', c => c.json({ q: c.req.query('q') }))
  return {
    app,
    bindings: {
      ...baseBindings,
      LOGGER_LEVELS: opts.loggerLevel,
      IP_LOG_LEVEL: opts.ipLogLevel
    }
  }
}

const ipHeader = { 'cf-connecting-ip': '203.0.113.1' }

describe('customLogger', () => {
  let consoleSpy: MockInstance<(...args: string[]) => void>

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  it('logs nothing when level is none', async () => {
    const { app, bindings } = createApp({
      loggerLevel: LoggerLevel.NONE,
      ipLogLevel: IpLogLevel.PARTIAL
    })
    await app.request('/test', {}, bindings)
    expect(consoleSpy).not.toHaveBeenCalled()
  })

  it('logs request via hono logger when level is info', async () => {
    const { app, bindings } = createApp({
      loggerLevel: LoggerLevel.INFO,
      ipLogLevel: IpLogLevel.NONE
    })
    await app.request('/test', {}, bindings)

    expect(consoleSpy).toHaveBeenCalled()
    const all = consoleSpy.mock.calls.map(c => c.join(' '))
    expect(all.some(l => l.includes('GET') && l.includes('/test'))).toBe(true)
  })

  it('logs headers and query in debug mode', async () => {
    const { app, bindings } = createApp({
      loggerLevel: LoggerLevel.DEBUG,
      ipLogLevel: IpLogLevel.NONE
    })
    await app.request('/search?q=hello', { headers: { 'x-custom': 'val' } }, bindings)

    const all = consoleSpy.mock.calls.map(c => c[0])

    expect(all.some(l => l.includes('  Headers:'))).toBe(true)
    expect(all.some(l => l.includes('  Query:'))).toBe(true)
  })

  it('redacts sensitive headers in debug mode', async () => {
    const { app, bindings } = createApp({
      loggerLevel: LoggerLevel.DEBUG,
      ipLogLevel: IpLogLevel.NONE
    })
    await app.request(
      '/test',
      {
        headers: {
          Authorization: 'Bearer secret-token',
          Cookie: 'session=abc123',
          'X-API-Key': 'api-key-123'
        }
      },
      bindings
    )

    const all = consoleSpy.mock.calls.map(c => JSON.stringify(c))
    expect(all.some(l => l.includes('secret-token'))).toBe(false)
    expect(all.some(l => l.includes('abc123'))).toBe(false)
    expect(all.some(l => l.includes('api-key-123'))).toBe(false)
  })

  it('redacts query values in debug mode', async () => {
    const { app, bindings } = createApp({
      loggerLevel: LoggerLevel.DEBUG,
      ipLogLevel: IpLogLevel.NONE
    })
    await app.request('/search?token=supersecret&user=alice', {}, bindings)

    const all = consoleSpy.mock.calls.map(c => JSON.stringify(c))
    expect(all.some(l => l.includes('supersecret'))).toBe(false)
    expect(all.some(l => l.includes('alice'))).toBe(false)
  })

  it('logs allowlisted header values in debug mode', async () => {
    const { app, bindings } = createApp({
      loggerLevel: LoggerLevel.DEBUG,
      ipLogLevel: IpLogLevel.NONE
    })
    await app.request('/test', { headers: { 'accept-encoding': 'gzip' } }, bindings)

    const all = consoleSpy.mock.calls.map(c => JSON.stringify(c))
    expect(all.some(l => l.includes('gzip'))).toBe(true)
  })

  it('redacts non-allowlisted headers in debug mode', async () => {
    const { app, bindings } = createApp({
      loggerLevel: LoggerLevel.DEBUG,
      ipLogLevel: IpLogLevel.NONE
    })
    await app.request('/test', { headers: { 'x-custom': 'val' } }, bindings)

    const all = consoleSpy.mock.calls.map(c => JSON.stringify(c))
    expect(all.some(l => l.includes('val'))).toBe(false)
  })

  it('does not log IP chains in debug mode', async () => {
    const { app, bindings } = createApp({
      loggerLevel: LoggerLevel.DEBUG,
      ipLogLevel: IpLogLevel.NONE
    })
    await app.request(
      '/test',
      { headers: { 'x-forwarded-for': '198.51.100.2, 192.0.2.1' } },
      bindings
    )

    const all = consoleSpy.mock.calls.map(c => JSON.stringify(c))
    expect(all.some(l => l.includes('198.51.100.2'))).toBe(false)
    expect(all.some(l => l.includes('192.0.2.1'))).toBe(false)
  })

  it('defaults to info when level is missing', async () => {
    const app = new Hono<AppInstance>()
    app.use('*', customLogger)
    app.get('/test', c => c.json({ success: true }))

    await app.request('/test', {}, baseBindings)

    expect(consoleSpy).toHaveBeenCalled()
  })

  it('prefixes log lines with the request id', async () => {
    const { app, bindings } = createApp({
      loggerLevel: LoggerLevel.INFO,
      ipLogLevel: IpLogLevel.NONE
    })
    await app.request('/test', { headers: { 'x-request-id': 'caller-123' } }, bindings)

    const all = consoleSpy.mock.calls.map(c => c.join(' '))
    expect(all.some(l => l.includes('[req:caller-123] <-- GET /test'))).toBe(true)
    expect(all.some(l => l.includes('[req:caller-123] --> GET /test'))).toBe(true)
  })

  describe('ip logging', () => {
    it('logs full IP when IP_LOG_LEVEL is full', async () => {
      const { app, bindings } = createApp({
        loggerLevel: LoggerLevel.INFO,
        ipLogLevel: IpLogLevel.FULL
      })
      await app.request('/test', { headers: ipHeader }, bindings)

      const all = consoleSpy.mock.calls.map(c => c.join(' '))
      expect(all.some(l => l.includes('203.0.113.1'))).toBe(true)
    })

    it('logs anonymized IP when IP_LOG_LEVEL is partial', async () => {
      const { app, bindings } = createApp({
        loggerLevel: LoggerLevel.INFO,
        ipLogLevel: IpLogLevel.PARTIAL
      })
      await app.request('/test', { headers: ipHeader }, bindings)

      const all = consoleSpy.mock.calls.map(c => c.join(' '))
      expect(all.some(l => l.includes('203.0.113.xxx'))).toBe(true)
    })

    it('does not log IP when IP_LOG_LEVEL is none', async () => {
      const { app, bindings } = createApp({
        loggerLevel: LoggerLevel.INFO,
        ipLogLevel: IpLogLevel.NONE
      })
      await app.request('/test', { headers: ipHeader }, bindings)

      const all = consoleSpy.mock.calls.map(c => c.join(' '))
      expect(all.some(l => l.includes('203.0.113'))).toBe(false)
    })

    it('logs IP in debug mode too', async () => {
      const { app, bindings } = createApp({
        loggerLevel: LoggerLevel.DEBUG,
        ipLogLevel: IpLogLevel.PARTIAL
      })
      await app.request('/test', { headers: ipHeader }, bindings)

      const all = consoleSpy.mock.calls.map(c => c.join(' '))
      expect(all.some(l => l.includes('203.0.113.xxx'))).toBe(true)
    })
  })
})
