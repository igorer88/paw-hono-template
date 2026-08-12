const REQUEST_ID_MAX_LENGTH = 64
const REQUEST_ID_REGEX = /^[A-Za-z0-9._:-]+$/

const TRACEPARENT_MAX_LENGTH = 256

export const generateRequestId = (): string => crypto.randomUUID()

export const sanitizeRequestId = (value?: string | null): string | null => {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > REQUEST_ID_MAX_LENGTH) return null
  return REQUEST_ID_REGEX.test(trimmed) ? trimmed : null
}

export const extractRequestId = (headers: Headers): string | null =>
  sanitizeRequestId(headers.get('x-request-id')) ??
  sanitizeRequestId(headers.get('x-correlation-id'))

export const extractTraceParent = (headers: Headers): string | null => {
  const raw = headers.get('traceparent')
  if (!raw || raw.length > TRACEPARENT_MAX_LENGTH) return null
  const value = raw.trim()
  const [version, traceId, spanId, flags] = value.split('-')
  if (!version || !traceId || !spanId || !flags) return null
  if (!/^[0-9a-f]{2}$/.test(version) || version === 'ff') return null
  if (!/^[0-9a-f]{32}$/.test(traceId)) return null
  if (!/^[0-9a-f]{16}$/.test(spanId)) return null
  if (!/^[0-9a-f]{2}$/.test(flags)) return null
  return value
}
