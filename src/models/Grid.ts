import { allPossibleTuples, sameArrays, setOrInit } from './Utils'
import { SolvingStep } from './Solver'

export interface CellProps {
  number?: number
  candidates: number[]
  isInitial?: boolean
  isDiff?: boolean
}

export class Grid {
  constructor(public cells: CellProps[]) {}

  clone(): Grid {
    return new Grid(this.cells.map(c => Object.assign({}, c)))
  }

  toString(): string {
    return this.cells.map(x => x.number !== undefined ? x.number : '.').join('')
  }

  isCompleted(): boolean {
    return this.cells.every(c => c.number !== undefined)
  }

  isCompletedAndValid(): boolean {
    for (const type of ['row', 'col', 'box']) {
      for (let i = 1; i <= 9; i++) {
        const numbers = new Set<number>()
        for (let j = 1; j <= 9; j++) {
          const colRow = Grid.colRowForType(type, j, i)
          const cell = this.get(colRow[0], colRow[1])
          if (cell.number !== undefined) {
            numbers.add(cell.number)
          }
        }
        if (numbers.size !== 9) {
          return false
        }
      }
    }
    return true
  }

  emptyCells(): [CellProps, number][] {
    return this.cells
      .reduce((acc, c, i) => {
        c.candidates = c.candidates.sort((a, b) => a - b)
        return c.number === undefined ? [...acc, [c, i]] as [CellProps, number][] : acc
      }, [] as [CellProps, number][])
      .sort((a, b) => a[0].candidates.length - b[0].candidates.length)
  }

  static newFromNotation(notation: string): Grid {
    notation = notation.replace(/\n/g, '')
    return new Grid(notation.split('').map(c => ({
      number: c === '.' ? undefined : Number(c),
      candidates: [],
      isInitial: c !== '.',
    })))
  }

  static colorDiff(grid1: Grid, grid2: Grid): boolean {
    let same = true
    grid2.cells.forEach((c2, i) => {
      const c1 = grid1.cells[i]
      c2.isDiff = c2.number !== c1.number || !Grid.sameCandidates(c2.candidates, c1.candidates)
      if (c2.isDiff) {
        same = false
      }
    })
    return same
  }

  static colRow(i: number): [number, number] {
    return [i % 9 + 1, Math.floor(i / 9 + 1)]
  }

  setNumber(col: number, row: number, number: number): Grid {
    const cell = this.get(col, row)
    cell.number = number
    return this
  }

  toggleCandidate(col: number, row: number, candidate: number): Grid {
    const cell = this.get(col, row)
    cell.number = undefined
    if (cell.candidates.includes(candidate)) {
      cell.candidates = cell.candidates.filter(c => c !== candidate)
    } else {
      cell.candidates.push(candidate)
    }
    return this
  }

  solveWithStep(step: SolvingStep): Grid {
    this[step]()
    return this
  }

  fillNumberOrCandidatesForAllCells(): void {
    for (let row = 1; row <= 9; row++) {
      for (let col = 1; col <= 9; col++) {
        this.fillNumberOrCandidatesForCell(col, row)
      }
    }
  }

  fillNumberOrCandidatesForCell(col: number, row: number): boolean {
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
      if (candidates.length === 1) {
        cell.number = candidates[0]
        return true
      }
      let different = cell.candidates.length !== candidates.length || !cell.candidates.every(c => candidates.includes(c))
      cell.candidates = candidates
      return different
    }
    return false
  }

  singleCandidateForNumberInGroup() {
    for (const type of ['row', 'col', 'box']) {
      for (let i = 1; i <= 9; i++) {
        const occurrences = new Map<number, CellProps[]>()
        for (let j = 1; j <= 9; j++) {
          const colRow = Grid.colRowForType(type, j, i)
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
        occurrences.forEach((v, k) => {
          if (v.length === 1 && v[0].number === undefined) {
            v[0].number = k
          }
        })
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
          const colRow = Grid.colRowForType(type, j, i)
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
        fullTuplesMap.forEach((cells, k) => {
          if (k.length > 1 && k.length === cells.length) {
            this.removeCandidates(k, allCells, cells)
          }
        })
        partialTuplesMap.forEach((cells, k) => {
          if (k.length === cells.length && k.split('').every(candidate => sameArrays(candidatesMap.get(Number(candidate)), cells))) {
            this.removeCandidates(k, allCells, cells)
          }
        })
      }
    }
  }

  alignedCandidatesInBoxRemoveCandidatesOnLine() {
    for (let i = 1; i <= 9; i++) {
      const candidatesColumns = new Map<number, number[]>()
      const candidatesRows = new Map<number, number[]>()
      for (let j = 1; j <= 9; j++) {
        const colRow = Grid.colRowForType('box', j, i)
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
        map.forEach((lines, candidate) => {
          if (new Set(lines).size === 1) {
            const otherMap = new Set(tuples[t === 0 ? 1 : 0][0].get(candidate))
            if (otherMap && otherMap.size > 1) {
              for (let j = 1; j <= 9; j++) {
                if (!otherMap.has(j)) {
                  const colRow = Grid.colRowForType(type === 'col' ? 'row' : 'col', lines[0], j)
                  const cell = this.get(colRow[0], colRow[1])
                  if (cell.number === undefined && cell.candidates.length > 0) {
                    cell.candidates = cell.candidates.filter(c => c !== candidate)
                  }
                }
              }
            }
          }
        })
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
