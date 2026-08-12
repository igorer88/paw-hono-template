import type { ValidatedBindings } from './env'

export type Bindings = ValidatedBindings

export type Variables = {
  userId?: string // Useful for auth middleware later
  requestId: string // Correlation id set by src/middleware/correlation.ts
  traceParent?: string // W3C trace context when an upstream span is present
}

// AppInstance type to reuse across separate route files
export type AppInstance = { Bindings: Bindings; Variables: Variables }

// Result of an operation that can fail. Success carries the typed value;
// failure carries a native `Error` (the repo-wide error convention).
// Discriminate with the `success` boolean:
// `result.success ? result.data : result.error`
export type Result<T> = { success: true; data: T } | { success: false; error: Error }
