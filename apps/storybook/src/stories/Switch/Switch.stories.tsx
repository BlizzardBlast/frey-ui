import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import type React from 'react';

import { Switch } from 'frey-ui';
import type { SwitchProps } from 'frey-ui';

type SwitchStoryProps = SwitchProps;

const StorySwitch = Switch as unknown as React.ComponentType<SwitchStoryProps>;

const meta: Meta<SwitchStoryProps> = {
  component: StorySwitch,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    label: {
      control: { type: 'text' },
      description: 'Accessible label for the switch'
    },
    hideLabel: {
      control: { type: 'boolean' },
      description:
        'Whether to visually hide the label (still accessible to screen readers)'
    },
    checked: {
      control: { type: 'boolean' },
      description: 'Controlled checked state'
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the switch is disabled'
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size variant of the switch'
    }
  }
} satisfies Meta<SwitchStoryProps>;

export default meta;
type Story = StoryObj<SwitchStoryProps>;

export const Basic_Switch: Story = {
  args: {
    label: 'Enable notifications'
  },
  render: (args) => (
    <div className='flex gap-4'>
      <StorySwitch {...args} />
    </div>
  )
} satisfies Story;

export const Hidden_Label: Story = {
  args: {
    label: 'Toggle feature',
    hideLabel: true
  },
  render: (args) => <StorySwitch {...args} />
} satisfies Story;

export const Sizes: Story = {
  render: () => (
    <div className='flex flex-col gap-4'>
      <StorySwitch label='Small' size='sm' />
      <StorySwitch label='Medium (default)' size='md' />
      <StorySwitch label='Large' size='lg' />
    </div>
  )
} satisfies Story;

export const Disabled: Story = {
  render: () => (
    <div className='flex flex-col gap-4'>
      <StorySwitch label='Disabled unchecked' disabled />
      <StorySwitch label='Disabled checked' disabled defaultChecked />
    </div>
  )
} satisfies Story;

export const Controlled: Story = {
  render: function ControlledSwitch() {
    const [checked, setChecked] = useState(false);
    return (
      <div className='flex flex-col gap-4 items-center'>
        <StorySwitch
          label='Dark mode'
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        <p>Switch is: {checked ? 'ON' : 'OFF'}</p>
      </div>
    );
  }
} satisfies Story;

export const Custom_Colors: Story = {
  args: {
    label: 'Custom themed switch'
  },
  render: (args) => (
    <StorySwitch
      {...args}
      style={
        {
          '--switch-track-inactive': '#94a3b8',
          '--switch-track-active': '#22c55e',
          '--switch-focus-ring': '#22c55e'
        } as NonNullable<SwitchProps['style']>
      }
    />
  )
} satisfies Story;
