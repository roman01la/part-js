class ArrayChildPtr extends ChildPtr {
  children: PartNode[]
  i: number

  constructor(children: PartNode[], i: number) {
    super()
    this.children = children
    this.i = i
  }

  public get(): PartNode {
    return this.children[this.i]
  }

  public set(n: PartNode): void {
    this.children[this.i] = n
  }
}
