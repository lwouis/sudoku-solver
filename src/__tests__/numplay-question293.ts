import { Grid } from '../models/Grid'
import { Solver } from '../models/Solver'

test('backtracking', () => {
  const solved = new Solver(Grid.newFromNotation('2.9..84611.4...98786714953294.6.5.78685....4937.894.56496..78135189..724723481695')).solve()
  expect(solved!.toString()).toEqual('239578461154326987867149532941635278685712349372894156496257813518963724723481695')
  expect(solved!.isCompletedAndValid()).toBeTruthy()
})
