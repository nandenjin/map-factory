/**
 * Store for SVG elements with layered structure
 */
export class SVGMapLayer {
  id: string
  els: Set<Element | SVGMapLayer>

  constructor(id: string) {
    this.id = id
    this.els = new Set()
  }

  /**
   * Add an element or a layer to this layer
   * @param path Array of path segments e.g. `['roads', 'primary']`
   * @param el The element or layer to add
   */
  add(path: string[], el: Element | SVGMapLayer) {
    // Get the first path segment
    const key = path.shift()

    // If nested path
    if (key) {
      let targetLayer: SVGMapLayer | null = null

      // Find the target layer from the children
      for (const e of this.els) {
        if (e instanceof SVGMapLayer && e.id === key) {
          targetLayer = e
          break
        }
      }

      // If not found, create a new layer
      targetLayer = targetLayer || new SVGMapLayer(key)

      // Add given element to the target layer recursively
      targetLayer.add(path, el)

      // Replace element with the target layer
      el = targetLayer
    }

    // Add the element to the current layer
    this.els.add(el)
  }
}
