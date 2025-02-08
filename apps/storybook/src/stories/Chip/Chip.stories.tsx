import type { Meta, StoryObj } from '@storybook/react';

import Chip from '../../../../../src/Chip';
import { fn } from '@storybook/test';

const meta: Meta<typeof Chip> = {
  component: Chip,
  parameters: {
    layout: 'centered'
  }
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof Chip>;

export const Non_Clickable_Chip: Story = {
  args: {
    label: 'Chip'
  }
} satisfies Story;

export const Clickable_Chip: Story = {
  args: {
    label: 'Chip',
    onClick: fn()
  }
} satisfies Story;
