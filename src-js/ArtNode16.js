import { ArtNode } from "./ArtNode"

export class ArtNode16 extends ArtNode {
  keys = new Array(16)
  children = new Array(16)

  constructor(node) {
    this.node = node
  }

  findChild(c) {
    let bitfield = 0
    for (let i = 0; i < 16; i++) {
      if (this.keys[i] === c) {
        bitfield = 1 << i
      }
    }
  }
}
