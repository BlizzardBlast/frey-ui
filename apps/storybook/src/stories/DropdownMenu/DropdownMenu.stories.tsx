import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, DropdownMenu, type DropdownMenuProps } from 'frey-ui';
import type React from 'react';
import { useState } from 'react';

const StoryDropdownMenu =
  DropdownMenu as unknown as React.ComponentType<DropdownMenuProps>;

const menuItems: DropdownMenuProps['items'] = [
  { label: 'Rename', value: 'rename' },
  { label: 'Duplicate', value: 'duplicate' },
  { label: 'Move to archive', value: 'archive' },
  { label: 'Delete project', value: 'delete', destructive: true }
];

const meta: Meta<DropdownMenuProps> = {
  component: StoryDropdownMenu,
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
} satisfies Meta<DropdownMenuProps>;

export default meta;

type Story = StoryObj<DropdownMenuProps>;

export const basic_menu: Story = {
  render: (args) => (
    <StoryDropdownMenu
      {...args}
      trigger={<Button variant='secondary'>Actions</Button>}
      items={menuItems}
    />
  ),
  args: {
    placement: 'bottom',
    closeOnEscape: true,
    closeOnOutsideClick: true
  }
} satisfies Story;

export const with_disabled_item: Story = {
  render: () => (
    <DropdownMenu
      trigger={<Button variant='secondary'>File menu</Button>}
      items={[
        { label: 'New file', value: 'new' },
        { label: 'Rename file', value: 'rename', disabled: true },
        { label: 'Delete file', value: 'delete', destructive: true }
      ]}
    />
  )
} satisfies Story;

export const controlled_menu: Story = {
  render: function ControlledDropdownStory(args) {
    const [open, setOpen] = useState(false);
    const [selection, setSelection] = useState<string | null>(null);

    return (
      <div style={{ display: 'grid', gap: 10, justifyItems: 'center' }}>
        <StoryDropdownMenu
          {...args}
          open={open}
          onOpenChange={setOpen}
          trigger={<Button>Project options</Button>}
          items={menuItems}
          onSelect={(value) => setSelection(value)}
        />

        <small>
          Last selection: {selection ?? 'none'} | Menu is{' '}
          {open ? 'open' : 'closed'}
        </small>
      </div>
    );
  },
  args: {
    placement: 'bottom'
  }
} satisfies Story;
