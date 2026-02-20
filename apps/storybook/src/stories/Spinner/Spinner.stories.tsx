import type { Meta, StoryObj } from '@storybook/react-vite';
import { Spinner, type SpinnerProps } from 'frey-ui';
import type React from 'react';

const StorySpinner = Spinner as unknown as React.ComponentType<SpinnerProps>;

const meta: Meta<SpinnerProps> = {
  component: StorySpinner,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg']
    },
    label: {
      control: { type: 'text' }
    }
  }
} satisfies Meta<SpinnerProps>;

export default meta;

type Story = StoryObj<SpinnerProps>;

export const basic_spinner: Story = {
  args: {
    size: 'md',
    label: 'Loading data'
  }
} satisfies Story;

export const size_variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Spinner size='sm' label='Small loading spinner' />
      <Spinner size='md' label='Medium loading spinner' />
      <Spinner size='lg' label='Large loading spinner' />
      <Spinner size={28} label='Custom loading spinner' />
    </div>
  )
} satisfies Story;
