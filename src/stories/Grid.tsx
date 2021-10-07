import React, { FC, useEffect, useState } from 'react'
import styles from './Grid.module.scss'
import { Cell, CellProps } from './Cell'
import { useHotkeys } from 'react-hotkeys-hook'

interface GridProps {
  internalGrid: InternalGrid
}

const shortcuts: [(i: number) => string, 'setNumber' | 'setCandidate'][] = [[(i) => `${i}`, 'setNumber'], [(i) => `shift+${i}`, 'setCandidate']]

export const Grid: FC<GridProps> = ({internalGrid}) => {
  const [render, forceRender] = useState(false)
  const [internalGrid$, setInternalGrid$] = useState<InternalGrid>(internalGrid)
  useEffect(() => setInternalGrid$(internalGrid), [internalGrid])
  const [hoveredColRow, setHoveredColRow] = useState<[number, number]>()

  for (let i = 1; i <= 9; i++) {
    for (const shortcut of shortcuts)
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useHotkeys(shortcut[0](i), (event) => {
        if (hoveredColRow && !event.repeat && !internalGrid$.get(hoveredColRow[0], hoveredColRow[1]).isInitial) {
          setInternalGrid$(internalGrid$[shortcut[1]](hoveredColRow[0], hoveredColRow[1], i))
          forceRender(!render)
        }
      }, [hoveredColRow, internalGrid$, forceRender])
  }

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
    return 'transparent'
  }

  return (
    <div className={styles.root}>
      {internalGrid$.cells.map((c, i) => {
        const col = i % 9 + 1
        const row = Math.floor(i / 9 + 1)
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

export type SolvingStep =
  'fillCandidatesForAllCells'
  | 'singleCandidateInCell'
  | 'singleCandidateForNumberInGroup'
  | 'candidatesTuplesRemoveOtherCandidates'
  | 'alignedCandidatesInBoxRemoveCandidatesOnLine'

export class InternalGrid {
  constructor(public cells: CellProps[]) {}

  clone(): InternalGrid {
    return new InternalGrid(this.cells.map(c => Object.assign({}, c)))
  }

  static newFromNotation(notation: string): InternalGrid {
    notation = notation.replaceAll('\n', '')
    return new InternalGrid(notation.split('').map(c => ({
      number: c === '.' ? undefined : Number(c),
      candidates: [],
      isInitial: c !== '.',
    })))
  }

  static colorDiff(grid1: InternalGrid, grid2: InternalGrid): boolean {
    let same = true
    grid2.cells.forEach((c2, i) => {
      const c1 = grid1.cells[i]
      c2.isDiff = c2.number !== c1.number || !InternalGrid.sameCandidates(c2.candidates, c1.candidates)
      if (c2.isDiff) {
        same = false
      }
    })
    return same
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

  solveWithStep(step: SolvingStep): InternalGrid {
    this[step]()
    return this
  }

  fillCandidatesForAllCells() {
    for (let row = 1; row <= 9; row++) {
      for (let col = 1; col <= 9; col++) {
        const cell = this.get(col, row)
        if (cell.number === undefined) {
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
          cell.candidates = candidates
        }
      }
    }
  }

  singleCandidateInCell() {
    for (let row = 1; row <= 9; row++) {
      for (let col = 1; col <= 9; col++) {
        const cell = this.get(col, row)
        if (!cell.number && cell.candidates.length === 1) {
          cell.number = cell.candidates[0]
        }
      }
    }
  }

  singleCandidateForNumberInGroup() {
    for (const type of ['row', 'col', 'box']) {
      for (let i = 1; i <= 9; i++) {
        const occurrences = new Map<number, CellProps[]>()
        for (let j = 1; j <= 9; j++) {
          const colRow = InternalGrid.colRowForType(type, j, i)
          const cell = this.get(colRow[0], colRow[1])
          for (const candidate of (cell.number ? [cell.number] : cell.candidates)) {
            const v = occurrences.get(candidate)
            if (v) {
              v.push(cell)
            } else {
              occurrences.set(candidate, [cell])
            }
          }
        }
        for (const [k, v] of occurrences.entries()) {
          if (v.length === 1 && v[0].number === undefined) {
            v[0].number = k
          }
        }
      }
    }
  }

  candidatesTuplesRemoveOtherCandidates() {
    for (const type of ['row', 'col', 'box']) {
      for (let i = 1; i <= 9; i++) {
        const candidatesMap = new Map<number, CellProps[]>()
        const partialTuplesMap = new Map<string, CellProps[]>()
        const fullTuplesMap = new Map<string, CellProps[]>()
        const allCells: CellProps[] = []
        for (let j = 1; j <= 9; j++) {
          const colRow = InternalGrid.colRowForType(type, j, i)
          const cell = this.get(colRow[0], colRow[1])
          if (cell.number === undefined && cell.candidates.length > 0) {
            allCells.push(cell)
            const candidates = cell.candidates.sort((a, b) => a - b)
            for (const candidate of candidates) {
              setOrInit(candidatesMap, candidate, cell)
            }
            for (const tuple of allPossibleTuples(candidates)) {
              setOrInit(partialTuplesMap, tuple.join(''), cell)
            }
            setOrInit(fullTuplesMap, candidates.join(''), cell)
          }
        }
        for (const [k, cells] of fullTuplesMap.entries()) {
          if (k.length > 1 && k.length === cells.length) {
            this.removeCandidates(k, allCells, cells)
          }
        }
        for (const [k, cells] of partialTuplesMap.entries()) {
          if (k.length === cells.length && k.split('').every(candidate => sameArrays(candidatesMap.get(Number(candidate)), cells))) {
            this.removeCandidates(k, allCells, cells)
          }
        }
      }
    }
  }

  alignedCandidatesInBoxRemoveCandidatesOnLine() {
    for (let i = 1; i <= 9; i++) {
      const candidatesColumns = new Map<number, number[]>()
      const candidatesRows = new Map<number, number[]>()
      for (let j = 1; j <= 9; j++) {
        const colRow = InternalGrid.colRowForType('box', j, i)
        const cell = this.get(colRow[0], colRow[1])
        if (cell.number === undefined && cell.candidates.length > 0) {
          cell.candidates.forEach(candidate => {
            setOrInit(candidatesColumns, candidate, colRow[0])
            setOrInit(candidatesRows, candidate, colRow[1])
          })
        }
      }
      const tuples: [Map<number, number[]>, string][] = [[candidatesColumns, 'col'], [candidatesRows, 'row']]
      tuples.forEach(([map, type], t) => {
        for (const [candidate, lines] of map.entries()) {
          if (new Set(lines).size === 1) {
            const otherMap = new Set(tuples[t === 0 ? 1 : 0][0].get(candidate))
            if (otherMap && otherMap.size > 1) {
              for (let j = 1; j <= 9; j++) {
                if (!otherMap.has(j)) {
                  const colRow = InternalGrid.colRowForType(type === 'col' ? 'row' : 'col', lines[0], j)
                  const cell = this.get(colRow[0], colRow[1])
                  if (cell.number === undefined && cell.candidates.length > 0) {
                    cell.candidates = cell.candidates.filter(c => c !== candidate)
                  }
                }
              }
            }
          }
        }
      })
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

  private static sameCandidates(c1: number[], c2: number[]): boolean {
    return c1.length === c2.length && c1.every((value, index) => value === c2[index])
  }

  private removeCandidates(k: string, allCells: CellProps[], cells: CellProps[]): void {
    const candidates = k.split('').map(c => Number(c))
    for (const cell of allCells) {
      if (!cells.includes(cell)) {
        cell.candidates = cell.candidates.filter(c => !candidates.includes(c))
      }
    }
  }

  get(col: number, row: number): CellProps {
    return this.cells[(col - 1) + (row - 1) * 9]
  }
}

function allPossibleTuples(array: number[]): number[][] {
  return Array.from(Array(2 ** array.length - 1).keys())
    .map((n) =>
      ((n + 1) >>> 0)
        .toString(2)
        .split('')
        .reverse()
        .map((n, i) => (+n ? array[i] : 0))
        .filter(Boolean),
    )
    .filter(n => n.length > 1)
    .sort((a, b) => (a.length > b.length ? -1 : 1))
}

function sameArrays<T>(a1?: T[], a2?: T[]): boolean {
  if (a1 === undefined && a2 === undefined) {
    return true
  }
  if (a1 === undefined || a2 === undefined) {
    return false
  }
  return a1.length === a2.length && a1.every((value, index) => value === a2[index])
}

function setOrInit<K, V>(map: Map<K, V[]>, key: K, value: V) {
  const v = map.get(key)
  if (v) {
    v.push(value)
  } else {
    map.set(key, [value])
  }
}
