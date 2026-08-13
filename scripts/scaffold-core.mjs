export const DEFAULT_VERSION = '0.1.0'

export const CHANGELOG_HEADER = '# Changelog\n'

export function validateSlug(value) {
  const valid = /^[a-z][a-z0-9-]*[a-z0-9]$/.test(value) && !value.includes('--')
  if (valid) return { ok: true, value }
  return {
    ok: false,
    message:
      'must be lowercase letters, digits, and hyphens; start with a letter; end with a letter or digit; no consecutive hyphens'
  }
}

export function rewritePackageJson(content, slug) {
  const packageJson = JSON.parse(content)
  packageJson.name = slug
  packageJson.version = DEFAULT_VERSION
  return `${JSON.stringify(packageJson, null, 2)}\n`
}

export function rewriteWranglerName(content, slug) {
  return content.replace(/^(\s*"name"\s*:\s*")[^"]*(")/m, `$1${slug}$2`)
}

export function rewriteDockerCompose(content, slug) {
  return content.replaceAll('paw-hono-api', slug)
}

export function rewriteBanner(content, slug) {
  return content.replace('Paw Hono Worker Engine Active', `${slug} is ready`)
}

export function rewriteReadme(content, slug) {
  return content.replaceAll('paw-hono-template', slug)
}
