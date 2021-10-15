import { Grid } from '../models/Grid'
import { Solver } from '../models/Solver'

test('human techniques', () => {
  const solved = new Solver(Grid.newFromNotation('....7...1..6.....5......4...9....5..6.81.5..........8731..9....76..2....2..31...9')).solve()
  expect(solved!.toString()).toEqual('853479261946281375127653498492867513678135942531942687315794826769528134284316759')
  expect(solved!.isCompletedAndValid()).toBeTruthy()
})
