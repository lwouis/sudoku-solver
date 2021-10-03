import React, { FC, useState } from 'react'
import styles from './Grid.module.scss'
import { Cell, CellProps } from './Cell'
import { useHotkeys } from 'react-hotkeys-hook'

interface GridProps {
  internalGrid: InternalGrid
}

export const Grid: FC<GridProps> = ({internalGrid}) => {
  const [render, forceRender] = useState(false)
  const [internalGrid$, setInternalGrid$] = useState<InternalGrid>(internalGrid)
  const [hoveredColRow, setHoveredColRow] = useState<[number, number]>()

  for (let i = 1; i <= 9; i++) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useHotkeys(String(i), (event) => {
      if (hoveredColRow && !event.repeat) {
        setInternalGrid$(internalGrid$.setNumber(hoveredColRow[0], hoveredColRow[1], i))
        forceRender(!render)
      }
    }, [hoveredColRow, internalGrid$, forceRender])
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useHotkeys(`shift+${i}`, (event) => {
      if (hoveredColRow && !event.repeat) {
        setInternalGrid$(internalGrid$.setCandidate(hoveredColRow[0], hoveredColRow[1], i))
        forceRender(!render)
      }
    }, [hoveredColRow, internalGrid$, forceRender])
  }

  function backgroundColor(col: number, row: number) {
    if (hoveredColRow?.[0] === col && hoveredColRow?.[1] === row) {
      return '#1fa1f3'
    }
    if (hoveredColRow?.[0] === col || hoveredColRow?.[1] === row) {
      return '#e0edf6'
    }
    return 'transparent'
  }

  return (
    <div className={styles.root}>
      {internalGrid$.cells.map((c, i) => {
        const col = i % 9 + 1
        const row = Math.floor(i / 9 + 1)
        return (
          <div
            key={`${col}${row}`}
            onMouseEnter={() => setHoveredColRow([col, row])}
            onMouseLeave={() => setHoveredColRow(undefined)}
            style={{backgroundColor: backgroundColor(col, row)}}>
            <Cell {...c}/>
          </div>
        )
      })}
    </div>
  )
}

export class InternalGrid {
  constructor(public cells: CellProps[]) {}

  static newFromNotation(notation: string): InternalGrid {
    notation = notation.replaceAll('\n', '')
    return new InternalGrid(notation.split('').map(c => ({number: c === '.' ? undefined : Number(c), candidates: []})))
  }

  setNumber(col: number, row: number, number: number): InternalGrid {
    const cell = this.get(col, row)
    cell.number = number
    return this
  }

  setCandidate(col: number, row: number, candidate: number): InternalGrid {
    const cell = this.get(col, row)
    cell.number = undefined
    if (cell.candidates.includes(candidate)) {
      cell.candidates = cell.candidates.filter(c => c !== candidate)
    } else {
      cell.candidates.push(candidate)
    }
    return this
  }

  private get(col: number, row: number): CellProps {
    return this.cells[(col - 1) + (row - 1) * 9]
  }
}







