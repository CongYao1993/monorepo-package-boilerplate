// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { createComponent } from '../index'

describe('example-component component', () => {
  it('should create an element with correct class and text', () => {
    const el = createComponent()
    expect(el.className).toBe('example-component-container')
    expect(el.textContent).toBe('Component from example-component!')
  })
})
