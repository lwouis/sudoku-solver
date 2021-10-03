import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import { Grid, InternalGrid } from './Grid'

export default {
  title: 'Grid',
  component: Grid,
} as ComponentMeta<typeof Grid>

const Template: ComponentStory<typeof Grid> = (args) => <Grid {...args} />

export const AllNumbers = Template.bind({})
AllNumbers.args = {internalGrid: InternalGrid.newFromNotation('.5..83.17...1..4..3.4..56.8....3...9.9.8245....6....7...9....5...729..861.36.72.4')}
