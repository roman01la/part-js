import { ArtNode } from "./ArtNode"
import { ArtNode16 } from "./ArtNode16"
import { PartNode } from "./PartNode"
import { ChildPtr } from "./ChildPtr"
import { ArrayChildPtr } from "./ArrayChildPtr"
import { Leaf } from "./Leaf"
import { arrayCopy } from "./utils"

export class ArtNode4 extends ArtNode {
  public static count = 0

  keys: number[] = new Array(4).fill(0)
  children: (PartNode | null)[] = new Array(4).fill(null)

  constructor(other?: ArtNode4 | ArtNode16) {
    super(other)

    if (other instanceof ArtNode4) {
      this.keys = arrayCopy(other.keys, 0, this.keys, 0, other.numChildren)

      for (let i = 0; i < other.numChildren; i++) {
        this.children[i] = other.children[i]
        const child = this.children[i]
        if (child) {
          child.refcount++
        }
      }
      ArtNode4.count++
    }

    if (other instanceof ArtNode16) {
      ArtNode4.count++

      this.numChildren = other.numChildren
      this.partialLen = other.partialLen

      this.partial = arrayCopy(
        other.partial,
        0,
        this.partial,
        0,
        Math.min(PartNode.MAX_PREFIX_LEN, this.partialLen),
      )

      this.keys = arrayCopy(other.keys, 0, this.keys, 0, this.numChildren)

      for (let i = 0; i < this.numChildren; i++) {
        this.children[i] = other.children[i]
        const child = this.children[i]
        if (child) {
          child.refcount++
        }
      }
    }
  }

  public clone(): PartNode {
    return new ArtNode4(this)
  }

  public findChild(c: number): ChildPtr | null {
    for (let i = 0; i < this.numChildren; i++) {
      if (this.keys[i] === c) {
        return new ArrayChildPtr(this.children, i)
      }
    }
    return null
  }

  public minimum(): Leaf | null {
    return PartNode.minimum(this.children[0])
  }

  public addChild(ref: ChildPtr, c: number, child: PartNode): void {
    if (this.numChildren < 4) {
      let idx: number
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
      child.refcount++
      this.numChildren++
    } else {
      const result = new ArtNode16(this)
      ref.change(result)
      result.addChild(ref, c, child)
    }
  }

  public removeChild(ref: ChildPtr, c: number): void {
    let idx: number
    for (idx = 0; idx < this.numChildren; idx++) {
      if (c === this.keys[idx]) {
        break
      }
    }
    if (idx === this.numChildren) {
      return
    }

    const node = this.children[idx]
    if (node) {
      node.decrementRefcount()
    }

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
        if (child && child.refcount > 1) {
          child = child.clone()
        }

        const anChild = <ArtNode>child
        let prefix = this.partialLen

        if (prefix < PartNode.MAX_PREFIX_LEN) {
          this.partial[prefix] = this.keys[0]
          prefix++
        }

        if (prefix < PartNode.MAX_PREFIX_LEN) {
          const subPrefix = Math.min(
            anChild.partialLen,
            PartNode.MAX_PREFIX_LEN - prefix,
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
          Math.min(prefix, PartNode.MAX_PREFIX_LEN),
        )

        anChild.partialLen += this.partialLen + 1
      }

      if (child) {
        ref.change(child)
      }
    }
  }

  public exhausted(i: number): boolean {
    return i >= this.numChildren
  }

  public nextChildAtOrAfter(i: number): number {
    return i
  }

  public childAt(i: number): PartNode | null {
    return this.children[i]
  }

  public decrementRefcount(): number {
    if (--this.refcount <= 0) {
      let freed = 0
      for (let i = 0; i < this.numChildren; i++) {
        const child = this.children[i]
        if (child) {
          freed += child.decrementRefcount()
        }
      }
      ArtNode4.count--
      return freed + 128
    }
    return 0
  }
}
