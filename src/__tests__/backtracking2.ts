import { Grid } from '../models/Grid'
import { Solver } from '../models/Solver'

test('backtracking', () => {
  const solved = new Solver(Grid.newFromNotation('..36......4.....8.9.....7..86.4...........1.5.2.......5...17...1...9...........2.')).solve()
  expect(solved.toString()).toEqual('253678419647931582918524736861459273439782165725163894592317648184296357376845921')
  expect(solved.isCompletedAndValid()).toBeTruthy()
})
