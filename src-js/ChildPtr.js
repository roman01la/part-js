export class ChildPtr {
  change(node) {
    node.refCount++
    const n = this.get()
    if (n) {
      n.decrementRefcount()
    }
    this.set(node)
  }
  changeNoDecrement(node) {
    node.refCount++
    this.set(node)
  }
}
