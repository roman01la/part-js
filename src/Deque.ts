export class Deque<T> {
  private coll: T[] = []
  push(value: T): void {
    this.coll.push(value)
  }
  peek(): T | null {
    return this.coll.length > 0 ? this.coll[this.coll.length - 1] : null
  }
  pop(): T {
    const ret = this.coll.pop()
    if (ret !== undefined) {
      return ret
    } else {
      throw new Error("No such element")
    }
  }
  isEmpty(): boolean {
    return this.coll.length === 0
  }
}
