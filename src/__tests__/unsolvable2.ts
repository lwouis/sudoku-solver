import { Grid } from '../models/Grid'
import { Solver } from '../models/Solver'

test('unsolvable "recursed 187250382 times"', () => {
  const solved = new Solver(Grid.newFromNotation('6..........98....6..8..2..........25....4....25..........2..8..9....72..........7')).solve()
  expect(solved).toBeUndefined()
})
