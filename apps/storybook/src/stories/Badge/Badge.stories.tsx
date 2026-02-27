import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge, type BadgeProps } from 'frey-ui';

const meta: Meta<BadgeProps> = {
  component: Badge,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    tone: {
      control: { type: 'select' },
      options: ['neutral', 'info', 'success', 'warning', 'error']
    },
    variant: {
      control: { type: 'select' },
      options: ['subtle', 'solid']
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md']
    }
  }
} satisfies Meta<BadgeProps>;

export default meta;
type Story = StoryObj<BadgeProps>;

export const basic: Story = {
  args: {
    children: 'Active',
    tone: 'success',
    variant: 'subtle',
    size: 'md'
  }
} satisfies Story;

export const all_tones: Story = {
  render: () => (
    <div className='flex flex-wrap gap-3'>
      <Badge tone='neutral'>Neutral</Badge>
      <Badge tone='info'>Info</Badge>
      <Badge tone='success'>Success</Badge>
      <Badge tone='warning'>Warning</Badge>
      <Badge tone='error'>Error</Badge>
    </div>
  )
} satisfies Story;

export const subtle_vs_solid: Story = {
  render: () => (
    <div className='flex flex-col gap-3'>
      <div className='flex gap-3'>
        <Badge tone='info' variant='subtle'>
          Subtle info
        </Badge>
        <Badge tone='warning' variant='subtle'>
          Subtle warning
        </Badge>
      </div>
      <div className='flex gap-3'>
        <Badge tone='info' variant='solid'>
          Solid info
        </Badge>
        <Badge tone='warning' variant='solid'>
          Solid warning
        </Badge>
      </div>
    </div>
  )
} satisfies Story;
