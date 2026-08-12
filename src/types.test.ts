import { describe, expect, it } from 'vitest'
import type { Result } from '@/types'

describe('Result', () => {
  it('narrows to data on success', () => {
    const ok: Result<string> = { success: true, data: 'hello' }

    if (ok.success) {
      expect(ok.data).toBe('hello')
    }
  })

  it('narrows to Error on failure', () => {
    const fail: Result<string> = { success: false, error: new Error('boom') }

    if (!fail.success) {
      expect(fail.error).toBeInstanceOf(Error)
      expect(fail.error.message).toBe('boom')
    }
  })
})
