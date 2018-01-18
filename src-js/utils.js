export const arrayCopy = (src, srcPos, dest, destPos, len) => {
  return [].concat(
    Array.from(dest.slice(0, destPos)),
    Array.from(src.slice(srcPos, srcPos + len)),
    Array.from(dest.slice(destPos + len, dest.length)),
  )
}
