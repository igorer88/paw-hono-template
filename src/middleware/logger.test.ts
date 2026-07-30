import { Hono } from 'hono'
import { customLogger } from './logger'
import { LoggerLevel } from '@/env'
import type { AppInstance } from '@/types'

const baseBindings = {
  ENVIRONMENT: 'development' as const,
  API_SECRET_KEY: 'test-secret',
  ALLOWED_ORIGIN: ''
}

const createApp = (loggerLevel: string) => {
  const app = new Hono<AppInstance>()
  app.use('*', customLogger)
  app.get('/test', c => c.json({ success: true }))
  app.get('/search', c => c.json({ q: c.req.query('q') }))
  return {
    app,
    bindings: { ...baseBindings, LOGGER_LEVELS: loggerLevel }
  }
}

describe('customLogger', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  it('logs nothing when level is none', async () => {
    const { app, bindings } = createApp(LoggerLevel.NONE)
    await app.request('/test', {}, bindings)
    expect(consoleSpy).not.toHaveBeenCalled()
  })

  it('logs request via hono logger when level is info', async () => {
    const { app, bindings } = createApp(LoggerLevel.INFO)
    await app.request('/test', {}, bindings)

    expect(consoleSpy).toHaveBeenCalled()
    const all = consoleSpy.mock.calls.map(c => c.join(' '))
    expect(all.some(l => l.includes('GET') && l.includes('/test'))).toBe(true)
  })

  it('logs headers and query in debug mode', async () => {
    const { app, bindings } = createApp(LoggerLevel.DEBUG)
    await app.request('/search?q=hello', { headers: { 'x-custom': 'val' } }, bindings)

    const all = consoleSpy.mock.calls.map(c => c[0])

    expect(all.some(l => l === '  Headers:')).toBe(true)
    expect(all.some(l => l === '  Query:')).toBe(true)
  })

  it('defaults to info when level is missing', async () => {
    const app = new Hono<AppInstance>()
    app.use('*', customLogger)
    app.get('/test', c => c.json({ success: true }))

    await app.request('/test', {}, baseBindings)

    expect(consoleSpy).toHaveBeenCalled()
  })
})
