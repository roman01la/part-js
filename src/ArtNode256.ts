import { Leaf } from "./Leaf"
import { ArtNode } from "./ArtNode"
import { ArtNode48 } from "./ArtNode48"
import { PartNode } from "./PartNode"
import { ChildPtr } from "./ChildPtr"
import { ArrayChildPtr } from "./ArrayChildPtr"
import { arrayCopy } from "./utils"

export class ArtNode256 extends ArtNode {
  public static count = 0

  children: (PartNode | null)[] = new Array(256).fill(null)

  constructor(other?: ArtNode48 | ArtNode256) {
    super(other)

    if (other instanceof ArtNode48) {
      ArtNode256.count++

      this.numChildren = other.numChildren
      this.partialLen = other.partialLen

      this.partial = arrayCopy(
        other.partial,
        0,
        this.partial,
        0,
        Math.min(PartNode.MAX_PREFIX_LEN, this.partialLen),
      )

      for (let i = 0; i < 256; i++) {
        if (other.keys[i] !== 0) {
          this.children[i] = other.children[other.keys[i] - 1]
          const child = this.children[i]
          if (child) {
            child.refcount++
          }
        }
      }
    }

    if (other instanceof ArtNode256) {
      for (let i = 0; i < 256; i++) {
        this.children[i] = other.children[i]
        const child = this.children[i]
        if (child) {
          child.refcount++
        }
      }
      ArtNode256.count++
    }
  }

  public clone(): PartNode {
    return new ArtNode256(this)
  }

  public findChild(c: number): ChildPtr | null {
    if (this.children[c]) {
      return new ArrayChildPtr(this.children, c)
    }
    return null
  }

  public minimum(): Leaf | null {
    let idx = 0
    while (!this.children[idx]) {
      idx++
    }
    return PartNode.minimum(this.children[idx])
  }

  public addChild(ref: ChildPtr, c: number, child: PartNode): void {
    console.assert(this.refcount <= 4)

    this.numChildren++
    this.children[c] = child
    child.refcount++
  }

  public removeChild(ref: ChildPtr, c: number): void {
    console.assert(this.refcount <= 1)

    const child = this.children[c]

    if (child) {
      child.decrementRefcount()
    }

    this.children[c] = null
    this.numChildren--

    if (this.numChildren === 37) {
      const result = new ArtNode48(this)
      ref.change(result)
    }
  }

  public exhausted(c: number): boolean {
    for (let i = c; i < 256; i++) {
      if (this.children[i]) {
        return false
      }
    }
    return true
  }

  public nextChildAtOrAfter(c: number): number {
    let pos = c
    for (; pos < 256; pos++) {
      if (this.children[pos]) {
        break
      }
    }
    return pos
  }

  public childAt(pos: number): PartNode | null {
    return this.children[pos]
  }

  public decrementRefcount(): number {
    if (--this.refcount <= 0) {
      let freed = 0
      for (let i = 0; i < 256; i++) {
        const child = this.children[i]
        if (child) {
          freed += child.decrementRefcount()
        }
      }
      ArtNode256.count--
      return freed + 2120
    }
    return 0
  }
}
