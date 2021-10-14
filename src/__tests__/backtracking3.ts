import { Grid } from '../models/Grid'
import { Solver } from '../models/Solver'

test('backtracking', () => {
  const solved = new Solver(Grid.newFromNotation('.2..5...9..618..73............5....8...938....1.....6...1....2......4....973..4..')).solve()
  expect(solved.toString()).toEqual('123457689456189273789223514234516798675938142918742365341695827562874931897321456')
  expect(solved.isCompletedAndValid()).toBeTruthy()
})
