// @vitest-environment jsdom
import { createComponent } from '../index'

describe('__PACKAGE_NAME__ component', () => {
  it('should create an element with correct class and text', () => {
    const el = createComponent()
    expect(el.className).toBe('__PACKAGE_NAME__-container')
    expect(el.textContent).toBe('Component from __PACKAGE_NAME__!')
  })
})
