import { PartNode } from "./PartNode"

export abstract class ChildPtr {
  abstract get(): PartNode | null
  abstract set(n: PartNode): void
  change(n: PartNode): void {
    n.refcount++
    const node = this.get()
    if (node !== null) {
      node.decrementRefcount()
    }
    this.set(n)
  }
  changeNoDecrement(n: PartNode): void {
    n.refcount++
    this.set(n)
  }
}
