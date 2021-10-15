import { Grid } from '../models/Grid'
import { Solver } from '../models/Solver'

test('unsolvable', () => {
  const solved = new Solver(Grid.newFromNotation('...39...25.7..4..6..98164.7....4.................8....1.59726..7..5..1.83...61...')).solve()
  expect(solved).toBeUndefined()
})
