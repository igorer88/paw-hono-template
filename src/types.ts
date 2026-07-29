export type Bindings = {
  ENVIRONMENT: 'production' | 'staging' | 'development'
  API_SECRET_KEY: string
  APP_DOMAIN: string
  // Future-proofing: easily uncomment these when you add storage
  // MY_KV: KVNamespace
  // MY_DB: D1Database
}

export type Variables = {
  userId?: string // Useful for auth middleware later
}

// AppInstance type to reuse across separate route files
export type AppInstance = { Bindings: Bindings; Variables: Variables }


