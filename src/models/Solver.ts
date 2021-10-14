import { Grid } from './Grid'

export class Solver {
  constructor(public grid: Grid) {}

  solve(): Grid {
    let remainingStepsWithoutChange = STEPS.length
    let nextStep = 0
    let cleanedGrid
    let same
    let oldGrid = this.grid.clone()
    let newGrid = oldGrid
    while (remainingStepsWithoutChange > 0) {
      newGrid = oldGrid
      const originalNewGrid = newGrid
      let wasCleaned = false
      do {
        cleanedGrid = newGrid.clone().solveWithStep('fillNumberOrCandidatesForAllCells')
        same = Grid.colorDiff(newGrid, cleanedGrid)
        if (!same) {
          newGrid = cleanedGrid
          wasCleaned = true
        }
      } while (!same)
      if (wasCleaned) {
        Grid.colorDiff(originalNewGrid, cleanedGrid)
        oldGrid = cleanedGrid
      }
      newGrid = oldGrid.clone().solveWithStep(STEPS[nextStep])
      same = Grid.colorDiff(oldGrid, newGrid)
      remainingStepsWithoutChange = same ? remainingStepsWithoutChange - 1 : STEPS.length
      if (!same) {
        oldGrid = newGrid
      }
      nextStep = (nextStep + 1) % STEPS.length
    }
    if (newGrid.isCompleted()) {
      return newGrid
    }
    return this.solveWithBacktracking(newGrid) as Grid
  }

  solveWithBacktracking(grid: Grid): Grid | undefined {
    if (grid.isCompleted()) {
      if (grid.isCompletedAndValid()) {
        return grid
      }
      return undefined
    }
    let emptyCells
    let changed
    do {
      changed = false
      emptyCells = grid.emptyCells()
      for (const cell of emptyCells) {
        const [col, row] = Grid.colRow(cell[1])
        changed = grid.fillNumberOrCandidatesForCell(col, row)
        if (cell[0].candidates.length === 0) {
          return undefined
        }
      }
    } while (changed)
    if (emptyCells.length === 0) {
      return grid
    }
    for (const candidate of emptyCells[0][0].candidates) {
      emptyCells[0][0].number = candidate
      const res = this.solveWithBacktracking(grid.clone())
      if (res !== undefined) {
        return res
      }
    }
    return undefined
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

  // great documentation on techniques:
  //   * https://www.sudokuwiki.org/Strategy_Families
  //   * https://www.sudopedia.org/wiki/Solving_Technique

  // solve any sudoku: https://dancing-links.herokuapp.com/

  // box line reduction (https://www.sudokuwiki.org/PuzImages/BLR1.png)
  // double pointing pairs (https://www.kristanix.com/sudokuepic/4blockblock.png)
  // x-wing (https://www.kristanix.com/sudokuepic/7xwing.png)
  // y-wing (https://www.sudokuwiki.org/PuzImages/YWing1.png)
  // swordfish. Very complex... (https://www.kristanix.com/sudokuepic/sudoku-solving-techniques.php)
  // single chains. A bit bruteforce though... (https://www.sudokuwiki.org/Singles_Chains)
]
