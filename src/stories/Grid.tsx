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

  solve(): InternalGrid {
    this.fillClearNumbersAndCandidates()
    this.removeImpossibleCandidates()
    return this
  }

  private fillClearNumbersAndCandidates() {
    for (let r = 1; r <= 9; r++) {
      for (let c = 1; c <= 9; c++) {
        this.solveCell(c, r)
      }
    }
  }

  private removeImpossibleCandidates() {
    for (const type of ['row', 'col', 'box']) {
      for (let i = 1; i <= 9; i++) {
        const tuples = new Map<string, CellProps[]>()
        for (let j = 1; j <= 9; j++) {
          const colRow = InternalGrid.colRowForType(type, j, i)
          const cell = this.get(colRow[0], colRow[1])
          if (cell.number || cell.candidates.length === 0) continue
          const k = cell.candidates.sort((a, b) => a - b).join('')
          const v = tuples.get(k)
          if (v) {
            v.push(cell)
          } else {
            tuples.set(k, [cell])
          }
        }
        for (const [k, cells] of tuples.entries()) {
          if (k.length > 1 && k.length === cells.length) {
            const candidates = k.split('').map(c => Number(c))
            for (const cell of Array.from(tuples.values()).flat()) {
              if (!cells.includes(cell)) {
                cell.candidates = cell.candidates.filter(c => !candidates.includes(c))
              }
            }
          }
        }
      }
    }
  }

  private static colRowForType(type: string, j: number, i: number): [number, number] {
    switch (type) {
      case 'col':
        return [i, j]
      case 'row' :
        return [j, i]
      default:
        const iMod3 = ((i - 1) % 3) + 1
        const jMod3 = ((j - 1) % 3) + 1
        const i147 = iMod3 === 1 ? 1 : (iMod3 === 2 ? 4 : 7)
        const iDiv3 = Math.ceil(i / 3)
        const jDiv3 = Math.ceil(j / 3)
        const j147 = iDiv3 === 1 ? 1 : (iDiv3 === 2 ? 4 : 7)
        return [i147 + jMod3 - 1, j147 + jDiv3 - 1]
    }
  }

  private solveCell(col: number, row: number) {
    const cell = this.get(col, row)
    if (cell.number) return
    let candidates = cell.candidates.length > 0 ? cell.candidates : Array.from({length: 9}, (_, i) => i + 1)
    for (let c = 1; c <= 9; c++) {
      candidates = candidates.filter(n => n !== this.get(c, row).number)
    }
    for (let r = 1; r <= 9; r++) {
      candidates = candidates.filter(n => n !== this.get(col, r).number)
    }
    const boxFirstCol = Math.ceil(col / 3) * 3 - 2
    const boxFirstRow = Math.ceil(row / 3) * 3 - 2
    for (let r = boxFirstRow; r <= boxFirstRow + 2; r++) {
      for (let c = boxFirstCol; c <= boxFirstCol + 2; c++) {
        candidates = candidates.filter(n => n !== this.get(c, r).number)
      }
    }
    if (candidates.length === 1) {
      cell.number = candidates[0]
    } else {
      cell.candidates = candidates
    }
  }

  private get(col: number, row: number): CellProps {
    return this.cells[(col - 1) + (row - 1) * 9]
  }
}

// function allPossibleTuples(array: number[]): number[][] {
//   return [...Array(2 ** array.length - 1).keys()]
//     .map((n) =>
//       ((n + 1) >>> 0)
//         .toString(2)
//         .split('')
//         .reverse()
//         .map((n, i) => (+n ? array[i] : 0))
//         .filter(Boolean),
//     )
//     .filter(n => n.length > 1)
//     .sort((a, b) => (a.length > b.length ? -1 : 1))
// }
//
// function deepIncludes(array1: number[][], array2: number[]): boolean {
//   return array1.some(a => {
//     if (a.length !== array2.length) {
//       return false
//     }
//     for (let i = 0; i < a.length; i++) {
//       if (a[i] !== array2[i]) {
//         return false
//       }
//     }
//     return true
//   })
// }
