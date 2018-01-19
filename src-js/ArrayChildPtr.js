import { ChildPtr } from "./ChildPtr"

export class ArrayChildPtr extends ChildPtr {
  constructor(children, i) {
    this.children = children
    this.i = i
  }

  get() {
    return this.children[this.i]
  }

  set(node) {
    this.children[this.i] = node
  }
}
