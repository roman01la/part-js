import { ChildPtr } from "./ChildPtr"
import { Leaf } from "./Leaf"

export abstract class PartNode {
  refcount = 0

  static MAX_PREFIX_LEN = 8

  public abstract clone(): PartNode
  public static clone(n: PartNode | null): PartNode | null {
    return n ? n.clone() : null
  }

  public abstract minimum(): Leaf | null
  public static minimum(n: PartNode | null): Leaf | null {
    return n ? n.minimum() : null
  }

  public abstract insert(
    ref: ChildPtr,
    key: number[],
    value: object,
    depth: number,
    forceClone: boolean,
  ): boolean
  public static insert(
    n: PartNode | null,
    ref: ChildPtr,
    key: number[],
    value: object,
    depth: number,
    forceClone: boolean,
  ): boolean {
    if (n) {
      return n.insert(ref, key, value, depth, forceClone)
    } else {
      ref.change(new Leaf(key, value))
      return true
    }
  }

  public abstract delete(
    ref: ChildPtr,
    key: number[],
    depth: number,
    forceClone: boolean,
  ): boolean

  public abstract decrementRefcount(): number

  public abstract exhausted(i: number | null): boolean
  public static exhausted(n: PartNode | null, i: number): boolean {
    return n ? n.exhausted(i) : true
  }
}
