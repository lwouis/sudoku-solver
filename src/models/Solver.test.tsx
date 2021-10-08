import { Grid } from './Grid'
import { Solver } from './Solver'
import { readFileSync } from 'fs'
import * as path from 'path'

test('hard', () => {
  const solved = new Solver(Grid.newFromNotation('....7...1..6.....5......4...9....5..6.81.5..........8731..9....76..2....2..31...9')).solve()
  expect(solved.toString()).toEqual('853479261946281375127653498492867513678135942531942687315794826769528134284316759')
  expect(solved.checkIfCompleted()).toBeTruthy()
})

test('puzzles0_kaggle', () => testAllNotationsInFile())
test('puzzles1_unbiased', () => testAllNotationsInFile())
test('puzzles2_17_clue', () => testAllNotationsInFile())
test('puzzles3_magictour_top1465', () => testAllNotationsInFile())
test('puzzles4_forum_hardest_1905', () => testAllNotationsInFile())
test('puzzles5_forum_hardest_1905_11+', () => testAllNotationsInFile())
test('puzzles6_forum_hardest_1106', () => testAllNotationsInFile())
test('puzzles7_serg_benchmark', () => testAllNotationsInFile())
test('puzzles8_gen_puzzles', () => testAllNotationsInFile())

function testAllNotationsInFile() {
  const notations = readFileSync(path.join(__dirname, `../../dataset/${expect.getState().currentTestName}.txt`), 'utf8').split('\n')
  const solvedCount = notations.reduce((acc, notation) => {
    if (new Solver(Grid.newFromNotation(notation)).solve().checkIfCompleted()) {
      return acc + 1
    }
    return acc
  }, 0)
  expect(solvedCount).toBe(notations.length)
}
