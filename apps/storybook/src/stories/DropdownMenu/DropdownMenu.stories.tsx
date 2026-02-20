import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, DropdownMenu, type DropdownMenuProps } from 'frey-ui';
import { useState } from 'react';

const meta: Meta<DropdownMenuProps> = {
  component: DropdownMenu,
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
    <DropdownMenu {...args}>
      <DropdownMenu.Trigger>
        <Button variant='secondary'>Actions</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item onSelect={() => console.log('Rename')}>
          Rename
        </DropdownMenu.Item>
        <DropdownMenu.Item onSelect={() => console.log('Duplicate')}>
          Duplicate
        </DropdownMenu.Item>
        <DropdownMenu.Item onSelect={() => console.log('Archive')}>
          Move to archive
        </DropdownMenu.Item>
        <DropdownMenu.Item destructive onSelect={() => console.log('Delete')}>
          Delete project
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  ),
  args: {
    placement: 'bottom',
    closeOnEscape: true,
    closeOnOutsideClick: true
  }
} satisfies Story;

export const with_disabled_item: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenu.Trigger>
        <Button variant='secondary'>File menu</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item onSelect={() => console.log('New')}>
          New file
        </DropdownMenu.Item>
        <DropdownMenu.Item disabled onSelect={() => console.log('Rename')}>
          Rename file
        </DropdownMenu.Item>
        <DropdownMenu.Item destructive onSelect={() => console.log('Delete')}>
          Delete file
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  )
} satisfies Story;

export const controlled_menu: Story = {
  render: function ControlledDropdownStory(args) {
    const [open, setOpen] = useState(false);
    const [selection, setSelection] = useState<string | null>(null);

    return (
      <div style={{ display: 'grid', gap: 10, justifyItems: 'center' }}>
        <DropdownMenu {...args} open={open} onOpenChange={setOpen}>
          <DropdownMenu.Trigger>
            <Button>Project options</Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item onSelect={() => setSelection('Rename')}>
              Rename
            </DropdownMenu.Item>
            <DropdownMenu.Item onSelect={() => setSelection('Duplicate')}>
              Duplicate
            </DropdownMenu.Item>
            <DropdownMenu.Item onSelect={() => setSelection('Archive')}>
              Move to archive
            </DropdownMenu.Item>
            <DropdownMenu.Item
              destructive
              onSelect={() => setSelection('Delete')}
            >
              Delete project
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>

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
