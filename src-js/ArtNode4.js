import { ArtNode } from "./ArtNode"
import { ArtNode4 } from "./ArtNode4"
import { ArtNode16 } from "./ArtNode16"
import { arrayCopy } from "./utils"

let count = 0

export class ArtNode4 extends ArtNode {
  keys = new Array(4)
  children = new Array(4)

  constructor(other) {
    super()

    if (!other) {
      count++
    } else if (other instanceof ArtNode4) {
      this.keys = arrayCopy(other.keys, 0, this.keys, 0, other.numChildren)

      for (let i = 0; i < other.numChildren; i++) {
        this.children[i] = other.children[i]
        this.children[i].refCount++
      }
      count++
    } else if (other instanceof ArtNode16) {
    }
  }

  findChild(c) {
    for (let i = 0; i < this.numChildren; i++) {
      if (this.keys[i] === c) {
        return this.children[i]
      }
    }
  }
}
