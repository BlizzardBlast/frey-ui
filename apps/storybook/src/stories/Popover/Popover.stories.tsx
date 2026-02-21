import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Popover, type PopoverProps } from 'frey-ui';
import { useState } from 'react';

const meta: Meta<PopoverProps> = {
  component: Popover,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    placement: {
      control: { type: 'select' },
      options: ['top', 'right', 'bottom', 'left']
    },
    closeOnEscape: {
      control: { type: 'boolean' }
    },
    closeOnOutsideClick: {
      control: { type: 'boolean' }
    }
  }
} satisfies Meta<PopoverProps>;

export default meta;

type Story = StoryObj<PopoverProps>;

export const basic_popover: Story = {
  render: (args) => (
    <Popover {...args}>
      <Popover.Trigger>
        <Button variant='secondary'>Open popover</Button>
      </Popover.Trigger>
      <Popover.Content>
        <div style={{ display: 'grid', gap: 6 }}>
          <strong>Team Access</strong>
          <p style={{ margin: 0, fontSize: 14 }}>
            Invite members and set their workspace permissions.
          </p>
        </div>
      </Popover.Content>
    </Popover>
  ),
  args: {
    placement: 'bottom',
    closeOnEscape: true,
    closeOnOutsideClick: true
  }
} satisfies Story;

export const placement_variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 10 }}>
      {(['top', 'right', 'bottom', 'left'] as const).map((placement) => (
        <Popover key={placement} placement={placement}>
          <Popover.Trigger>
            <Button variant='ghost'>{placement}</Button>
          </Popover.Trigger>
          <Popover.Content>
            <p style={{ margin: 0, fontSize: 14 }}>Placement: {placement}</p>
          </Popover.Content>
        </Popover>
      ))}
    </div>
  )
} satisfies Story;

export const controlled_popover: Story = {
  render: function ControlledPopoverStory(args) {
    const [open, setOpen] = useState(false);

    return (
      <div style={{ display: 'grid', gap: 10 }}>
        <Popover {...args} open={open} onOpenChange={setOpen}>
          <Popover.Trigger>
            <Button>Toggle settings</Button>
          </Popover.Trigger>
          <Popover.Content>
            <p style={{ margin: 0 }}>Controlled popover content.</p>
          </Popover.Content>
        </Popover>

        <small>Popover state: {open ? 'open' : 'closed'}</small>
      </div>
    );
  },
  args: {
    placement: 'bottom'
  }
} satisfies Story;
