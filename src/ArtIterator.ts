import { PartNode } from "./PartNode"
import { Deque } from "./Deque"
import { Leaf } from "./Leaf"
import { ArtNode } from "./ArtNode"

export class ArtIterator implements Iterator<[number[], object]> {
  private elemStack: Deque<PartNode> = new Deque()
  private idxStack: Deque<number> = new Deque()

  constructor(root: PartNode | null) {
    if (root !== null) {
      this.elemStack.push(root)
      this.idxStack.push(0)
      this.maybeAdvance()
    }
  }

  public hasNext(): boolean {
    return this.elemStack.isEmpty() === false
  }

  public next(value?: any): IteratorResult<[number[], object]> {
    if (this.hasNext()) {
      const leaf = <Leaf | null>this.elemStack.peek()
      if (leaf !== null) {
        const { key, value } = leaf
        this.idxStack.push(this.idxStack.pop() + 1)
        this.maybeAdvance()
        return { value: [key, value], done: false }
      } else {
        return { value: [[0], {}], done: false }
      }
    } else {
      return { value: value, done: true }
    }
  }

  public remove(): void {
    throw new Error("Unsupported operation")
  }

  private canPopExhausted(): boolean {
    let canDo =
      this.elemStack.isEmpty() === false ? this.elemStack.peek() : false
    return canDo instanceof PartNode
      ? canDo.exhausted(this.idxStack.peek())
      : false
  }

  private maybeAdvance(): void {
    while (this.canPopExhausted()) {
      this.elemStack.pop()
      this.idxStack.pop()

      if (this.elemStack.isEmpty() === false) {
        this.idxStack.push(this.idxStack.pop() + 1)
      }
    }

    if (this.elemStack.isEmpty() === false) {
      while (true) {
        if (this.elemStack.peek() instanceof Leaf) {
          break
        } else {
          const curr = <ArtNode | null>this.elemStack.peek()
          if (curr !== null) {
            this.idxStack.push(curr.nextChildAtOrAfter(this.idxStack.pop()))
          }
          const idx = this.idxStack.peek()
          if (idx !== null && curr !== null) {
            const child = curr.childAt(idx)
            if (child !== null) {
              this.elemStack.push(child)
              this.idxStack.push(0)
            }
          }
        }
      }
    }
  }
}
