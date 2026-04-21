import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Button } from '../index'

describe('example-react React Button', () => {
  it('should render correctly', () => {
    render(<Button label="Click Me" />)
    expect(screen.getByText('Click Me')).toBeDefined()
  })
})
