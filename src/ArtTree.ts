import { ChildPtr } from "./ChildPtr"
import { PartNode } from "./PartNode"
import { Leaf } from "./Leaf"
import { ArtNode } from "./ArtNode"
import { ArtIterator } from "./ArtIterator"

export class ArtTree extends ChildPtr {
  root: PartNode | null = null
  numElements = 0

  constructor(other?: ArtTree) {
    super()
    if (other) {
      this.root = other.root
      this.numElements = other.numElements
    }
  }

  public snapshot(): ArtTree {
    const b = new ArtTree()

    if (this.root !== null) {
      b.root = PartNode.clone(this.root)
      if (b.root !== null) {
        b.root.refcount++
      }
    }

    b.numElements = this.numElements
    return b
  }

  get(): PartNode | null {
    return this.root
  }

  set(n: PartNode): void {
    this.root = n
  }

  public search(key: number[]): object | null {
    let n = this.root
    let prefixLen
    let depth = 0

    while (n !== null && n !== undefined) {
      if (n instanceof Leaf) {
        const l = <Leaf>n
        if (l.matches(key)) {
          return l.value
        } else {
          return null
        }
      } else {
        const an = <ArtNode>n
        if (an.partialLen > 0) {
          prefixLen = an.checkPrefix(key, depth)
          if (prefixLen !== Math.min(PartNode.MAX_PREFIX_LEN, an.partialLen)) {
            return null
          }
          depth += an.partialLen
        }

        if (depth >= key.length) {
          return null
        }

        const child = an.findChild(key[depth])
        n = child !== null ? child.get() : null
        depth++
      }
    }
    return null
  }

  public insert(key: number[], value: object): void {
    if (PartNode.insert(this.root, this, key, value, 0, false)) {
      this.numElements++
    }
  }

  public delete(key: number[]): void {
    if (this.root !== null) {
      const childIsLeaf = this.root instanceof Leaf
      const doDelete = this.root.delete(this, key, 0, false)
      if (doDelete) {
        this.numElements--
        if (childIsLeaf) {
          this.root = null
        }
      }
    }
  }

  public interator(): Iterator<[number[], object]> {
    return new ArtIterator(this.root)
  }

  public prefixIterator(prefix: number[]): Iterator<[number[], object]> {
    let n = this.root
    let prefixLen
    let depth = 0

    while (n !== null) {
      if (n instanceof Leaf) {
        const l = <Leaf>n

        if (l.prefixMatches(prefix)) {
          return new ArtIterator(l)
        } else {
          return new ArtIterator(null)
        }
      } else {
        if (depth === prefix.length) {
          const min = n.minimum()
          if (min !== null && min.prefixMatches(prefix)) {
            return new ArtIterator(n)
          } else {
            return new ArtIterator(null)
          }
        } else {
          const an = <ArtNode>n

          if (an.partialLen > 0) {
            prefixLen = an.prefixMismatch(prefix, depth)
            if (prefixLen === 0) {
              return new ArtIterator(null)
            } else if (depth + prefixLen === prefix.length) {
              return new ArtIterator(n)
            } else {
              depth += an.partialLen
            }
          }
        }
      }
    }
    return new ArtIterator(null)
  }

  public get size(): number {
    return this.numElements
  }

  public destroy(): number {
    if (this.root !== null) {
      const result = this.root.decrementRefcount()
      this.root = null
      return result
    } else {
      return 0
    }
  }
}
