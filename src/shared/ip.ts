import type { Context } from 'hono'

export const getClientIp = (c: Context): string | null =>
  c.req.header('cf-connecting-ip') ??
  c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ??
  c.req.header('x-real-ip') ??
  null

export const anonymizeIp = (ip: string): string => {
  if (ip.includes('.')) return ip.replace(/\d+$/, 'xxx')
  if (ip.includes(':')) return ip.replace(/([^:]+)$/, 'xxxx')
  return ip
}
