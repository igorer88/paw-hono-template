export const getClientIp = (headers: Headers): string | null =>
  headers.get('cf-connecting-ip') ??
  headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
  headers.get('x-real-ip') ??
  null

export const anonymizeIp = (ip: string): string => {
  if (ip.includes('.')) return ip.replace(/\d+$/, 'xxx')
  if (ip.includes(':')) return ip.replace(/([^:]+)$/, 'xxxx')
  return ip
}
