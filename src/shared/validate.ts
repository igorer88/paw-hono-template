import type { ZodType } from 'zod'
import type { Result } from '@/types'

/**
 * Validates unknown input against a Zod schema and returns a `Result` union
 * instead of throwing. Cloud-agnostic: usable from HTTP route adapters,
 * direct function calls, RPC handlers, and tests alike. The original
 * `ZodError` is attached via `error.cause` when the caller needs the issues.
 *
 * @param schema Zod schema describing the expected shape
 * @param raw input to validate (typically an untyped payload)
 * @returns `{ success: true, data }` or `{ success: false, error }`
 */
export const validateInput = <T>(schema: ZodType<T>, raw: unknown): Result<T> => {
  const parsed = schema.safeParse(raw)
  return parsed.success
    ? { success: true, data: parsed.data }
    : { success: false, error: new Error('Invalid input', { cause: parsed.error }) }
}
