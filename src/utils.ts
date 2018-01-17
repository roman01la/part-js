const copyString = (
  src: string,
  srcPos: number,
  dest: string,
  destPos: number,
  len: number,
): string => {
  return (
    dest.substr(0, destPos) +
    src.substr(srcPos, len) +
    dest.substr(len, dest.length)
  )
}

const arrayCopy = <T>(
  src: Array<T>,
  srcPos: number,
  dest: Array<T>,
  destPos: number,
  len: number,
): Array<T> => {
  return [
    ...dest.slice(0, destPos),
    ...src.slice(srcPos, srcPos + len),
    ...dest.slice(destPos + len, dest.length),
  ]
}
