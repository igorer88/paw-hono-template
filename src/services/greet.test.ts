import { greet } from './greet'

describe('greet', () => {
  it('greets by name', () => {
    const result = greet({ name: 'Ada' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data).toBe('Hello, Ada!')
  })

  it('prepends the title when given', () => {
    const result = greet({ name: 'Ada', title: 'Dr.' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data).toBe('Hello, Dr. Ada!')
  })

  it('rejects empty names', () => {
    const result = greet({ name: '' })
    expect(result.success).toBe(false)
  })

  it('trims surrounding whitespace', () => {
    const result = greet({ name: '  Ada  ' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data).toBe('Hello, Ada!')
  })

  it('rejects non-object input', () => {
    const result = greet('Ada')
    expect(result.success).toBe(false)
  })
})
