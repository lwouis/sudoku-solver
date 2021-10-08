import React, { FC, useState } from 'react'
import { Grid } from './stories/Grid'
import { Grid as GridModel } from './models/Grid'
import styles from './App.module.scss'
import { STEPS } from './models/Solver'

export const App: FC = () => {
  const [render, forceRender] = useState(false)
  const [gridModel, setGridModel] = useState(GridModel.newFromNotation('....7...1..6.....5......4...9....5..6.81.5..........8731..9....76..2....2..31...9'))
  const [stepByStep, setStepByStep] = useState<[string, GridModel][]>([])

  function solve() {
    let remainingStepsWithoutChange = STEPS.length
    let nextStep = 0
    const stepByStepGrids: [string, GridModel][] = [
      ['Initial grid', gridModel],
      ['fillNumberOrCandidatesForAllCells', gridModel.clone().solveWithStep('fillNumberOrCandidatesForAllCells')],
    ]
    while (remainingStepsWithoutChange > 0) {
      const oldGrid = stepByStepGrids[stepByStepGrids.length - 1][1]
      let newGrid = oldGrid.clone().solveWithStep(STEPS[nextStep])
      let same = GridModel.colorDiff(oldGrid, newGrid)
      remainingStepsWithoutChange = same ? remainingStepsWithoutChange - 1 : STEPS.length
      if (!same) {
        stepByStepGrids.push([STEPS[nextStep], newGrid])
        const originalNewGrid = newGrid
        let cleanedGrid
        let wasCleaned = false
        do {
          cleanedGrid = newGrid.clone().solveWithStep('fillNumberOrCandidatesForAllCells')
          same = GridModel.colorDiff(newGrid, cleanedGrid)
          if (!same) {
            newGrid = cleanedGrid
            wasCleaned = true
          }
        } while (!same)
        if (wasCleaned) {
          GridModel.colorDiff(originalNewGrid, cleanedGrid)
          stepByStepGrids.push(['fillNumberOrCandidatesForAllCells', cleanedGrid])
        }
      }
      nextStep = (nextStep + 1) % STEPS.length
    }
    setStepByStep([...stepByStepGrids])
    setGridModel(stepByStepGrids[stepByStepGrids.length - 1][1])
    forceRender(!render)
  }

  return (
    <div className={styles.root}>
      <div className={styles.left}>
        <Grid gridModel={gridModel}/>
        <button
          type={'button'} onClick={() => solve()}>Solve
        </button>
      </div>
      <div className={styles.right}>
        {stepByStep?.map(([step, g], i) => (
          <div key={i} style={{zoom: 0.7, marginBottom: '20px'}}>
            <strong style={{textTransform: 'capitalize'}}>{i}. {step.replace(/([a-z0-9])([A-Z])/g, '$1 $2')}</strong>
            <Grid gridModel={g}/>
          </div>
        ))}
      </div>
    </div>
  )
}
