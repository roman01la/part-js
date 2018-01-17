import { ChildPtr } from "./ChildPtr"
import { PartNode } from "./PartNode"
import { ArtNode4 } from "./ArtNode4"
import { arrayCopy } from "./utils"

export class Leaf extends PartNode {
  public static count: number

  key: number[]
  value: object

  constructor(key: number[], value: object) {
    super()
    this.key = key
    this.value = value
    Leaf.count++
  }

  public clone(): PartNode {
    return new Leaf(this.key, this.value)
  }

  public matches(key: number[]): boolean {
    if (this.key.length !== key.length) {
      return false
    }
    for (let i = 0; i < key.length; i++) {
      if (this.key[i] !== key[i]) {
        return false
      }
    }
    return true
  }

  public prefixMatches(prefix: number[]): boolean {
    if (this.key.length < prefix.length) {
      return false
    }
    for (let i = 0; i < prefix.length; i++) {
      if (this.key[i] !== prefix[i]) {
        return false
      }
    }
    return true
  }

  public minimum(): Leaf {
    return this
  }

  public longestCommonPrefix(other: Leaf, depth: number): number {
    const maxCmp: number = Math.min(this.key.length, other.key.length) - depth
    let idx: number
    for (idx = 0; idx < maxCmp; idx++) {
      if (this.key[depth + idx] !== other.key[depth + idx]) {
        return idx
      }
    }
    return idx
  }

  public insert(
    ref: ChildPtr,
    key: number[],
    value: object,
    depth: number,
    forceClone: boolean,
  ): boolean {
    const clone: boolean = forceClone || this.refcount > 1

    if (this.matches(key)) {
      if (clone) {
        ref.change(new Leaf(key, value))
      } else {
        this.value = value
      }
      return false
    } else {
      const l2: Leaf = new Leaf(key, value)
      const longestPrefix: number = this.longestCommonPrefix(l2, depth)

      if (
        depth + longestPrefix >= this.key.length ||
        depth + longestPrefix >= key.length
      ) {
        throw new Error("Keys cannot be prefixes of other keys")
      }

      const result: ArtNode4 = new ArtNode4()
      result.partialLen = longestPrefix

      const refOld = ref.get()
      ref.changeNoDecrement(result)

      result.partial = arrayCopy(
        key,
        depth,
        result.partial,
        0,
        Math.min(PartNode.MAX_PREFIX_LEN, longestPrefix),
      )

      result.addChild(ref, this.key[depth + longestPrefix], this)
      result.addChild(ref, l2.key[depth + longestPrefix], l2)

      if (refOld !== null) {
        refOld.decrementRefcount()
      }

      return true
    }
  }

  public delete(
    ref: ChildPtr,
    key: number[],
    depth: number,
    forceClone: boolean,
  ): boolean {
    return this.matches(key)
  }

  public exhausted(i: number): boolean {
    return i > 0
  }

  public decrementRefcount(): number {
    if (--this.refcount <= 0) {
      Leaf.count--
      return 32
    }
    return 0
  }
}
