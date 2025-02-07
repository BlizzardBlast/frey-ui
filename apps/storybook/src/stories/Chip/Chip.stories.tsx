import type { Meta, StoryObj } from '@storybook/react';

import Chip from '../../../../../src/Chip';
import '../../../../../src/Chip/chip.module.css';
import { fn } from '@storybook/test';

const meta: Meta<typeof Chip> = {
  component: Chip,
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof Chip>;

export const FirstStory: Story = {
  args: {
    label: 'Chip',
    onClick: fn()
  }
} satisfies Story;
