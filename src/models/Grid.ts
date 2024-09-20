import {allPossibleTuples, sameArrays, setOrInit} from './Utils'
import {SolvingStep} from './Solver'

export interface CellProps {
    number?: number
    candidates: number[]
    isInitial?: boolean
    isDiff?: boolean
}

export class Grid {
    constructor(public cells: CellProps[]) {
    }

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
        return this.clone()
    }

    toggleCandidate(col: number, row: number, candidate: number): Grid {
        const cell = this.get(col, row)
        cell.number = undefined
        if (cell.candidates.includes(candidate)) {
            cell.candidates = cell.candidates.filter(c => c !== candidate)
        } else {
            cell.candidates = [...cell.candidates, candidate]
        }
        return this.clone()
    }

    backtracking(): Grid | undefined {
        if (this.isCompleted()) {
            if (this.isCompletedAndValid()) {
                return this
            }
            return undefined
        }
        const firstEmptyCell = this.emptyCells()[0]
        const candidates = firstEmptyCell[0].candidates.map(c => c)
        for (const candidate of candidates) {
            const gridClone = this.clone()
            gridClone.cells[firstEmptyCell[1]].number = candidate
            const [col, row] = Grid.colRow(firstEmptyCell[1])
            let changed = false
            do {
                changed = gridClone.fillNumberOrCandidatesImpactedByCell(col, row)
            } while (changed)
            const res = gridClone.backtracking()
            if (res !== undefined) {
                return res
            }
        }
        return undefined
    }

    solveWithStep(step: SolvingStep): Grid {
        const clone = this.clone()
        clone[step]()
        return clone
    }

    fillNumberOrCandidatesForAllCells(): void {
        for (let row = 1; row <= 9; row++) {
            for (let col = 1; col <= 9; col++) {
                this.fillNumberOrCandidatesForCell(col, row)
            }
        }
    }

    fillNumberOrCandidatesForCell(col: number, row: number): void {
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
            }
            cell.candidates = candidates
        }
    }

    fillNumberOrCandidatesImpactedByCell(col: number, row: number): boolean {
        const newNumber = this.get(col, row).number
        let anyChange = false
        if (newNumber !== undefined) {
            for (let c = 1; c <= 9; c++) {
                if (this.removeCandidateFromCell(c, row, newNumber)) {
                    anyChange = true
                }
            }
            for (let r = 1; r <= 9; r++) {
                if (this.removeCandidateFromCell(col, r, newNumber)) {
                    anyChange = true
                }
            }
            const boxFirstCol = Math.ceil(col / 3) * 3 - 2
            const boxFirstRow = Math.ceil(row / 3) * 3 - 2
            for (let r = boxFirstRow; r <= boxFirstRow + 2; r++) {
                for (let c = boxFirstCol; c <= boxFirstCol + 2; c++) {
                    if (this.removeCandidateFromCell(c, r, newNumber)) {
                        anyChange = true
                    }
                }
            }
        }
        return anyChange
    }

    removeCandidateFromCell(col: number, row: number, candidate: number): boolean {
        const cell = this.get(col, row)
        if (cell.number === undefined) {
            const candidates = cell.candidates.filter(c => c !== candidate)
            if (candidates.length === 1) {
                cell.number = candidates[0]
                this.fillNumberOrCandidatesImpactedByCell(col, row)
                return true
            }
            const different = cell.candidates.length !== candidates.length || !candidates.every((c) => cell.candidates.includes(c))
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

    isValid(candidatesAreSet?: boolean) {
        if (candidatesAreSet && this.cells.some(c => c.number === undefined && c.candidates.length === 0)) {
            return false
        }
        for (const type of ['row', 'col', 'box']) {
            for (let i = 1; i <= 9; i++) {
                const numbersMap = new Map<number, number>(Array.from({length: 9}, (_, i) => [i + 1, 0]))
                for (let j = 1; j <= 9; j++) {
                    const colRow = Grid.colRowForType(type, j, i)
                    const cell = this.get(colRow[0], colRow[1])
                    if (cell?.number !== undefined) {
                        numbersMap.set(cell.number, numbersMap.get(cell.number)! + 1)
                    }
                }
                if (Array.from(numbersMap.values()).some(count => count > 1)) {
                    return false
                }
            }
        }
        return true
    }
}

export const GRIDS = {
    easy: [
        '7..4..316...7....99.6..87.22.9154873..1637..4.7.2.....6.4..123...2......3..8.2691',
        '26.8913.7.79......1.86.7...7.1.69..4456...9.2..2.1.7.66...728..813.........5.364.',
        '8714.5..2.326.75...46.198.....9.......4.5319.7...61....97146....65.9.....8.57.64.',
        '.625.3....5.....1...7.982..72.6843.594.7.518238.....6.....56.71.7....5.9..89.....',
        '3..4.6752...7..9.87.98..41.1.7.2.345.543..1..2........9.5.34.81.62.8.5.38..5.....',
        '29...53..57..8.6246........9.821.465....58297..26.4.8..6.5.1.3.....7.5..345..6..1',
        '.....56.81..26..5365.73...1....7238..1..46.2..29....6.8.16.794246....7..9..3..81.',
        '..67..853.523.......8.467122..8.1.67.7.46.9..6.1...2..86....14...96....83.51...29',
        '.....2.6.5.198....29....1....5...9...7.26..1.....3987.93.6487.1..8...6.3756.914.2',
        '5..6.2.......594.6..8....2.75.3.614812.98765.83..4....4.7...36...57..8.26...9....',
    ],
    medium: [
        '7.85436...9.6..1..5..1.....3..9.458.9.......7..7..5...1....6..3.36.5.79.2.......5',
        '.49..13...2.394.8...8..2.4.....6....8.4....631...3.9..4....9.5.28...34.7.7...613.',
        '..13.9......18.4...5....9...1.5.23....7..6..14...715..97.61......84.5.7.3.4.2....',
        '67....9...8..6.5..5.24..168.6..87..93......2....6.3.....3.......5913.746.2.....5.',
        '..4.7.69...5.39.4.1....57.....9...6...27..53.5..4..8197....6....81........38.7.5.',
        '....4.1...1.95...49......8.4.5..37.2.2.5..9....3.9..48..8.76..3......2.7..9.35.1.',
        '...361.926...9.......7...6..9..8.34.746........34..62.......23..72...489...85..7.',
        '1......7.2..49.1.6..5..189....1......215........9382159...45......3.974.4.8....39',
        '....7.......39..27.9.45.16.......258.....6749...52.6....18..97...87.4...34..1....',
        '7623...48.1.......4..1..69..41963..538......6.......3.6...5..2...4.....9..978.4..',

    ],
    hard: [
        '.5.68..1.7....54...1..2.6...98....43........1....7....2...9...483.76.....7......5',
        '....9.2...63..1.8.52....9.63957..14...84.5....4..1....6...2.5.9.......2..8..5....',
        '.......87.....8.4.1.7...59..35..47..426.........2694..87...6....4..8...3..1.57...',
        '8...6............9..5...1.8.485...1...68.2....9..3...76.71.49..1.9...4.235......1',
        '6....481....2......1......493...8......3..572...........1.....54..6.53.7.67......',
        '3.1...9...2..3..545....7..3.5...471..3...2..9..76.....2.....59......1.37..95....1',
        '..1.9...33.7.......8..5..1..1...92...4..6..8...........9...4.6......7.3.47...2..8',
        '9..6..53......1.627.2.9...8.4...987.....2...65...1......4.....9...95.2.......7...',
        '..5...3......9..7.......4.8216........3685..95......6.8.4.3.....6.8....3...9.71..',
        '..6.4.9...7..2.1.4..3.1.....3.9...5...58..7.........13.........2...9.5....76..4..',
    ],
    expert: [
        '.931............28....7..6..7...1...9.5....3.1...6......4..27......3...5.67....94',
        '.8.9......9.........6..28..2...1..54.31......9..6...8........3....85..6.12..46...',
        '.8..3.6.935.......2..91........7.8......5...66..8...9....2...58..........71..6..3',
        '1....42...7.3....6..5.6..9.........9....8.6.4..7...38...2..5.3.31......8.4.......',
        '......3..7.2..1.........7.8...5....72..94.....9.6...52....9...3.85.6.4..1......8.',
        '...26.9.......83.11..........7......8..3.5....9....28....6...7..6.....5...897.1..',
        '..3.....4...7.9..8.9....2..135......4..28....2..6.........5.........251..4..1..3.',
        '.....4.8..8.....1.72......9.....1..7....58.3..9..4.....75...1..4....6.....12..9..',
        '.29.......3....5.........16...521.....1.9.7......3..9....8.5..4.5......73.2..6...',
        '...9..8.23....2....7....1....74.....5..8.6......2...13.3......81.....94..9..74...',
    ]
}
