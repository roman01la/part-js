import { ArtNode } from "./ArtNode"
import { ArrayChildPtr } from "./ArrayChildPtr"
import { minimum } from "./Node"

let count = 0

export class ArtNode48 extends ArtNode {
  constructor(other) {
    super(other)

    this.keys = new Array(256).fill(0)
    this.children = new Array(48).fill(null)

    if (!other) {
      count++
    } else if (other instanceof ArtNode48) {
      this.keys = arrayCopy(other.keys, 0, this.keys, 0, 256)
      for (let i = 0; i < 48; i++) {
        this.children[i] = other.children[i]
        if (this.children[i]) {
          this.children[i].refCount++
        }
      }
      count++
    } else if (other instanceof ArtNode16) {
      count++
      this.numChildren = other.numChildren
      this.partialLen = other.partialLen
      this.partial = arrayCopy(
        other.partial,
        0,
        this.partial,
        0,
        Math.min(MAX_PREFIX_LEN, this.partialLen),
      )
      for (let i = 0; i < this.numChildren; i++) {
        this.keys[other.keys[i]] = i + 1
        this.children[i] = other.children[i]
        this.children[i].refCount++
      }
    } else if (other instanceof ArtNode256) {
      count++
      assert(other.numChildren <= 48)
      this.numChildren = other.numChildren
      this.partialLen = other.partialLen
      this.partial = arrayCopy(
        other.partial,
        0,
        this.partial,
        0,
        Math.min(MAX_PREFIX_LEN, this.partialLen),
      )
      let pos = 0
      for (let i = 0; i < 256; i++) {
        if (other.children[i]) {
          this.keys[i] = pos + 1
          this.children[pos] = other.children[i]
          this.children[pos].refCount++
          pos++
        }
      }
    }
  }
  clone() {
    return new ArtNode48(this)
  }
  findChild(c) {
    const idx = this.keys[c]
    return idx !== 0 ? new ArrayChildPtr(this.children, idx - 1) : null
  }
  minimum() {
    let idx = 0
    while (this.keys[idx] === 0) {
      idx++
    }
    const child = this.children[this.keys[idx] - 1]
    return minimum(child)
  }
  addChild(ref, c, child) {
    assert(this.refCount <= 1)

    if (this.numChildren < 48) {
      let idx
      for (idx = 0; idx < this.numChildren; idx++) {
        if (c < this.keys[idx]) {
          break
        }
      }
      this.keys = arrayCopy(
        this.keys,
        idx,
        this.keys,
        idx + 1,
        this.numChildren - idx,
      )
      this.children = arrayCopy(
        this.children,
        idx,
        this.children,
        idx + 1,
        this.numChildren - idx,
      )
      this.keys[idx] = c
      this.children[idx] = child
      child.refCount++
      this.numChildren++
    } else {
      const result = new ArtNode48(this)
      ref.change(result)
      result.addChild(ref, c, child)
    }
  }
}
