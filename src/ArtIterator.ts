class ArtIterator implements Iterator<[number[], object]> {
  next(value?: any): IteratorResult<[number[], object]> {
    return { value }
  }
}
