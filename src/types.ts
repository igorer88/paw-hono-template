import type { ValidatedBindings } from './env'

export type Bindings = ValidatedBindings

export type Variables = {
  userId?: string // Useful for auth middleware later
  requestId: string // Correlation id set by src/middleware/correlation.ts
  traceParent?: string // W3C trace context when an upstream span is present
}

// AppInstance type to reuse across separate route files
export type AppInstance = { Bindings: Bindings; Variables: Variables }
