import { ChildPtr } from "./ChildPtr"
import { PartNode } from "./PartNode"

export class ArrayChildPtr extends ChildPtr {
  children: (PartNode | null)[]
  i: number

  constructor(children: (PartNode | null)[], i: number) {
    super()
    this.children = children
    this.i = i
  }

  public get(): PartNode | null {
    return this.children[this.i]
  }

  public set(n: PartNode): void {
    this.children[this.i] = n
  }
}
