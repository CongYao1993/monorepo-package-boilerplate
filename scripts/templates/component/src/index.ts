/**
 * A sample DOM manipulation component.
 */
export function createComponent(): HTMLElement {
  const el = document.createElement('div')
  el.className = '__PACKAGE_NAME__-container'
  el.textContent = 'Component from __PACKAGE_NAME__!'
  return el
}
