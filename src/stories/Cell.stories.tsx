import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import { Cell } from './Cell'

export default {
  title: 'Cell',
  component: Cell,
} as ComponentMeta<typeof Cell>

const Template: ComponentStory<typeof Cell> = (args) => <Cell {...args} />

export const Empty = Template.bind({})

export const Number = Template.bind({})
Number.args = {number: 1}

export const SomeCandidates = Template.bind({})
SomeCandidates.args = {candidates: [1, 2]}

export const AllCandidates = Template.bind({})
AllCandidates.args = {candidates: [1, 2, 3, 4, 5, 6, 7, 8, 9]}
