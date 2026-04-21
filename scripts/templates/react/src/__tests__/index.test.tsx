import { render, screen } from '@testing-library/react'
import { Button } from '../index'

describe('__PACKAGE_NAME__ React Button', () => {
  it('should render correctly', () => {
    render(<Button label="Click Me" />)
    expect(screen.getByText('Click Me')).toBeDefined()
  })
})
