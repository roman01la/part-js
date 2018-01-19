import { Node, minimum, MAX_PREFIX_LEN } from "./Node"
import { ArtNode } from "./ArtNode"
import { ArtNode4 } from "./ArtNode4"
import { ArtNode16 } from "./ArtNode16"
import { ArrayChildPtr } from "./ArrayChildPtr"
import { Leaf } from "./Leaf"
import { arrayCopy } from "./utils"
import assert from "invariant"

let count = 0

export class ArtNode4 extends ArtNode {
  constructor(other) {
    super()

    this.keys = new Array(4).fill(0)
    this.children = new Array(4).fill(null)

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
      count++
      assert(other.numChildren <= 4)
      this.numChildren = other.numChildren
      this.partialLen = other.partialLen
      this.keys = arrayCopy(other.keys, 0, this.keys, 0, other.numChildren)
      for (let i = 0; i < other.numChildren; i++) {
        this.children[i] = other.children[i]
        this.children[i].refCount++
      }
    }
  }

  clone() {
    return new ArtNode4(this)
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

    if (this.numChildren < 4) {
      let idx
      for (let idx = 0; idx < this.numChildren; idx++) {
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
      const result = new ArtNode16(this)
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

    assert(this.children[idx] instanceof Leaf)
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

    if (this.numChildren === 1) {
      let child = this.children[0]

      if (child instanceof Leaf === false) {
        if (child.refCount > 1) {
          child = child.clone()
        }
        const anChild = child
        const prefix = this.partialLen
        if (prefix < MAX_PREFIX_LEN) {
          this.partial[prefix] = this.keys[0]
          prefix++
        }
        if (prefix < MAX_PREFIX_LEN) {
          const subPrefix = Math.min(
            anChild.partialLen,
            MAX_PREFIX_LEN - prefix,
          )
          this.partial = arrayCopy(
            anChild.partial,
            0,
            this.partial,
            prefix,
            subPrefix,
          )
          prefix += subPrefix
        }
        anChild.partial = arrayCopy(
          this.partial,
          0,
          anChild.partial,
          0,
          Math.min(prefix, MAX_PREFIX_LEN),
        )
        anChild.partialLen += this.partialLen + 1
      }
      ref.change(child)
    }
  }
  exhausted(i) {
    return i >= this.numChildren
  }
  nextChildAtOrAfter(i) {
    return i
  }
  childAt(i) {
    this.children[i]
  }
  decrementRefcount() {
    if (--this.refCount <= 0) {
      let freed = 0
      for (let i = 0; i < this.numChildren; i++) {
        freed += this.children[i].decrementRefcount()
      }
      count--
      return freed + 128
    }
    return 0
  }
}
