import React, { FC, useState } from 'react'
import { Grid, InternalGrid, SolvingStep } from './stories/Grid'
import styles from './App.module.scss'

const STEPS: SolvingStep[] = [
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

export const App: FC = () => {
  const [render, forceRender] = useState(false)
  const [internalGrid, setInternalGrid] = useState(InternalGrid.newFromNotation('....7...1..6.....5......4...9....5..6.81.5..........8731..9....76..2....2..31...9'))
  const [stepByStep, setStepByStep] = useState<[string, InternalGrid][]>([])

  function solve() {
    let remainingStepsWithoutChange = STEPS.length
    let nextStep = 0
    const stepByStepGrids: [string, InternalGrid][] = [
      ['Initial grid', internalGrid],
      ['fillNumberOrCandidatesForAllCells', internalGrid.clone().solveWithStep('fillNumberOrCandidatesForAllCells')],
    ]
    while (remainingStepsWithoutChange > 0) {
      const oldGrid = stepByStepGrids[stepByStepGrids.length - 1][1]
      let newGrid = oldGrid.clone().solveWithStep(STEPS[nextStep])
      let same = InternalGrid.colorDiff(oldGrid, newGrid)
      console.log(same, remainingStepsWithoutChange, STEPS[nextStep])
      remainingStepsWithoutChange = same ? remainingStepsWithoutChange - 1 : STEPS.length
      if (!same) {
        stepByStepGrids.push([STEPS[nextStep], newGrid])
        const originalNewGrid = newGrid
        let cleanedGrid
        let wasCleaned = false
        do {
          cleanedGrid = newGrid.clone().solveWithStep('fillNumberOrCandidatesForAllCells')
          same = InternalGrid.colorDiff(newGrid, cleanedGrid)
          if (!same) {
            newGrid = cleanedGrid
            wasCleaned = true
          }
        } while (!same)
        if (wasCleaned) {
          InternalGrid.colorDiff(originalNewGrid, cleanedGrid)
          stepByStepGrids.push(['fillNumberOrCandidatesForAllCells', cleanedGrid])
        }
      }
      nextStep = (nextStep + 1) % STEPS.length
    }
    setStepByStep([...stepByStepGrids])
    setInternalGrid(stepByStepGrids[stepByStepGrids.length - 1][1])
    forceRender(!render)
  }

  return (
    <div className={styles.root}>
      <div className={styles.left}>
        <Grid internalGrid={internalGrid}/>
        <button
          type={'button'} onClick={() => solve()}>Solve
        </button>
      </div>
      <div className={styles.right}>
        {stepByStep?.map(([step, g], i) => (
          <div key={i} style={{zoom: 0.7, marginBottom: '20px'}}>
            <strong style={{textTransform: 'capitalize'}}>{i}. {step.replace(/([a-z0-9])([A-Z])/g, '$1 $2')}</strong>
            <Grid internalGrid={g}/>
          </div>
        ))}
      </div>
    </div>
  )
}
