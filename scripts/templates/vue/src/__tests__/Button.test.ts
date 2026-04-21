import { mount } from '@vue/test-utils'
import { Button } from '../index'

describe('__PACKAGE_NAME__ Vue Button', () => {
  it('should render correctly', () => {
    const wrapper = mount(Button, {
      props: { label: 'Click Me' },
    })
    expect(wrapper.text()).toContain('Click Me')
  })
})
