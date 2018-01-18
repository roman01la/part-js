import { ArtNode } from "./ArtNode"

export class ArtNode256 extends ArtNode {
  children = new Array(256)

  constructor(node) {
    this.node = node
  }
}
