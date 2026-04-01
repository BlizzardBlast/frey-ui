import type { Meta, StoryObj } from '@storybook/react-vite';
import type { SkeletonProps } from 'frey-ui';
import { Skeleton } from 'frey-ui';

type SkeletonStoryProps = Pick<
  SkeletonProps,
  'width' | 'height' | 'shape' | 'className' | 'style'
>;

const meta: Meta<SkeletonStoryProps> = {
  component: Skeleton,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    width: {
      control: { type: 'text' },
      description:
        'Width of the placeholder (number for px, string for any unit)',
      table: {
        type: {
          summary: 'string | number'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    height: {
      control: { type: 'text' },
      description:
        'Height of the placeholder (number for px, string for any unit)',
      table: {
        type: {
          summary: 'string | number'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    shape: {
      control: { type: 'select' },
      options: ['rectangle', 'circle'],
      description: 'Shape of the skeleton',
      table: {
        type: {
          summary: "'rectangle' | 'circle'"
        },
        defaultValue: {
          summary: "'rectangle'"
        }
      }
    },
    className: {
      control: { type: 'text' },
      description: 'Additional class names applied to the skeleton element',
      table: {
        type: {
          summary: 'string'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    style: {
      control: { type: 'object' },
      description: 'Inline styles applied to the skeleton element',
      table: {
        type: {
          summary: 'CSSProperties'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    }
  }
} satisfies Meta<SkeletonStoryProps>;

export default meta;
type Story = StoryObj<SkeletonStoryProps>;

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
