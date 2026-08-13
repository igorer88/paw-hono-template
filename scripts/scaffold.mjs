#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { readFile, rm, writeFile } from 'node:fs/promises'
import { basename, dirname, join, resolve } from 'node:path'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'
import { fileURLToPath } from 'node:url'
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

const TEMPLATE_REPO = 'igorer88/paw-hono-template'
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const TARGETS = [
  ['package.json', rewritePackageJson],
  ['wrangler.jsonc', rewriteWranglerName],
  ['docker-compose.yml', rewriteDockerCompose],
  ['src/index.ts', rewriteBanner],
  ['src/index.test.ts', rewriteBanner],
  ['README.md', rewriteReadme],
  ['CHANGELOG.md', () => CHANGELOG_HEADER]
]

function printHelp() {
  console.log(`Rewires this template copy for a new project:
  - renames the package and worker (name, version ${DEFAULT_VERSION})
  - renames docker-compose services and the index banner
  - replaces template repo references in the README and clears the changelog
  - deletes the git history and runs git init

Usage:
  pnpm scaffold                prompt for the project slug
  pnpm scaffold --name my-api  non-interactive
  pnpm scaffold --no-git       keep the existing git history
  pnpm scaffold --help         show this help`)
}

function parseArgs(argv) {
  const cliArgs = { name: null, git: true, help: false }
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index]
    if (arg === '--help' || arg === '-h') {
      cliArgs.help = true
    } else if (arg === '--no-git') {
      cliArgs.git = false
    } else if (arg === '--name' || arg === '-n') {
      const value = argv[++index]
      if (value === undefined) throw new Error(`Missing value for ${arg}`)
      cliArgs.name = value
    } else if (arg.startsWith('--name=')) {
      cliArgs.name = arg.slice('--name='.length)
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }
  return cliArgs
}

function assertNotTemplate() {
  let remote = ''
  try {
    remote = execFileSync('git', ['remote', 'get-url', 'origin'], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim()
  } catch {
    remote = ''
  }
  if (remote.includes(TEMPLATE_REPO)) {
    throw new Error(
      `Refusing to scaffold: ${remote} is the paw-hono-template repository itself.\n` +
        'Copy the template first, e.g. `npx degit igorer88/paw-hono-template my-api`.'
    )
  }
}

async function promptName(readline, fallback) {
  for (;;) {
    const answer = (await readline.question(`Project slug (${fallback}): `)).trim()
    const candidate = answer || fallback
    const result = validateSlug(candidate)
    if (result.ok) return candidate
    console.error(`Invalid slug: ${result.message}`)
  }
}

async function rewriteFile(relativePath, transform, slug) {
  const file = join(ROOT, relativePath)
  let content
  try {
    content = await readFile(file, 'utf8')
  } catch {
    console.warn(`Skipping missing file: ${relativePath}`)
    return false
  }
  const next = transform(content, slug)
  if (next === content) {
    console.warn(`No changes for ${relativePath}`)
    return false
  }
  await writeFile(file, next)
  return true
}

async function resetGit() {
  const gitDir = join(ROOT, '.git')
  if (existsSync(gitDir)) {
    await rm(gitDir, { recursive: true, force: true })
  }
  execFileSync('git', ['init'], { cwd: ROOT, stdio: 'inherit' })
}

async function main() {
  const cliArgs = parseArgs(process.argv.slice(2))
  if (cliArgs.help) {
    printHelp()
    return
  }
  assertNotTemplate()

  const fallback = basename(ROOT)
  let slug = cliArgs.name
  if (slug) {
    const result = validateSlug(slug)
    if (!result.ok) throw new Error(`Invalid --name: ${result.message}`)
  } else {
    const readline = createInterface({ input: stdin, output: stdout })
    slug = await promptName(readline, fallback)
    readline.close()
  }

  let changed = 0
  for (const [relativePath, transform] of TARGETS) {
    if (await rewriteFile(relativePath, transform, slug)) changed += 1
  }

  if (cliArgs.git) await resetGit()

  console.log(`\nScaffolded ${slug}@${DEFAULT_VERSION} (${changed} files rewritten).`)
  if (cliArgs.git) console.log('Fresh git repository initialized.')
  console.log('\nNext steps:')
  console.log('  pnpm install')
  console.log('  git add -A && git commit -m "chore(root): bootstrap project"')
  console.log('  git remote add origin <repo-url> && git push -u origin develop')
  console.log(
    '\nThe release pipeline ships with this project — push to main to trigger the first release.'
  )
}

main().catch(error => {
  console.error(error.message)
  process.exitCode = 1
})
