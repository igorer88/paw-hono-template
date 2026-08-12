import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { validateInput } from '@/shared/validate'

const emailSchema = z.object({
  email: z.string().email()
})

describe('validateInput', () => {
  it('returns success with parsed data for valid input', () => {
    const result = validateInput(emailSchema, { email: 'test@example.com' })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({ email: 'test@example.com' })
    }
  })

  it('returns failure with a native Error for invalid input', () => {
    const result = validateInput(emailSchema, { email: 'not-an-email' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBeInstanceOf(Error)
      expect(result.error.message).toBe('Invalid input')
    }
  })

  it('attaches the ZodError via cause for issue inspection', () => {
    const result = validateInput(emailSchema, { email: 'not-an-email' })

    if (!result.success) {
      expect(result.error.cause).toBeInstanceOf(z.ZodError)
    } else {
      throw new Error('expected validation to fail')
    }
  })

  it('fails on missing required fields', () => {
    const result = validateInput(emailSchema, {})

    expect(result.success).toBe(false)
  })
})
