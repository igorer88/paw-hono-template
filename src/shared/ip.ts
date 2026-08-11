const IP_REGEX =
  /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$|^[0-9a-fA-F:]{3,45}$/

export const normalizeIp = (raw?: string | null): string | null => {
  if (!raw) return null
  let value = raw.trim()
  if (value.startsWith('[')) {
    const close = value.indexOf(']')
    if (close === -1) return null
    value = value.slice(1, close)
  }
  return IP_REGEX.test(value) ? value : null
}

export const getClientIp = (headers: Headers): string | null => {
  const candidates = [
    headers.get('cf-connecting-ip'),
    // Rightmost entry is appended by the nearest trusted reverse proxy;
    // the leftmost is client-controlled and must not be trusted.
    headers.get('x-forwarded-for')?.split(',').pop(),
    headers.get('x-real-ip')
  ]
  for (const candidate of candidates) {
    const ip = normalizeIp(candidate)
    if (ip) return ip
  }
  return null
}

export const anonymizeIp = (ip: string): string => {
  if (ip.includes('.')) return ip.replace(/\d+$/, 'xxx')
  if (ip.includes(':')) return ip.replace(/([^:]+)$/, 'xxxx')
  return ip
}
