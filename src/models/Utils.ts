import { readFileSync } from 'fs'
import path from 'path'
import { Solver } from './Solver'
import { Grid } from './Grid'

export function allPossibleTuples(array: number[]): number[][] {
  return Array.from({length: 1 << array.length}, (_, i) => array.filter((_, j) => i & 1 << j))
    .filter(n => n.length > 1)
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

export function testAllGridsInFile(): void {
  const notations = readFileSync(path.join(__dirname, `../../dataset/${expect.getState().currentTestName}.txt`), 'utf8').split('\n')
  const solvedCount = notations.reduce((acc, notation) => {
    if (new Solver(Grid.newFromNotation(notation)).solve().checkIfCompleted()) {
      // console.log(acc, notations.length)
      return acc + 1
    }
    return acc
  }, 0)
  console.log(`Solved ${solvedCount}`)
  expect(solvedCount).toBe(notations.length)
}
