import type { Context, Next } from 'hono'
import { extractRequestId, extractTraceParent, generateRequestId } from '@/shared/requestId'
import type { AppInstance } from '@/types'

export const correlationId = async (c: Context<AppInstance>, next: Next) => {
  const requestId = extractRequestId(c.req.raw.headers) ?? generateRequestId()
  c.set('requestId', requestId)
  c.set('traceParent', extractTraceParent(c.req.raw.headers) ?? undefined)
  await next()
  c.header('x-request-id', requestId)
}
