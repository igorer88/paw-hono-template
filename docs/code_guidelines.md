# Code Guidelines

## Language

All code, comments, identifiers, and commit messages — English.

## Import Order

`node:` → blank → external packages → blank → internal imports.

Within each group, imports are alphabetical.

```typescript
// node: builtins (available via nodejs_compat flag)
import { randomUUID } from 'node:crypto'

// external packages
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

// internal — absolute (@/) before relative
import { customCors, errorHandler, notFoundHandler } from '@/middleware'
import { healthRouter } from '@/routes/health'
import type { AppInstance } from '@/types'
```

Type-only imports use `import type` syntax to avoid runtime overhead.

## Barrel Files

When a directory contains more than one file, it must have an `index.ts` barrel file that re-exports the public API. Consumers import from the directory, not from individual files.

```typescript
// src/middleware/index.ts — barrel
export { customCors } from './security'
export { errorHandler, notFoundHandler } from './error'
```

```typescript
// src/index.ts — imports from barrel, not individual files
import { customCors, errorHandler, notFoundHandler } from '@/middleware'
```

Directories with a single file do not need a barrel — import the file directly.

## Types

Placement hierarchy (least to most shared):

1. **Inline** — simple types used in a single expression
   ```typescript
   const result: { id: string; name: string } = parse(input)
   ```
2. **Local file** — types used by multiple functions in the same file, defined at the top
3. **Domain types file** — types shared across a few related files (e.g., `src/routes/orders/types.ts`)
4. **`src/types.ts`** — only the application-wide Hono generics: `Bindings`, `Variables`, `AppInstance`

Prefer inline over extraction until duplication proves extraction worthwhile.

## File Layout

In every file, in order:

1. Types & interfaces
2. Constants
3. Private helpers
4. Public API (handlers, exported functions)
5. Export statement

```typescript
// types & interfaces
type HealthResponse = { ok: boolean; message: string }

// constants
const HEALTH_MESSAGE = 'Hello Hono!'

// private helpers (bottom-up: called before caller)
function formatResponse(ok: boolean, message: string): HealthResponse {
  return { ok, message }
}

// public API
function getHealth(c: Context) {
  return c.json(formatResponse(true, HEALTH_MESSAGE))
}

// export
export { getHealth }
```

## Function Order (Bottom-Up)

Functions that are called come before their callers. This lets you read a file from top to bottom — each function is defined before it is referenced.

```
helper_a() → helper_b() → buildThing() → handler() → export
```

## Naming Conventions

| Kind | Convention | Example |
|---|---|---|
| Variables, functions, parameters | camelCase | `formatResponse`, `userId` |
| Types, interfaces, generics | PascalCase | `AppInstance`, `HealthResponse` |
| Files | kebab-case | `health.ts`, `error-handler.ts` |
| Exported routers | domain + `Router` suffix | `healthRouter`, `ordersRouter` |
| Exported handlers | verb/domain prefix | `errorHandler`, `notFoundHandler` |
| Middleware functions | domain prefix | `customCors` |

## Response Shape

All handlers return `c.json()` with this shape:

```typescript
{
  success: boolean
  description?: string   // human-readable summary; always present on errors
  data?: unknown
  error?: {
    message: string
    stack?: string       // only in development
  }
}
```

## Status Codes

| Code | Usage |
|---|---|
| `200` | OK — successful response |
| `201` | Created — resource created |
| `204` | No Content — success, no body |
| `400` | Bad Request — invalid input or missing parameters |
| `401` | Unauthorized — authentication required or failed |
| `403` | Forbidden — authenticated but not permitted |
| `404` | Not Found — route or resource does not exist |
| `409` | Conflict — duplicate entry or state conflict |
| `422` | Unprocessable Entity — semantic validation failure |
| `429` | Too Many Requests — rate limited |
| `500` | Internal Server Error — unhandled exception |

## Error Handling

- Throw `Error` objects, not strings: `throw new Error('message')` not `throw 'message'`
- Route handlers should not catch errors for logging — the global `onError` handler does that
- Use `try/catch` in a handler only when you need to recover, transform, or suppress a specific error
- Stack traces are automatically stripped in production (`ENVIRONMENT !== 'development'`) by `src/middleware/error.ts`

## No `any`

Enforced as error by oxlint. Alternatives:

- `unknown` — when the type is truly unknown (parsed JSON, external API response)
- Proper generics — `Hono<AppInstance>`, `Context<AppInstance>`
- Typed interfaces — define a response type instead of `Promise<any>`

Only exception: third-party types that are inherently untyped (rare).

## No Module-Level Side Effects

Routes and middleware must be safe to import. No I/O, no global state mutation, no network calls at module level.

```typescript
// bad — triggers on import
const client = connectToDatabase()

// good — defer to handler or middleware
let client: DbClient | null = null
function getClient() {
  if (!client) client = connectToDatabase()
  return client
}
```

## JSDoc

Required only for shared utility functions in `src/shared/` with non-obvious contracts. Use `/** */` style.

Not required for:
- Route handlers (the path and HTTP method define the contract)
- Middleware functions
- Functions with obvious signatures
- Internal helpers

```typescript
/**
 * Converts an IP address to an anonymized string.
 * IPv4: preserves first two octets (192.168.x.x).
 * IPv6: truncates after 20 characters.
 * Returns "unknown" for falsy or unrecognized input.
 */
export const anonymizeIp = (ip: string): string => { ... }
```

## Formatting Reference

See `.oxfmtrc.json` and `.oxlintrc.json` for the authoritative rules.

| Rule | Value |
|---|---|
| Semicolons | none |
| Quotes | single |
| Trailing commas | none |
| Arrow parens | avoid on single param (`x => x` not `(x) => x`) |
| Indent | 2 spaces |
| End of line | LF |
| Trailing newline | required |
| `no-explicit-any` | error |
| `no-unused-vars` | warn |
