import React, {FC, useEffect, useState} from 'react'
import styles from './Grid.module.scss'
import {Cell} from './Cell'
import {useHotkeys} from 'react-hotkeys-hook'
import {CellProps, Grid as GridModel} from '../models/Grid'

interface GridProps {
    gridModel: GridModel
}

const numberShortcuts: [(i: number) => string, 'setNumber' | 'toggleCandidate'][] = [
    [(i) => `${i}`, 'setNumber'],
    [(i) => `shift+${i}`, 'toggleCandidate']
]

export const Grid: FC<GridProps> = ({gridModel}) => {
    const [render, forceRender] = useState(false)
    const [gridModel$, setGridModel$] = useState<GridModel>(gridModel)
    useEffect(() => setGridModel$(gridModel), [gridModel])
    const [hoveredColRow, setHoveredColRow] = useState<[number, number]>()

    for (let i = 1; i <= 9; i++) {
        for (const shortcut of numberShortcuts)
            // eslint-disable-next-line react-hooks/rules-of-hooks
            useHotkeys(shortcut[0](i), (event) => {
                if (hoveredColRow && !event.repeat && !gridModel$.get(hoveredColRow[0], hoveredColRow[1]).isInitial) {
                    setGridModel$(gridModel$[shortcut[1]](hoveredColRow[0], hoveredColRow[1], i))
                    forceRender(!render)
                }
            }, [hoveredColRow, gridModel$, forceRender])
    }
    useHotkeys(['backspace', 'delete'], (event) => {
        if (hoveredColRow && !event.repeat && !gridModel$.get(hoveredColRow[0], hoveredColRow[1]).isInitial) {
            setGridModel$(gridModel$.clearCell(hoveredColRow[0], hoveredColRow[1]))
            forceRender(!render)
        }
    }, [hoveredColRow, gridModel$, forceRender])

    function backgroundColor(col: number, row: number, cell: CellProps) {
        if (hoveredColRow?.[0] === col && hoveredColRow?.[1] === row) {
            if (cell.isDiff) {
                return '#8FCFE4'
            }
            return '#1FA1F3'
        } else if (hoveredColRow?.[0] === col || hoveredColRow?.[1] === row) {
            if (cell.isDiff) {
                return '#F0F5E5'
            }
            return '#E0EDF6'
        }
        if (cell.isDiff) {
            return '#FFFDD4'
        }
        return 'white'
    }

    return (
        <div className={styles.root}>
            {gridModel$.cells.map((c, i) => {
                const [col, row] = GridModel.colRow(i)
                return (
                    <div
                        key={i}
                        onMouseEnter={() => setHoveredColRow([col, row])}
                        onMouseLeave={() => setHoveredColRow(undefined)}
                        style={{backgroundColor: backgroundColor(col, row, c)}}>
                        <Cell {...c}/>
                    </div>
                )
            })}
        </div>
    )
}

