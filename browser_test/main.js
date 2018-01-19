const ArtTree = artTree.ArtTree

const maxN = 5000
const maxKeyLen = 10

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const range = n => new Array(n).fill(n)

const genKeys = () => {
  let seq = range(maxN)
    .map(() =>
      range(randInt(5, maxKeyLen))
        .map(() => randInt(0, 255) + 1)
        .concat(0),
    )
    .map(s => s.join(","))
  seq = new Set(seq)
  return Array.from(seq).map(s => s.split(/,/g).map(s => +s))
}

const test = (name, fn) => {
  console.log(name)
  fn()
}

test("insert, search", () => {
  const t = new ArtTree()
  const keys = genKeys()
  const holdOut = 10

  const start = performance.now()

  for (let i = 0; i < keys.length - holdOut; i++) {
    const k = keys[i]
    console.assert(t.search(k) === null)
    t.insert(k, i)
    console.assert(t.search(k) === i)
  }

  console.assert(t.size === keys.length - holdOut)

  for (let i = keys.length - holdOut; i < keys.length; i++) {
    console.assert(t.search(keys[i]) === null)
  }

  console.log(`${performance.now() - start} ms`)
  console.log(`${keys.length} nodes`)
  console.log("==========================")
})

test("insert, delete", () => {
  const t = new ArtTree()
  const keys = genKeys()

  const start = performance.now()

  for (let i = 0; i < keys.length; i++) {
    const k = keys[i]
    console.assert(t.search(k) === null)
    t.insert(k, i)
    console.assert(t.search(k) === i)
  }

  console.assert(t.size === keys.length)

  for (let i = 0; i < keys.length; i++) {
    const k = keys[i]
    // console.assert(t.search(k) === i)
    t.delete(k)
    console.assert(t.search(k) === null)
  }

  console.assert(t.size === 0, t.size, 0)

  console.log(`${performance.now() - start} ms`)
  console.log(`${keys.length} nodes`)
  console.log("==========================")
})
