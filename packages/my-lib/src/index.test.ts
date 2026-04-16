import { describe, expect, it } from 'vitest'

import { helloMyLib } from './index'

describe('helloMyLib', () => {
  it('returns a greeting message', () => {
    expect(helloMyLib('Vitest')).toBe('Hello, Vitest!')
  })
})
