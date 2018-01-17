const arrayCopy = <T>(
  src: Array<T>,
  srcPos: number,
  dest: Array<T>,
  destPos: number,
  len: number,
): Array<T> => {
  return [].concat(
    Array.from(dest.slice(0, destPos)),
    Array.from(src.slice(srcPos, srcPos + len)),
    Array.from(dest.slice(destPos + len, dest.length)),
  )
}
