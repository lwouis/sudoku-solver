import React from 'react'
import { ComponentStory, ComponentMeta } from '@storybook/react'

import { Grid, InternalGrid } from './Grid'

export default {
  title: 'Grid',
  component: Grid,
} as ComponentMeta<typeof Grid>

const Template: ComponentStory<typeof Grid> = (args) => <Grid {...args} />

export const AllNumbers = Template.bind({})
AllNumbers.args = {internalGrid: new InternalGrid()}
