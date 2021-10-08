export function allPossibleTuples(array: number[]): number[][] {
  return Array.from(Array(2 ** array.length - 1).keys())
    .map((n) =>
      ((n + 1) >>> 0)
        .toString(2)
        .split('')
        .reverse()
        .map((n, i) => (+n ? array[i] : 0))
        .filter(Boolean),
    )
    .filter(n => n.length > 1)
    .sort((a, b) => (a.length > b.length ? -1 : 1))
}

export function sameArrays<T>(a1?: T[], a2?: T[]): boolean {
  if (a1 === undefined && a2 === undefined) {
    return true
  }
  if (a1 === undefined || a2 === undefined) {
    return false
  }
  return a1.length === a2.length && a1.every((value, index) => value === a2[index])
}

export function setOrInit<K, V>(map: Map<K, V[]>, key: K, value: V) {
  const v = map.get(key)
  if (v) {
    v.push(value)
  } else {
    map.set(key, [value])
  }
}