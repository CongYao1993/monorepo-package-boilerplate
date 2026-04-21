import * as Cesium from 'cesium'

/**
 * A sample Cesium wrapper component.
 */
export function createViewer(containerId: string | Element): Cesium.Viewer {
  return new Cesium.Viewer(containerId)
}
