import { ArtNode } from "./ArtNode"

export class ArtNode48 extends ArtNode {
  keys = new Array(256)
  children = new Array(48)

  constructor(node) {
    this.node = node
  }
}
