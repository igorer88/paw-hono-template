import {
  CHANGELOG_HEADER,
  DEFAULT_VERSION,
  rewriteBanner,
  rewriteDockerCompose,
  rewritePackageJson,
  rewriteReadme,
  rewriteWranglerName,
  validateSlug
} from './scaffold-core.mjs'

describe('validateSlug', () => {
  it('accepts valid slugs', () => {
    for (const slug of ['api', 'my-api', 'a1', 'my-api-2']) {
      expect(validateSlug(slug).ok).toBe(true)
    }
  })

  it('rejects invalid slugs', () => {
    for (const slug of ['My-API', '-api', 'api-', 'a--b', '1api', 'a b', '']) {
      expect(validateSlug(slug).ok).toBe(false)
    }
  })
})

describe('rewritePackageJson', () => {
  const source = `${JSON.stringify(
    { name: 'paw-hono-template', version: '0.1.0', scripts: { test: 'vitest run' } },
    null,
    2
  )}\n`
  const result = rewritePackageJson(source, 'my-api')

  it('sets the package name and resets the version', () => {
    const parsed = JSON.parse(result) as { name: string; version: string }
    expect(parsed.name).toBe('my-api')
    expect(parsed.version).toBe(DEFAULT_VERSION)
  })

  it('preserves other fields', () => {
    const parsed = JSON.parse(result) as { scripts: Record<string, string> }
    expect(parsed.scripts.test).toBe('vitest run')
  })
})

describe('rewriteWranglerName', () => {
  it('rewrites the name and preserves the trailing comma', () => {
    const source =
      '{\n  "$schema": "x",\n  "name": "paw-hono-template",\n  "main": "src/index.ts"\n}\n'
    const result = rewriteWranglerName(source, 'my-api')
    expect(result).toContain('"name": "my-api",')
    expect(result).toContain('"$schema"')
  })
})

describe('rewriteDockerCompose', () => {
  it('renames container and image references', () => {
    const source =
      '    container_name: paw-hono-api\n    image: paw-hono-api:${API_IMAGE_TAG:-latest}\n'
    const result = rewriteDockerCompose(source, 'my-api')
    expect(result).toContain('container_name: my-api')
    expect(result).toContain('image: my-api:${API_IMAGE_TAG:-latest}')
  })
})

describe('rewriteBanner', () => {
  it('replaces the template banner', () => {
    const source = "app.get('/', c => c.text('🚀 Paw Hono Worker Engine Active.'))"
    const result = rewriteBanner(source, 'my-api')
    expect(result).toContain("'🚀 my-api is ready.'")
  })
})

describe('rewriteReadme', () => {
  it('replaces template repo references', () => {
    const source =
      'https://img.shields.io/github/license/igorer88/paw-hono-template\nPaw is a production-ready Hono template.'
    const result = rewriteReadme(source, 'my-api')
    expect(result).not.toContain('paw-hono-template')
    expect(result).toContain('https://img.shields.io/github/license/igorer88/my-api')
  })
})

describe('CHANGELOG_HEADER', () => {
  it('is the bare changelog header', () => {
    expect(CHANGELOG_HEADER).toBe('# Changelog\n')
  })
})
