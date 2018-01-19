import { Leaf } from "./Leaf"

export const MAX_PREFIX_LEN = 8

export const insert = (node, ref, key, value, depth, forceClone) => {
  if (node) {
    return node.insert(ref, key, value, depth, forceClone)
  } else {
    ref.change(new Leaf(key, value))
    return true
  }
}

export const clone = node => (node ? node.clone() : null)

export const minimum = node => (node ? node.minimum() : null)

export const exhausted = (node, i) => (node ? node.exhausted(i) : null)

export class Node {
  constructor() {
    this.refCount = 0
  }
}
