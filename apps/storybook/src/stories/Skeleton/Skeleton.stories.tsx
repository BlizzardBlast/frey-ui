import type { Meta, StoryObj } from '@storybook/react-vite';

import { Skeleton } from 'frey-ui';
import type { SkeletonProps } from 'frey-ui';

const meta: Meta<SkeletonProps> = {
  component: Skeleton,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    width: {
      control: { type: 'text' },
      description: 'Width (number for px, string for any unit)'
    },
    height: {
      control: { type: 'text' },
      description: 'Height (number for px, string for any unit)'
    },
    shape: {
      control: { type: 'select' },
      options: ['rectangle', 'circle'],
      description: 'Shape of the skeleton'
    }
  }
} satisfies Meta<SkeletonProps>;

export default meta;
type Story = StoryObj<SkeletonProps>;

export const rectangle: Story = {
  args: {
    width: 200,
    height: 20
  }
} satisfies Story;

export const circle: Story = {
  args: {
    shape: 'circle',
    width: 48
  }
} satisfies Story;

export const text_lines: Story = {
  render: () => (
    <div className='flex flex-col gap-2' style={{ width: 300 }}>
      <Skeleton width='80%' height={16} />
      <Skeleton width='100%' height={16} />
      <Skeleton width='60%' height={16} />
    </div>
  )
} satisfies Story;

export const card_skeleton: Story = {
  render: () => (
    <div className='flex gap-4 items-start' style={{ width: 320 }}>
      <Skeleton shape='circle' width={48} />
      <div className='flex flex-col gap-2' style={{ flex: 1 }}>
        <Skeleton width='60%' height={14} />
        <Skeleton width='100%' height={12} />
        <Skeleton width='80%' height={12} />
      </div>
    </div>
  )
} satisfies Story;

export const various_sizes: Story = {
  render: () => (
    <div className='flex flex-col gap-4 items-start'>
      <Skeleton width={100} height={100} />
      <Skeleton width={200} height={20} />
      <Skeleton shape='circle' width={64} />
      <Skeleton width='100%' height={40} />
    </div>
  )
} satisfies Story;
