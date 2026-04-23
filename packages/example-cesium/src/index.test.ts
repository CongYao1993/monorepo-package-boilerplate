import { describe, it, expect, vi } from 'vitest'
import { createViewer } from './index'

vi.mock('cesium', () => {
  return {
    Viewer: vi.fn().mockImplementation((container) => {
      return { container }
    }),
  }
})

describe('example-cesium', () => {
  it('should create a viewer instance', () => {
    const container = document.createElement('div')
    const viewer = createViewer(container)
    expect(viewer).toBeDefined()
    expect(viewer.container).toBe(container)
  })
})
