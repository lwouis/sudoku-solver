import { Grid } from './Grid'

export class Solver {
  constructor(public grid: Grid) {}

  solve(): Grid {
    let remainingStepsWithoutChange = STEPS.length
    let nextStep = 0
    let newGrid = this.grid.clone().solveWithStep('fillNumberOrCandidatesForAllCells')
    let oldGrid
    while (remainingStepsWithoutChange > 0) {
      oldGrid = newGrid
      newGrid = oldGrid.clone().solveWithStep(STEPS[nextStep])
      let same = Grid.colorDiff(oldGrid, newGrid)
      remainingStepsWithoutChange = same ? remainingStepsWithoutChange - 1 : STEPS.length
      if (!same) {
        let cleanedGrid
        do {
          cleanedGrid = newGrid.clone().solveWithStep('fillNumberOrCandidatesForAllCells')
          same = Grid.colorDiff(newGrid, cleanedGrid)
          if (!same) {
            newGrid = cleanedGrid
          }
        } while (!same)
      }
      nextStep = (nextStep + 1) % STEPS.length
    }
    return newGrid
  }
}

export type SolvingStep =
  'fillNumberOrCandidatesForAllCells'
  | 'singleCandidateForNumberInGroup'
  | 'candidatesTuplesRemoveOtherCandidates'
  | 'alignedCandidatesInBoxRemoveCandidatesOnLine'

export const STEPS: SolvingStep[] = [
  // for each line, if a candidate is the only one of its number, it is filled in
  'singleCandidateForNumberInGroup',
  // for each line/box, if there are same candidates tuples, remove their candidates from other cells
  // for each line/box, if there are candidate tuples with candidates not appearing elsewhere, remove their other candidates
  // (https://www.kristanix.com/sudokuepic/6hiddensubset.png)
  'candidatesTuplesRemoveOtherCandidates',
  // pointing pairs/triples (https://www.sudokuwiki.org/PuzImages/PP1.png)
  'alignedCandidatesInBoxRemoveCandidatesOnLine',

  // great documentation on techniques: https://www.sudokuwiki.org/Strategy_Families
  // box line reduction (https://www.sudokuwiki.org/PuzImages/BLR1.png)
  // double pointing pairs (https://www.kristanix.com/sudokuepic/4blockblock.png)
  // x-wing (https://www.kristanix.com/sudokuepic/7xwing.png)
  // y-wing (https://www.sudokuwiki.org/PuzImages/YWing1.png)
  // swordfish. Very complex... (https://www.kristanix.com/sudokuepic/sudoku-solving-techniques.php)
  // single chains. A bit bruteforce though... (https://www.sudokuwiki.org/Singles_Chains)
]