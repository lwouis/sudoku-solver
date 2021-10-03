import React, { FC, useState } from 'react'
import { Grid, InternalGrid } from './stories/Grid'
import styles from './App.module.scss'

export const App: FC = () => {
  const [grid, setGrid] = useState(InternalGrid.newFromNotation('....7...1..6.....5......4...9....5..6.81.5..........8731..9....76..2....2..31...9'))
  const [render, forceRender] = useState(false)

  return (
    <div className={styles.root}>
      <Grid internalGrid={grid}/>
      <button type={'button'} onClick={() => {
        setGrid(grid.solve())
        forceRender(!render)
      }}>Solve</button>
    </div>
  )
}
