class ArtNode4 extends ArtNode {
  public static count: number

  keys: string[] = new Array(4)
  children: PartNode[] = []

  constructor(other?: ArtNode4 | ArtNode16) {
    super(other)

    if (other instanceof ArtNode4) {
      this.keys = arrayCopy(other.keys, 0, this.keys, 0, other.numChildren)

      for (let i = 0; i < other.numChildren; i++) {
        this.children[i] = other.children[i]
        this.children[i].refcount++
      }
      ArtNode4.count++
    }

    if (other instanceof ArtNode16) {
      ArtNode4.count++

      this.numChildren = other.numChildren
      this.partialLen = other.partialLen

      this.partial = copyString(
        other.partial,
        0,
        this.partial,
        0,
        Math.min(PartNode.MAX_PREFIX_LEN, this.partialLen),
      )

      this.keys = arrayCopy(other.keys, 0, this.keys, 0, this.numChildren)

      for (let i = 0; i < this.numChildren; i++) {
        this.children[i] = other.children[i]
        this.children[i].refcount++
      }
    }
  }

  public clone(): PartNode {
    return new ArtNode4(this)
  }

  public findChild(c: string): ChildPtr | null {
    for (let i = 0; i < this.numChildren; i++) {
      if (this.keys[i] === c) {
        return new ArrayChildPtr(this.children, i)
      }
    }
    return null
  }

  public minimum(): Leaf {
    return PartNode.minimum(this.children[0])
  }

  public addChild(ref: ChildPtr, c: string, child: PartNode): void {
    if (this.numChildren < 4) {
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
      const result = new ArtNode16(this)
      ref.change(result)
      result.addChild(ref, c, child)
    }
  }

  public removeChild(ref: ChildPtr, c: string): void {
    let idx: number
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

    if (this.numChildren === 1) {
      let child = this.children[0]

      if (child instanceof Leaf === false) {
        if (child.refcount > 1) {
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

      ref.change(child)
    }
  }

  public exhausted(i: number): boolean {
    return i >= this.numChildren
  }

  public nextChildAtOrAfter(i: number): number {
    return i
  }

  public childAt(i: number): PartNode {
    return this.children[i]
  }

  public decrementRefcount(): number {
    if (--this.refcount <= 0) {
      let freed = 0
      for (let i = 0; i < this.numChildren; i++) {
        freed += this.children[i].decrementRefcount()
      }
      ArtNode4.count--
      return freed + 128
    }
    return 0
  }
}
