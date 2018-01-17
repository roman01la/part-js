import { Leaf } from "./Leaf"
import { ArtNode } from "./ArtNode"
import { ArtNode16 } from "./ArtNode16"
import { ArtNode256 } from "./ArtNode256"
import { PartNode } from "./PartNode"
import { ChildPtr } from "./ChildPtr"
import { ArrayChildPtr } from "./ArrayChildPtr"
import { arrayCopy } from "./utils"

export class ArtNode48 extends ArtNode {
  public static count: number

  keys: number[] = new Array(256)
  children: (PartNode | null)[] = new Array(48)

  constructor(other?: ArtNode16 | ArtNode48 | ArtNode256) {
    super(other)

    if (other instanceof ArtNode16) {
      ArtNode48.count++

      this.numChildren = other.numChildren
      this.partialLen = other.partialLen

      this.partial = arrayCopy(
        other.partial,
        0,
        this.partial,
        0,
        Math.min(PartNode.MAX_PREFIX_LEN, this.partialLen),
      )

      for (let i = 0; i < other.numChildren; i++) {
        this.keys[PartNode.toUint(other.keys[i])] = i + 1
        this.children[i] = other.children[i]

        const child = this.children[i]
        if (child !== null) {
          child.refcount++
        }
      }
    }

    if (other instanceof ArtNode48) {
      this.keys = arrayCopy(other.keys, 0, this.keys, 0, 256)
      for (let i = 0; i < 48; i++) {
        this.children[i] = other.children[i]
        const child = this.children[i]
        if (child !== null) {
          child.refcount++
        }
      }
      ArtNode48.count++
    }

    if (other instanceof ArtNode256) {
      ArtNode48.count++

      this.numChildren = other.numChildren
      this.partialLen = other.partialLen

      this.partial = arrayCopy(
        other.partial,
        0,
        this.partial,
        0,
        Math.min(PartNode.MAX_PREFIX_LEN, this.partialLen),
      )

      let pos = 0
      for (let i = 0; i < 256; i++) {
        const child = other.children[i]
        if (child !== null) {
          this.keys[i] = pos + 1
          this.children[pos] = other.children[i]
          const child = this.children[pos]
          if (child !== null) {
            child.refcount++
          }
          pos++
        }
      }
    }
  }

  public clone(): PartNode {
    return new ArtNode48(this)
  }

  public findChild(c: number): ChildPtr | null {
    let idx = PartNode.toUint(this.keys[PartNode.toUint(c)])

    if (idx !== 0) {
      return new ArrayChildPtr(this.children, idx - 1)
    }
    return null
  }

  public minimum(): Leaf | null {
    let idx = 0
    while (this.keys[idx] === 0) {
      idx++
    }
    const child = this.children[PartNode.toUint(this.keys[idx]) - 1]
    if (child !== null) {
      return PartNode.minimum(child)
    } else {
      return null
    }
  }

  public addChild(ref: ChildPtr, c: number, child: PartNode): void {
    if (this.numChildren < 48) {
      let pos = 0

      while (this.children[pos] !== null) {
        pos++
      }

      this.children[pos] = child
      child.refcount++
      this.keys[PartNode.toUint(c)] = pos + 1
      this.numChildren++
    } else {
      const result = new ArtNode256(this)
      ref.change(result)
      result.addChild(ref, c, child)
    }
  }

  public removeChild(ref: ChildPtr, c: number): void {
    const pos = PartNode.toUint(this.keys[PartNode.toUint(c)])
    this.keys[PartNode.toUint(c)] = 0
    const child = this.children[pos - 1]
    if (child !== null) {
      child.decrementRefcount()
    }
    this.children[pos - 1] = null
    this.numChildren--

    if (this.numChildren === 12) {
      const result = new ArtNode16(this)
      ref.change(result)
    }
  }

  public exhausted(c: number): boolean {
    for (let i = c; i < 256; i++) {
      if (this.keys[i] !== 0) {
        return false
      }
    }
    return true
  }

  public nextChildAtOrAfter(c: number): number {
    let pos = c
    for (; pos < 256; pos++) {
      if (this.keys[pos] !== 0) {
        break
      }
    }
    return pos
  }

  public childAt(i: number): PartNode | null {
    return this.children[PartNode.toUint(this.keys[i]) - 1]
  }

  public decrementRefcount(): number {
    if (--this.refcount <= 0) {
      let freed = 0
      for (let i = 0; i < this.numChildren; i++) {
        const child = this.children[i]
        if (child !== null) {
          freed += child.decrementRefcount()
        }
      }
      ArtNode48.count--
      return freed + 728
    }
    return 0
  }
}
