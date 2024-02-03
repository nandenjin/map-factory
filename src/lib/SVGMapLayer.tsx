export class SVGMapLayer {
  id: string
  els: (Element | SVGMapLayer)[]

  constructor(id: string) {
    this.id = id
    this.els = []
  }

  add(path: string[], el: Element | SVGMapLayer) {
    const key = path.shift()

    if (key) {
      for (const e of this.els) {
        if (e instanceof SVGMapLayer && e.id === key) {
          e.add(path, el)
          return
        }
      }

      const l = new SVGMapLayer(key)
      this.els.push(l)
    } else {
      this.els.push(el)
    }
  }
}
