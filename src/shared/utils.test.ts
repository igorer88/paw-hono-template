import { isEmptyObject } from './utils'

describe('isEmptyObject', () => {
  it('returns true for an empty object', () => {
    expect(isEmptyObject({})).toBe(true)
  })

  it('returns false for an object with keys', () => {
    expect(isEmptyObject({ key: 'value' })).toBe(false)
  })

  it('returns false for null', () => {
    expect(isEmptyObject(null as unknown as object)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isEmptyObject(undefined as unknown as object)).toBe(false)
  })

  it('returns false for an array', () => {
    expect(isEmptyObject([])).toBe(false)
  })
})
