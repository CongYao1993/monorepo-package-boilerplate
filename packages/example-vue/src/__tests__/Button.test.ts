import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import { Button } from '../index'

describe('example-vue Vue Button', () => {
  it('should render correctly', () => {
    const wrapper = mount(Button, {
      props: { label: 'Click Me' },
    })
    expect(wrapper.text()).toContain('Click Me')
  })
})
