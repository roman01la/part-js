class ArtNode16 extends ArtNode {
  public static count: number

  keys: number[] = new Array(16)
  children: (PartNode | null)[] = new Array(16)

  constructor(other?: ArtNode4 | ArtNode16 | ArtNode48) {
    super(other)

    if (other instanceof ArtNode16) {
      this.keys = arrayCopy(other.keys, 0, this.keys, 0, other.numChildren)
      for (let i = 0; i < other.numChildren; i++) {
        this.children[i] = other.children[i]
        const child = this.children[i]
        if (child !== null) {
          child.refcount++
        }
      }
      ArtNode16.count++
    }

    if (other instanceof ArtNode4) {
      ArtNode16.count++
      this.numChildren = other.numChildren
      this.partialLen = other.partialLen
      this.keys = arrayCopy(other.keys, 0, this.keys, 0, this.numChildren)
      for (let i = 0; i < this.numChildren; i++) {
        this.children[i] = other.children[i]
        const child = this.children[i]
        if (child !== null) {
          child.refcount++
        }
      }
    }

    if (other instanceof ArtNode48) {
      ArtNode16.count++
      this.numChildren = other.numChildren
      this.partialLen = other.partialLen
      this.partial = arrayCopy(
        other.partial,
        0,
        this.partial,
        0,
        Math.min(PartNode.MAX_PREFIX_LEN, this.partialLen),
      )
      let child = 0
      for (let i = 0; i < 256; i++) {
        let pos = PartNode.toUint(other.keys[i])
        if (pos !== 0) {
          this.keys[child] = i
          this.children[child] = other.children[pos - 1]
          const node = this.children[child]
          if (node !== null) {
            node.refcount++
          }
          child++
        }
      }
    }
  }

  public clone(): PartNode {
    return new ArtNode16(this)
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
    if (this.numChildren < 16) {
      let idx: number
      for (idx = 0; idx < this.numChildren; idx++) {
        if (PartNode.toUint(c) < PartNode.toUint(this.keys[idx])) {
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
      const result = new ArtNode48(this)
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

    const child = this.children[idx]
    if (child !== null) {
      child.decrementRefcount()
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

    if (this.numChildren === 3) {
      const result = new ArtNode4(this)
      ref.change(result)
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
        if (child !== null) {
          freed += child.decrementRefcount()
        }
      }
      ArtNode16.count--
      return freed + 232
    }
    return 0
  }
}
