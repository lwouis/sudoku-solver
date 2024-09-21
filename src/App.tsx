import React, {FC, useEffect, useState} from 'react'
import {Grid} from './stories/Grid'
import {Grid as GridModel, GRIDS} from './models/Grid'
import styles from './App.module.scss'
import {STEPS} from './models/Solver'
import {useLocation} from "react-router-dom";

const gridNotationRegex = /^[1-9.]{81}$/;

export const App: FC = () => {
    const [initialHash] = useState(window.location.hash.substring(1)) // remove # at the beginning
    const initialGridFromHashOrDefault = initialGrid(initialHash)
    const [gridInNotation, setGridInNotation] = useState(initialGridFromHashOrDefault)
    const [gridModel, setGridModel] = useState(GridModel.newFromNotation(gridInNotation))
    const [gridIsValid, setGridIsValid] = useState(gridNotationRegex.test(gridInNotation) && gridModel.isValid())
    let {hash} = useLocation()
    hash = hash.substring(1) // remove # at the beginning
    if (hash !== initialHash && hash !== gridInNotation && gridNotationRegex.test(hash)) {
        setGridInNotation(hash)
    } else if (!gridNotationRegex.test(hash)) {
        window.location.replace('#' + gridInNotation)
    }
    const [render, forceRender] = useState(false)
    useEffect(() => {
        let newModel = GridModel.newFromNotation(gridInNotation)
        setGridModel(newModel)
        setGridIsValid(gridNotationRegex.test(gridInNotation) && newModel.isValid())
        setStepByStep([])
    }, [setGridModel, gridInNotation])
    const [stepByStep, setStepByStep] = useState<[string, GridModel][]>([])

    function initialGrid(initialHash: string) {
        if (gridNotationRegex.test(initialHash)) {
            return initialHash
        }
        return GRIDS['easy'][Math.floor(Math.random() * GRIDS['easy'].length)]
    }

    function reset() {
        if (gridIsValid) {
            setGridModel(GridModel.newFromNotation(gridInNotation))
            setStepByStep([])
        } else {
            window.location.hash = ""
            window.location.reload()
        }
    }

    function generateGrid(difficulty: keyof typeof GRIDS) {
        const newGrid = GRIDS[difficulty][Math.floor(Math.random() * GRIDS[difficulty].length)]
        window.location.replace('#' + newGrid)
    }

    function solve() {
        let remainingStepsWithoutChange = STEPS.length
        let nextStep = 0
        let cleanedGrid
        let same
        const stepByStepGrids: [string, GridModel][] = [['Initial grid', gridModel]]
        let oldGrid = stepByStepGrids[stepByStepGrids.length - 1][1]
        let newGrid = oldGrid
        while (remainingStepsWithoutChange > 0) {
            oldGrid = stepByStepGrids[stepByStepGrids.length - 1][1]
            newGrid = oldGrid
            const originalNewGrid = newGrid
            let wasCleaned = false
            do {
                cleanedGrid = newGrid.solveWithStep('fillNumberOrCandidatesForAllCells')
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
            newGrid = oldGrid.solveWithStep(STEPS[nextStep])
            same = GridModel.colorDiff(oldGrid, newGrid)
            remainingStepsWithoutChange = same ? remainingStepsWithoutChange - 1 : STEPS.length
            if (!same) {
                stepByStepGrids.push([STEPS[nextStep], newGrid])
            }
            nextStep = (nextStep + 1) % STEPS.length
        }
        if (!newGrid.isCompleted()) {
            const solvedGrid = newGrid.backtracking()
            if (solvedGrid) {
                stepByStepGrids.push(['backtracking', solvedGrid])
            }
        }
        setStepByStep([...stepByStepGrids])
        setGridModel(stepByStepGrids[stepByStepGrids.length - 1][1])
        forceRender(!render)
    }

    return (
        <div className={styles.root}>
            <div className={styles.left}>
                <section>
                    <strong>Generate a grid</strong>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                        <button type={'button'} onClick={() => generateGrid('easy')}>Easy</button>
                        <button type={'button'} onClick={() => generateGrid('medium')}>Medium</button>
                        <button type={'button'} onClick={() => generateGrid('hard')}>Hard</button>
                        <button type={'button'} onClick={() => generateGrid('expert')}>Expert</button>
                    </div>
                </section>
                <section>
                    <strong>Customize or paste grid</strong>
                    <textarea maxLength={81} value={gridInNotation}
                              onChange={e => {
                                  window.location.replace('#' + e.currentTarget.value)
                                  setGridInNotation(e.currentTarget.value);
                              }}/>
                    {!gridIsValid && <span style={{color: 'red'}}>This grid is invalid</span>}
                </section>
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px'}}>
                    <section>
                        <strong>Controls</strong>
                        <ul style={{margin: 0, padding: '0', listStylePosition: 'inside'}}>
                            <li>Mouse hover over a cell</li>
                            <li>Press a number to set it on that cell</li>
                            <li>Press shift+number to set it as candidate on that cell</li>
                            <li>Press backspace or delete to clear a cell</li>
                        </ul>
                    </section>
                </div>
            </div>
            <div className={styles.center}>
                <Grid gridModel={gridModel}/>
            </div>
            <div className={styles.right}>
                <section>
                    <strong>Solve the grid</strong>
                    <div style={{display: 'flex', gap: '20px'}}>
                        <button type={'button'} onClick={() => solve()} disabled={!gridIsValid}>Solve</button>
                        <button type={'button'} onClick={() => reset()}>Reset</button>
                    </div>
                </section>
                <div style={{overflow: 'auto', padding: '0 10px'}}>
                    {gridIsValid && stepByStep.length > 0 && stepByStep?.map(([step, g], i) => (
                        <div key={i} style={{zoom: 0.7, display: 'flex', flexDirection: 'column', gap: '5px'}}>
                            <strong
                                style={{textTransform: 'capitalize'}}>{i}. {step.replace(/([a-z0-9])([A-Z])/g, '$1 $2')}</strong>
                            <Grid gridModel={g}/>
                        </div>
                    ))}
                </div>
                {/* reserves the width of the section, so it doesn't jump on `solve` */}
                <div style={{zoom: 0.7, height: 0, visibility: 'hidden'}}>
                    <Grid gridModel={gridModel}/>
                </div>
            </div>
        </div>
    )
}
