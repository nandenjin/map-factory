export class Layer {
  id: string
  els: (Element | Layer)[]

  constructor(id: string) {
    this.id = id
    this.els = []
  }

  add(path: string[], el: Element | Layer) {
    const key = path.shift()

    if (key) {
      for (const e of this.els) {
        if (e instanceof Layer && e.id === key) {
          e.add(path, el)
          return
        }
      }

      const l = new Layer(key)
      this.els.push(l)
    } else {
      this.els.push(el)
    }
  }
}
