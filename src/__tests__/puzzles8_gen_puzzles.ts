import { readFileSync } from 'fs'
import path from 'path'
import { Solver } from '../models/Solver'
import { Grid } from '../models/Grid'

test('puzzles8_gen_puzzles', () => {
  const notations = readFileSync(path.join(__dirname, `../../dataset/${expect.getState().currentTestName}.txt`), 'utf8').split('\n')
  const properExitCount = notations.reduce((acc, notation, i) => {
    console.log(i, acc, notations.length)
    const solved = new Solver(Grid.newFromNotation(notation)).solve()
    if (solved === undefined) {
      return acc + 1
    }
    return acc
  }, 0)
  console.log(`Properly exited on unsolvable ${properExitCount}`)
  expect(properExitCount).toBe(notations.length)
})
