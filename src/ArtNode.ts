abstract class ArtNode extends PartNode {
  numChildren: number = 0
  partialLen: number = 0
  partial: string = "" // PartNode.MAX_PREFIX_LEN

  constructor(other?: ArtNode) {
    super(other)

    if (other) {
      this.numChildren = other.numChildren
      this.partialLen = other.partialLen
      this.partial = copyString(
        other.partial,
        0,
        this.partial,
        0,
        Math.min(PartNode.MAX_PREFIX_LEN, this.partialLen),
      )
    }
  }

  public checkPrefix(key: string, depth: number): number {
    const maxCmp = Math.min(
      Math.min(this.partialLen, PartNode.MAX_PREFIX_LEN),
      key.length - depth,
    )

    let idx: number

    for (idx = 0; idx < maxCmp; idx++) {
      if (this.partial[idx] !== key[depth + idx]) {
        return idx
      }
    }

    return idx
  }

  public prefixMismatch(key: string, depth: number): number {
    let maxCmp = Math.min(
      Math.min(this.partialLen, PartNode.MAX_PREFIX_LEN),
      key.length - depth,
    )

    let idx: number

    for (idx = 0; idx < maxCmp; idx++) {
      if (this.partial[idx] !== key[depth + idx]) {
        return idx
      }
    }

    if (this.partialLen > PartNode.MAX_PREFIX_LEN) {
      const l: Leaf = this.minimum()
      maxCmp = Math.min(l.key.length, key.length) - depth

      for (; idx < maxCmp; idx++) {
        if (l.key[idx + depth] !== key[depth + idx]) {
          return idx
        }
      }
    }

    return idx
  }

  public abstract findChild(c: string): ChildPtr | null

  public abstract addChild(ref: ChildPtr, c: string, child: PartNode): void

  public abstract removeChild(ref: ChildPtr, c: string): void

  public abstract nextChildAtOrAfter(i: number): number

  public abstract childAt(i: number): PartNode

  public insert(
    ref: ChildPtr,
    key: string,
    value: object,
    depth: number,
    forceClone: boolean,
  ): boolean {
    const doClone = forceClone || this.refcount > 1

    if (this.partialLen > 0) {
      const prefixDiff: number = this.prefixMismatch(key, depth)

      if (prefixDiff >= this.partialLen) {
        depth += this.partialLen
      } else {
        const result = new ArtNode4()
        const oldRef = ref.get()

        ref.changeNoDecrement(result)
        result.partialLen = prefixDiff

        result.partial = copyString(
          this.partial,
          0,
          result.partial,
          0,
          Math.min(PartNode.MAX_PREFIX_LEN, prefixDiff),
        )

        const thisWritable: ArtNode = doClone ? <ArtNode>this.clone() : this

        if (this.partialLen <= PartNode.MAX_PREFIX_LEN) {
          result.addChild(ref, thisWritable.partial[prefixDiff], thisWritable)
          thisWritable.partialLen -= prefixDiff + 1

          thisWritable.partial = copyString(
            thisWritable.partial,
            prefixDiff + 1,
            thisWritable.partial,
            0,
            Math.min(PartNode.MAX_PREFIX_LEN, thisWritable.partialLen),
          )
        } else {
          thisWritable.partialLen -= prefixDiff + 1

          const l: Leaf = this.minimum()

          result.addChild(ref, l.key[depth + prefixDiff], thisWritable)

          thisWritable.partial = copyString(
            l.key,
            depth + prefixDiff + 1,
            thisWritable.partial,
            0,
            Math.min(PartNode.MAX_PREFIX_LEN, thisWritable.partialLen),
          )
        }

        const l = new Leaf(key, value)
        result.addChild(ref, key[depth + prefixDiff], l)

        oldRef.decrementRefcount()

        return true
      }
    }

    const thisWritable: ArtNode = doClone ? <ArtNode>this.clone() : this

    if (doClone) {
      ref.change(thisWritable)
    }

    const child = thisWritable.findChild(key[depth])

    if (child !== null) {
      return PartNode.insert(
        child.get(),
        child,
        key,
        value,
        depth + 1,
        forceClone,
      )
    } else {
      const l = new Leaf(key, value)
      thisWritable.addChild(ref, key[depth], l)
      return true
    }
  }

  public delete(
    ref: ChildPtr,
    key: string,
    depth: number,
    forceClone: boolean,
  ): boolean {
    if (this.partialLen > 0) {
      const prefixLen = this.checkPrefix(key, depth)
      if (prefixLen !== Math.min(PartNode.MAX_PREFIX_LEN, this.partialLen)) {
        return false
      }
      depth += this.partialLen
    }

    const doClone = forceClone || this.refcount > 1

    const thisWritable: ArtNode = doClone ? <ArtNode>this.clone() : this

    const child = thisWritable.findChild(key[depth])

    if (child === null) {
      return false
    }

    if (doClone) {
      ref.change(thisWritable)
    }

    const childIsLeaf = child.get() instanceof Leaf
    const doDelete = child.get().delete(child, key, depth + 1, doClone)

    if (doDelete && childIsLeaf) {
      thisWritable.removeChild(ref, key[depth])
    }

    return doDelete
  }
}
