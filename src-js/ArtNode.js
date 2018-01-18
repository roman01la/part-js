import { Node, MAX_PREFIX_LEN } from "./Node"
import { ArtNode4 } from "./ArtNode4"
import { arrayCopy } from "./utils"

export class ArtNode extends Node {
  constructor(other) {
    super()

    this.numChildren = 0
    this.partialLen = 0
    this.partial = new Array(MAX_PREFIX_LEN)

    if (other) {
      this.numChildren = other.numChildren
      this.partialLen = other.partialLen
      this.partial = arrayCopy(
        other.partial,
        0,
        this.partial,
        0,
        Math.min(MAX_PREFIX_LEN, this.partialLen),
      )
    }
  }

  checkPrefix(key, depth) {
    const maxCmp = Math.min(
      Math.min(MAX_PREFIX_LEN, this.partialLen),
      key.length - depth,
    )

    let idx

    for (idx = 0; idx < maxCmp; idx++) {
      if (this.partial[idx] !== key[depth + idx]) {
        return idx
      }
    }

    return idx
  }

  prefixMismatch(key, depth) {
    let maxCmp = Math.min(
      Math.min(MAX_PREFIX_LEN, this.partialLen),
      key.length - depth,
    )

    let idx

    for (idx = 0; idx < maxCmp; idx++) {
      if (this.partial[idx] !== key[depth + idx]) {
        return idx
      }
    }

    if (this.partialLen > MAX_PREFIX_LEN) {
      const l = this.minimum()
      maxCmp = Math.min(l.key.length, key.length) - depth
      for (; idx < maxCmp; idx++) {
        if (l.key[idx + depth] !== key[idx + depth]) {
          return idx
        }
      }
    }

    return idx
  }

  insert(ref, key, value, depth, forceClone) {
    const doClone = forceClone || this.refCount > 1

    if (this.partialLen > 0) {
      let prefixDiff = this.prefixMismatch(key, depth)

      if (prefixDiff >= this.partialLen) {
        depth += this.partialLen
      } else {
        const result = new ArtNode4()
        const refOld = ref.get()

        ref.changeNoDecrement(result)
        result.partialLen = prefixDiff
        result.partial = arrayCopy(
          this.partial,
          0,
          result.partial,
          0,
          Math.min(MAX_PREFIX_LEN, prefixDiff),
        )

        const thisWritable = doClone ? this.clone() : this

        if (this.partialLen <= MAX_PREFIX_LEN) {
          result.addChild(ref, thisWritable.partial[prefixDiff], thisWritable)
          this.thisWritable.partialLen -= prefixDiff + 1
          thisWritable.partial = arrayCopy(
            thisWritable.partial,
            prefixDiff + 1,
            thisWritable.partial,
            0,
            Math.min(MAX_PREFIX_LEN, thisWritable.partialLen),
          )
        } else {
          thisWritable.partialLen -= prefixDiff + 1
          const l = this.minimum()
          result.addChild(ref, l.key[depth + prefixDiff], thisWritable)
          thisWritable.partial = arrayCopy(
            l.key,
            depth + prefixDiff + 1,
            thisWritable.partial,
            0,
            Math.min(MAX_PREFIX_LEN, thisWritable.partialLen),
          )
        }

        const l = new Leaf(key, value)

        result.addChild(ref, key[depth + prefixDiff], l)
        refOld.decrementRefcount()

        return true
      }
    }

    const thisWritable = doClone ? this.clone() : this

    if (doClone) {
      ref.change(thisWritable)
    }

    const child = thisWritable.findChild(key[depth])

    if (child) {
      return Node.insert(child.get(), child, key, value, depth + 1, forceClone)
    } else {
      const l = new Leaf(key, value)
      thisWritable.addChild(ref, key[depth], l)
      return true
    }
  }

  delete(ref, key, depth, forceClone) {
    if (this.partialLen > 0) {
      const prefixLen = this.checkPrefix(key, depth)
      if (prefixLen !== Math.min(MAX_PREFIX_LEN, this.partialLen)) {
        return false
      }
      depth += this.partialLen
    }

    const doClone = forceClone || this.refCount > 1

    const thisWritable = doClone ? this.clone() : this

    const child = thisWritable.findChild(key[depth])

    if (!child) {
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
