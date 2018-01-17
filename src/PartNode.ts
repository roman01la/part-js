abstract class PartNode {
  refcount: number

  static MAX_PREFIX_LEN: number = 8

  constructor(other?: PartNode) {
    this.refcount = 0
  }

  public abstract clone(): PartNode
  public static clone(n: PartNode | null): PartNode | null {
    if (n === null) {
      return null
    } else {
      return n.clone()
    }
  }

  public abstract minimum(): Leaf | null
  public static minimum(n: PartNode | null): Leaf | null {
    return n !== null ? n.minimum() : null
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
    if (n === null) {
      ref.change(new Leaf(key, value))
      return true
    } else {
      return n.insert(ref, key, value, depth, forceClone)
    }
  }

  public abstract delete(
    ref: ChildPtr,
    key: number[],
    depth: number,
    forceClone: boolean,
  ): boolean

  public abstract decrementRefcount(): number

  public abstract exhausted(i: number): boolean
  public static exhausted(n: PartNode | null, i: number): boolean {
    if (n === null) {
      return true
    } else {
      return n.exhausted(i)
    }
  }

  static toUint(b: number): number {
    return b & 0xff
  }
}
