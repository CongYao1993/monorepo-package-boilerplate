import { hello } from './index'

describe('__PACKAGE_NAME__', () => {
  it('should return hello message', () => {
    expect(hello()).toBe('Hello from __PACKAGE_NAME__!')
  })
})
