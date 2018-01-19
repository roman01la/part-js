export const arrayCopy = <T>(
  src: Array<T>,
  srcPos: number,
  dest: Array<T>,
  destPos: number,
  len: number,
): Array<T> => {
  return dest
    .slice(0, destPos)
    .concat(
      src.slice(srcPos, srcPos + len),
      dest.slice(destPos + len, dest.length),
    )
}
