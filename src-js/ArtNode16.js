import { ArtNode } from "./ArtNode"
import { arrayCopy } from "./utils"
import { MAX_PREFIX_LEN, minimum } from "./Node"
import assert from "invariant"
import { ArrayChildPtr } from "./ArrayChildPtr"

let count = 0

export class ArtNode16 extends ArtNode {
  constructor(other) {
    super(other)

    this.keys = new Array(16).fill(0)
    this.children = new Array(16).fill(null)

    if (!other) {
      count++
    } else if (other instanceof ArtNode16) {
      this.keys = arrayCopy(other.keys, 0, this.keys, 0, other.numChildren)
      for (let i = 0; i < other.numChildren; i++) {
        this.children[i] = other.children[i]
        this.children[i].refCount++
      }
      count++
    } else if (other instanceof ArtNode4) {
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
      this.keys = arrayCopy(other.keys, 0, this.keys, 0, this.numChildren)
      for (let i = 0; i < this.numChildren; i++) {
        this.children[i] = other.children[i]
        this.children[i].refCount++
      }
    } else if (other instanceof ArtNode48) {
      count++
      assert(other.numChildren <= 16)
      this.numChildren = other.numChildren
      this.partialLen = other.partialLen
      this.partial = arrayCopy(
        other.partial,
        0,
        this.partial,
        0,
        Math.min(MAX_PREFIX_LEN, this.partialLen),
      )
      let child = 0
      for (let i = 0; i < 256; i++) {
        const pos = other.keys[i]
        if (pos !== 0) {
          this.keys[child] = i
          this.children[child] = other.children[pos - 1]
          this.children[child].refCount++
          child++
        }
      }
    }
  }
  clone() {
    return new ArtNode16(this)
  }
  findChild(c) {
    for (let i = 0; i < this.numChildren; i++) {
      if (this.keys[i] === c) {
        return new ArrayChildPtr(this.children, i)
      }
    }
  }
  minimum() {
    return minimum(this.children[0])
  }
  addChild(ref, c, child) {
    assert(this.refCount <= 1)

    if (this.numChildren < 16) {
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
  removeChild(ref, c) {
    assert(this.refCount <= 1)

    let idx
    for (idx = 0; idx < this.numChildren; idx++) {
      if (c === this.keys[idx]) {
        break
      }
    }
    if (idx === this.numChildren) {
      return
    }

    this.children[idx].decrementRefcount()

    this.keys = arrayCopy(
      this.keys,
      idx + 1,
      this.keys,
      idx,
      this.numChildren - idx - 1,
    )

    this.children = arrayCopy(
      this.children,
      idx + 1,
      this.children,
      idx,
      this.numChildren - idx - 1,
    )

    this.numChildren--

    if (this.numChildren === 3) {
      const result = new ArtNode4(this)
      ref.change(result)
    }
  }
  exhausted(i) {
    return i >= this.numChildren
  }
  nextChildAtOrAfter(i) {
    return i
  }
  childAt(i) {
    return this.children[i]
  }
  decrementRefcount() {
    if (--this.refCount <= 0) {
      let freed = 0
      for (let i = 0; i < this.numChildren; i++) {
        freed += this.children[i].decrementRefcount()
      }
      count--
      return freed + 232
    }
    return 0
  }
}
