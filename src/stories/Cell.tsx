import React, { FC } from 'react'
import styles from './Cell.module.scss'

export interface CellProps {
  number?: number
  candidates: number[]
}

export const Cell: FC<CellProps> = ({number, candidates}) => {
  return (
    <div className={styles.root}>
      {number && (
        <div className={styles.number}>
          <div>{number}</div>
        </div>
      )}
      <div className={styles.candidates}>
        {Array.from({length: 9}, (_, i) => (
          <div key={i} className={styles.candidate} style={{visibility: number || !candidates.includes(i + 1) ? 'hidden' : 'visible'}}>{i + 1}</div>
        ))}
      </div>
    </div>
  )
}
