import { Leaf } from "./Leaf"
import { ArtNode } from "./ArtNode"
import { ArtNode48 } from "./ArtNode48"
import { PartNode } from "./PartNode"
import { ChildPtr } from "./ChildPtr"
import { ArrayChildPtr } from "./ArrayChildPtr"
import { arrayCopy } from "./utils"

export class ArtNode256 extends ArtNode {
  public static count: number

  children: (PartNode | null)[] = new Array(256)

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
          this.children[i] = other.children[PartNode.toUint(other.keys[i]) - 1]
          const child = this.children[i]
          if (child !== null && child !== undefined) {
            child.refcount++
          }
        }
      }
    }

    if (other instanceof ArtNode256) {
      for (let i = 0; i < 256; i++) {
        this.children[i] = other.children[i]
        const child = this.children[i]
        if (child !== null && child !== undefined) {
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
    if (this.children[PartNode.toUint(c)] !== null) {
      return new ArrayChildPtr(this.children, PartNode.toUint(c))
    }
    return null
  }

  public minimum(): Leaf | null {
    let idx = 0
    while (this.children[idx] === null) {
      idx++
    }
    const child = this.children[idx]
    if (child !== null) {
      return PartNode.minimum(child)
    } else {
      return null
    }
  }

  public addChild(ref: ChildPtr, c: number, child: PartNode): void {
    this.numChildren++

    this.children[PartNode.toUint(c)] = child
    child.refcount++
  }

  public removeChild(ref: ChildPtr, c: number): void {
    const child = this.children[PartNode.toUint(c)]

    if (child !== null) {
      child.decrementRefcount()
    }

    this.children[PartNode.toUint(c)] = null
    this.numChildren--

    if (this.numChildren === 37) {
      const result = new ArtNode48(this)
      ref.change(result)
    }
  }

  public exhausted(c: number): boolean {
    for (let i = c; i < 256; i++) {
      if (this.children[i] !== null) {
        return false
      }
    }
    return true
  }

  public nextChildAtOrAfter(c: number): number {
    let pos = c
    for (; pos < 256; pos++) {
      if (this.children[pos] !== null) {
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
        if (child !== null && child !== undefined) {
          freed += child.decrementRefcount()
        }
      }
      ArtNode256.count--
      return freed + 2120
    }
    return 0
  }
}
