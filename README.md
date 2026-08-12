<p align="center">
  <img src=".github/assets/paw.svg" width="80" alt="Paw Logo" />
  <img src=".github/assets/hono.svg" width="80" alt="Hono Logo" style="margin-left: 16px;" />
</p>

<p align="center">Paw is a production-ready Hono template for Cloudflare Workers.<br />Secured by design. Agnostic by architecture — also deployable on AWS Lambda, GCP Cloud Run, Bun, Deno, or Node.js.</p>
<p align="center">
<a href="https://nodejs.org" target="_blank"><img src="https://img.shields.io/badge/node-%3E%3D24.x-green.svg" alt="Node.js version" /></a>
<a href="https://pnpm.io" target="_blank"><img src="https://img.shields.io/badge/pnpm-%3E%3D11.x-cc00ff.svg" alt="pnpm version" /></a>
<a href="./LICENSE" target="_blank"><img src="https://img.shields.io/github/license/igorer88/paw-hono-template" alt="Package License" /></a>
</p>

## Description

A production-ready [Hono](https://hono.dev) base template for **Cloudflare Workers** — built for secure and scalable HTTP APIs. Pre-configured with a modular middleware stack, centralized error handling, CORS, security headers, and a consistent response envelope. Designed to be runtime-agnostic — the same code also deploys to AWS Lambda, GCP Cloud Run, Bun, Deno, or Node.js with minimal changes.

## Features

- **Runtime** — Hono v4, Cloudflare Workers, runtime-agnostic design
- **Security** — CORS whitelist, security headers (HSTS, CSP, XSS), centralized error handler (no stack leaks in production), consistent response envelope. Rate limiting is handled at the Cloudflare WAF level — configure via dashboard or `wrangler.jsonc` (see [Cloudflare docs](https://developers.cloudflare.com/waf/custom-rules/rate-limiting/)). Hono-level rate limiting (via Durable Objects) is only needed for dynamic per-user limits.
- **Developer Experience** — Strict TypeScript, `@/` import alias, Oxlint + Oxfmt, modular file structure
- **Infrastructure** — Wrangler observability, `--minify` deploy, single environment config
- **DevOps** — Conventional commits, automated semantic-release pipeline with changelog generation, git tagging, and GitHub Releases. Staging prereleases from `release/v*` branches, gated behind an approval environment.

## Roadmap

- Request validation beyond env vars (zod) — e.g., payload schemas for route handlers

## Project setup

```bash
pnpm install
```

## Environment Setup

Environment variables are split by sensitivity:

**Non-secret vars** — configured in `wrangler.jsonc` per environment under `vars` (checked into version control):

| Variable             | Type                            | Description                                                                                                                                                                                                                                                                                                                                 |
| -------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ALLOWED_ORIGIN`     | string                          | Comma-separated CORS origins. Each entry must be a bare explicit `http(s)://host[:port]` origin; `*` is allowed only as a leading subdomain label (e.g., `https://app.example.com,https://*.example.com`). Bare `*`, scheme-less entries, non-http schemes, and paths are rejected. Localhost/127.0.0.1 bypass applies only in development. |
| `LOGGER_LEVELS`      | `'none' \| 'info' \| 'debug'`   | Request logging verbosity. `none` silences all request logs, `info` logs method/path/status/duration (default), `debug` adds allowlisted headers (everything else redacted) and query keys.                                                                                                                                                 |
| `IP_LOG_LEVEL`       | `'none' \| 'full' \| 'partial'` | Client IP logging. `none` omits IP, `full` logs the raw IP, `partial` masks the last octet/group (default).                                                                                                                                                                                                                                 |
| `REQUEST_TIMEOUT_MS` | number                          | Abort handlers that exceed this many milliseconds with a 504 response (default 10000).                                                                                                                                                                                                                                                      |
| `MAX_BODY_SIZE`      | number                          | Reject request bodies larger than this many bytes with a 413 response (default 1000000).                                                                                                                                                                                                                                                    |

**Secrets** — set via `.dev.vars` for local dev, `wrangler secret put <NAME>` for production (never committed).

No secrets are required by default. `.env.example` documents this — if auth middleware is added later, add secrets to `.dev.vars` (local) and `wrangler secret put` (production).

`ENVIRONMENT` is required (no default) and set explicitly per environment: `development` under `env.development.vars`, `production` under `env.production.vars`. Deploying without `--env` fails fast at cold start rather than silently running in development.

## Compile and run

```bash
# development
pnpm run dev

# deploy to production
pnpm run deploy

# regenerate Cloudflare types
pnpm run cf-typegen
```

## API Example

```bash
curl http://localhost:8787/health
```

Response:

```json
{
  "success": true,
  "description": "Health check passed",
  "data": {
    "message": "Hello Hono!"
  }
}
```

## Project Structure

```
src/
├── index.ts              # App entrypoint — mounts middleware + routes, validates env at cold start
├── env.ts                # Zod schema + env validation (single source of truth for vars)
├── types.ts              # Bindings, Variables, AppInstance, Result<T> types
├── middleware/
│   ├── index.ts          # Barrel — re-exports all middleware
│   ├── correlation.ts    # Correlation id middleware (X-Request-Id header)
│   ├── error.ts          # Error handler + 404 handler
│   ├── guards.ts         # Request timeout + body limit guards
│   ├── logger.ts         # Request logging (levels + IP + redaction)
│   └── security.ts       # Custom CORS middleware
├── routes/
│   └── health.ts         # GET /health endpoint
└── shared/
    ├── ip.ts             # Client IP extraction + anonymization
    ├── requestId.ts      # Request id + traceparent helpers
    ├── utils.ts          # Pure utility functions
    └── validate.ts       # validateInput — Zod-safeParse → Result<T> (no throw)
docs/
├── architecture.md       # Design intent, request lifecycle, extensibility
└── code_guidelines.md    # Coding conventions, response shape, error handling
```

## Error Handling

All responses follow a consistent envelope:

```typescript
{
  success: boolean
  description?: string   // human-readable summary; always present on errors
  data?: unknown
  requestId?: string     // correlation id, matches the X-Request-Id response header
  error?: {
    message: string
    stack?: string       // only in development (ENVIRONMENT=development)
  }
}
```

- Unhandled exceptions return `{ success: false, description: "Something went wrong", error: { message }, requestId }` with the preserved status code (500 if unset). 5xx responses use the generic message `Internal Server Error`; 4xx surface a message to the client only when thrown via `HTTPException(status, { message })` — plain `Error.message` is never echoed
- Unmatched routes return `{ success: false, description: "Verify the URL and HTTP method", error: { message: "Route not found: GET /path" }, requestId }` with 404
- Stack traces are never exposed in production (development only)
- Every response carries an `X-Request-Id` header — a validated inbound `x-request-id`/`x-correlation-id` or a generated UUID v4; quote it in support tickets to correlate logs

## Linting, Formatting, and Type Checking

```bash
pnpm run typecheck
pnpm run format
pnpm run lint
```

## Tests

Vitest is configured with `vitest/globals`. Tests are colocated as `*.test.ts` next to their sources and run with:

```bash
pnpm run test        # single run
pnpm run test:watch  # watch mode
```

## Deployment Discussion

When starting a new project with this template, consider the deployment strategy:

| Pattern                           | Request flow                                                  | Versioning approach                                                    |
| --------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **Single Worker per API**         | One entrypoint receives all requests — Hono routes internally | Sub-router prefix (`/v1/resource`)                                     |
| **Separate Workers per resource** | Cloudflare routes `/health` → Worker A, `/users` → Worker B   | Each Worker is its own Hono app; versioning lives at the routing layer |

**Single Worker per API** is the default pattern this template uses. It keeps routing and versioning in application code, requires no Cloudflare-side changes when adding endpoints, and is the simplest to maintain.

**Separate Workers per resource** is for cases where endpoints need independent scaling, deploy cycles, or team ownership. Each Worker is a separate Hono app with its own entrypoint — versioning and routing are managed at the Cloudflare edge.

## Release Workflow

Versioning, changelog, and releases are fully automated via **semantic-release**.

| Branch           | Push triggers      | Tag / Release                    |
| ---------------- | ------------------ | -------------------------------- |
| `main`           | Full release       | `v1.2.3` — GitHub Release        |
| `release/vX.Y.Z` | Staging prerelease | `v1.2.3-staging.1` — Pre-release |

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) (`type(scope): message`). The type determines the version bump:

- `feat` → minor, `fix`/`perf` → patch, `type!:` or `BREAKING CHANGE` footer → major
- `chore`, `test`, `style`, `refactor`, `docs` do not trigger a release

On every push to `main` or `release/vX.Y.Z`, the CI pipeline runs typecheck → lint → test → build → semantic-release, which bumps `package.json`, generates `CHANGELOG.md`, creates a git tag, and publishes a GitHub Release with build artifacts attached. Releases run under the GitHub **`release` environment** — with required reviewers configured (Settings → Environments → `release`), production and staging releases require manual approval. CI also includes CodeQL SAST (`security-extended`) and a dependency review, which auto-enable when the repository is public (both need GitHub Advanced Security on private repos); all workflows use SHA-pinned actions and pinned `ubuntu-24.04` runners.

### Portability

This template runs on Cloudflare Workers and is built on Hono, which supports [AWS Lambda](https://github.com/honojs/hono/tree/main/src/adapter/aws-lambda), Lambda@Edge, Deno, Bun, Vercel, Fastly Compute, and Node.js natively. GCP Cloud Run works via the Node.js adapter (`@hono/node-server`). Porting requires swapping only the entrypoint adapter in `src/index.ts`.

> GCP Cloud Functions and Azure Functions have no official adapter — porting requires manual integration with the platform's HTTP handler.

See [docs/architecture.md#9-runtime-portability](./docs/architecture.md#9-runtime-portability) for deployment patterns and the env var compatibility shim.

When porting to AWS Lambda, the deployment patterns above map to API Gateway configurations — detailed in the architecture doc.

## License

[MIT licensed](./LICENSE).
