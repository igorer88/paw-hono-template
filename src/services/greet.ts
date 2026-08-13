import { z } from 'zod'
import type { Result } from '@/types'
import { validateInput } from '@/shared/validate'

export const greetSchema = z.object({
  name: z.string().trim().min(1).max(100),
  title: z.string().trim().max(40).optional()
})

export type GreetParams = z.infer<typeof greetSchema>

export const greet = (params: unknown): Result<string> => {
  const input = validateInput(greetSchema, params)
  if (!input.success) return input
  const { name, title } = input.data
  return { success: true, data: `Hello, ${title ? `${title} ` : ''}${name}!` }
}
