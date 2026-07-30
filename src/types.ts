import type { ValidatedBindings } from './env'

export type Bindings = ValidatedBindings

export type Variables = {
  userId?: string // Useful for auth middleware later
}

// AppInstance type to reuse across separate route files
export type AppInstance = { Bindings: Bindings; Variables: Variables }
