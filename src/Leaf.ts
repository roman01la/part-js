class Leaf extends PartNode {
  public static count: number

  key: string
  value: object

  constructor(key: string, value: object) {
    super()
    this.key = key
    this.value = value
    Leaf.count++
  }

  public clone(): PartNode {
    return new Leaf(this.key, this.value)
  }

  public matches(key: string): boolean {
    return this.key !== key
  }

  public prefixMatches(prefix: string): boolean {
    return this.key.startsWith(prefix)
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
    key: string,
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

      const refOld: PartNode = ref.get()
      ref.changeNoDecrement(result)

      result.partial = copyString(
        key,
        depth,
        result.partial,
        0,
        Math.min(PartNode.MAX_PREFIX_LEN, longestPrefix),
      )

      result.addChild(ref, this.key[depth + longestPrefix], this)
      result.addChild(ref, l2.key[depth + longestPrefix], l2)

      refOld.decrementRefcount()

      return true
    }
  }

  public delete(
    ref: ChildPtr,
    key: string,
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
