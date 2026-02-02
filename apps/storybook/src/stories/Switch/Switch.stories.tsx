import type { Meta, StoryObj } from '@storybook/react-vite';

import Switch from '../../../../../src/Switch';

const meta: Meta<typeof Switch> = {
  component: Switch,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    label: {
      control: {
        type: 'text'
      },
      description: 'The text to be in the aria-label'
    }
  }
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof Switch>;

export const Basic_Switch: Story = {
  args: {
    label: 'Switch'
  },
  render: (args) => (
    <div className='flex gap-4'>
      <Switch {...args} />
    </div>
  )
} satisfies Story;
