import React, {FC, useEffect, useState} from 'react'
import {Grid} from './stories/Grid'
import {Grid as GridModel} from './models/Grid'
import styles from './App.module.scss'
import {STEPS} from './models/Solver'
import {useLocation} from "react-router-dom";

export const App: FC = () => {
    const gridNotationRegex = /^[1-9.]{81}$/;
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
        return '8.........95.......67.........924768...513492...678135...7519.6...496..3...832...'
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
                <label style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px'}}>Grid in
                    textual notation:
                    <input type="text" maxLength={81} pattern="[0-9\.]+" value={gridInNotation}
                           onChange={e => {
                               window.location.replace('#' + e.currentTarget.value)
                               setGridInNotation(e.currentTarget.value);
                           }} style={{width: '81ch', fontFamily: 'monospace'}}/>
                    {!gridIsValid && <span style={{color: 'red'}}>This grid is invalid</span>}
                </label>
                <Grid gridModel={gridModel}/>
                <button type={'button'} onClick={() => solve()} disabled={!gridIsValid}>Solve</button>
                <button type={'button'} onClick={() => reset()}>Reset</button>
            </div>
            {gridIsValid && <div className={styles.right}>
                {stepByStep?.map(([step, g], i) => (
                    <div key={i} style={{zoom: 0.7, marginBottom: '20px'}}>
                        <strong
                            style={{textTransform: 'capitalize'}}>{i}. {step.replace(/([a-z0-9])([A-Z])/g, '$1 $2')}</strong>
                        <Grid gridModel={g}/>
                    </div>
                ))}
            </div>}
        </div>
    )
}
