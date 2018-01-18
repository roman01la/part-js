import { Leaf } from "./Leaf"

export const MAX_PREFIX_LEN = 8

export class Node {
  constructor() {
    this.refCount = 0
  }

  insert(node, ref, key, value, depth, forceClone) {
    if (node) {
      return node.insert(ref, key, value, depth, forceClone)
    } else {
      ref.change(new Leaf(key, value))
      return true
    }
  }
}
