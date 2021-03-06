const { ArtTree } = require("../out/index")

const maxN = 10000
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

test("create, destroy", () => {
  const t = new ArtTree()
  expect(t.size).toBe(0)
  t.destroy()
  expect(t.size).toBe(0)
})

test("insert, search", () => {
  const t = new ArtTree()
  const keys = genKeys()
  const holdOut = 10

  for (let i = 0; i < keys.length - holdOut; i++) {
    const k = keys[i]
    expect(t.search(k)).toBe(null)
    t.insert(k, i)
    expect(t.search(k)).toBe(i)
  }

  expect(t.size).toBe(keys.length - holdOut)

  for (let i = keys.length - holdOut; i < keys.length; i++) {
    expect(t.search(keys[i])).toBe(null)
  }
})

test("insert, delete", () => {
  const t = new ArtTree()
  const keys = genKeys()

  for (let i = 0; i < keys.length; i++) {
    const k = keys[i]
    expect(t.search(k)).toBe(null)
    t.insert(k, i)
    expect(t.search(k)).toBe(i)
  }

  expect(t.size).toBe(keys.length)

  for (let i = 0; i < keys.length; i++) {
    const k = keys[i]
    expect(t.search(k)).toBe(i)
    t.delete(k)
    expect(t.search(k)).toBe(null)
  }

  expect(t.size).toBe(0)
})
