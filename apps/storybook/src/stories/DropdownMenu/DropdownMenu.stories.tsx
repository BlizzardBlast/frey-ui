import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, DropdownMenu, type DropdownMenuProps } from 'frey-ui';
import { useEffect, useState } from 'react';

type DropdownMenuStoryProps = Pick<
  DropdownMenuProps,
  | 'children'
  | 'open'
  | 'defaultOpen'
  | 'onOpenChange'
  | 'placement'
  | 'offset'
  | 'closeOnEscape'
  | 'closeOnOutsideClick'
>;

const meta: Meta<DropdownMenuStoryProps> = {
  component: DropdownMenu,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    placement: {
      control: { type: 'select' },
      options: ['top', 'right', 'bottom', 'left'],
      description: 'Preferred placement of the dropdown content',
      table: {
        type: {
          summary: "'top' | 'right' | 'bottom' | 'left'"
        },
        defaultValue: {
          summary: "'bottom'"
        }
      }
    },
    closeOnEscape: {
      control: { type: 'boolean' },
      description: 'Whether pressing Escape closes the menu',
      table: {
        type: {
          summary: 'boolean'
        },
        defaultValue: {
          summary: 'true'
        }
      }
    },
    closeOnOutsideClick: {
      control: { type: 'boolean' },
      description: 'Whether clicking outside closes the menu',
      table: {
        type: {
          summary: 'boolean'
        },
        defaultValue: {
          summary: 'true'
        }
      }
    },
    open: {
      control: { type: 'boolean' },
      description: 'Controlled open state of the dropdown menu',
      table: {
        type: {
          summary: 'boolean'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    defaultOpen: {
      control: { type: 'boolean' },
      description: 'Initial open state when the menu is uncontrolled',
      table: {
        type: {
          summary: 'boolean'
        },
        defaultValue: {
          summary: 'false'
        }
      }
    },
    onOpenChange: {
      action: 'open changed',
      description: 'Called when the dropdown menu open state changes',
      table: {
        type: {
          summary: '(open: boolean) => void'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    offset: {
      control: { type: 'number' },
      description: 'Distance in pixels between the trigger and menu content',
      table: {
        type: {
          summary: 'number'
        },
        defaultValue: {
          summary: '8'
        }
      }
    },
    children: {
      control: false,
      description: 'Composed trigger and menu content elements',
      table: {
        type: {
          summary: 'ReactNode'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    }
  }
} satisfies Meta<DropdownMenuStoryProps>;

export default meta;

type Story = StoryObj<DropdownMenuStoryProps>;

export const basic_menu: Story = {
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenu.Trigger asChild>
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
      <DropdownMenu.Trigger asChild>
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
    const [open, setOpen] = useState(Boolean(args.defaultOpen));
    const [selection, setSelection] = useState<string | null>(null);

    useEffect(() => {
      if (args.open === undefined) {
        setOpen(Boolean(args.defaultOpen));
      }
    }, [args.defaultOpen, args.open]);

    const resolvedOpen = args.open ?? open;
    const handleOpenChange = (nextOpen: boolean) => {
      if (args.open === undefined) {
        setOpen(nextOpen);
      }

      args.onOpenChange?.(nextOpen);
    };

    return (
      <div style={{ display: 'grid', gap: 10, justifyItems: 'center' }}>
        <DropdownMenu
          {...args}
          open={resolvedOpen}
          onOpenChange={handleOpenChange}
        >
          <DropdownMenu.Trigger asChild>
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
          {resolvedOpen ? 'open' : 'closed'}
        </small>
      </div>
    );
  },
  args: {
    placement: 'bottom'
  }
} satisfies Story;
