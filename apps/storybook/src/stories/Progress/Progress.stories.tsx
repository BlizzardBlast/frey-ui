import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ProgressProps } from 'frey-ui';
import { Progress } from 'frey-ui';
import type React from 'react';

const StoryProgress = Progress as unknown as React.ComponentType<ProgressProps>;

const meta: Meta<ProgressProps> = {
  component: StoryProgress,
  parameters: {
    layout: 'centered'
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    )
  ],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg']
    },
    value: {
      control: { type: 'number' }
    },
    max: {
      control: { type: 'number' }
    },
    indeterminate: {
      control: { type: 'boolean' }
    },
    showValue: {
      control: { type: 'boolean' }
    }
  }
} satisfies Meta<ProgressProps>;

export default meta;

type Story = StoryObj<ProgressProps>;

export const basic_progress: Story = {
  args: {
    label: 'Upload progress',
    value: 45,
    max: 100,
    size: 'md',
    showValue: true
  }
} satisfies Story;

export const size_variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12 }}>
      <Progress label='Small progress' value={30} size='sm' />
      <Progress label='Medium progress' value={55} size='md' />
      <Progress label='Large progress' value={80} size='lg' />
    </div>
  )
} satisfies Story;

export const indeterminate: Story = {
  args: {
    label: 'Preparing report',
    indeterminate: true,
    size: 'md'
  }
} satisfies Story;
