/**
 * A sample DOM manipulation component.
 */
export function createComponent(): HTMLElement {
  const el = document.createElement('div')
  el.className = 'example-component-container'
  el.textContent = 'Component from example-component!'
  return el
}
