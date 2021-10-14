import { Grid } from '../models/Grid'
import { Solver } from '../models/Solver'

test('backtracking', () => {
  const solved = new Solver(Grid.newFromNotation('8.........95.......67.........924768...513492...678135...7519.6...496..3...832...')).solve()
  expect(solved.toString()).toEqual('823145679495267381167389254531924768678513492249678135384751926752496813916832547')
  expect(solved.isCompletedAndValid()).toBeTruthy()
})
