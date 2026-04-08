import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, CommandPalette, type CommandPaletteProps } from 'frey-ui';
import { useEffect, useState } from 'react';
import { expect, fn, userEvent } from 'storybook/test';

type CommandPaletteStoryProps = Pick<
  CommandPaletteProps,
  'children' | 'open' | 'defaultOpen' | 'onOpenChange' | 'onSelect'
>;

function base_palette_items() {
  return (
    <>
      <CommandPalette.Group heading='General'>
        <CommandPalette.Item value='open-dashboard' keywords={['home']}>
          Open dashboard
          <CommandPalette.Shortcut>⌘D</CommandPalette.Shortcut>
        </CommandPalette.Item>
        <CommandPalette.Item value='invite-member' keywords={['team']}>
          Invite teammate
          <CommandPalette.Shortcut>⌘I</CommandPalette.Shortcut>
        </CommandPalette.Item>
      </CommandPalette.Group>
      <CommandPalette.Group heading='Project'>
        <CommandPalette.Item value='rename-project' disabled>
          Rename project
        </CommandPalette.Item>
        <CommandPalette.Item value='archive-project'>
          Archive project
          <CommandPalette.Shortcut>⌘A</CommandPalette.Shortcut>
        </CommandPalette.Item>
      </CommandPalette.Group>
      <CommandPalette.Empty>No commands found.</CommandPalette.Empty>
    </>
  );
}

const meta: Meta<CommandPaletteStoryProps> = {
  component: CommandPalette,
  parameters: {
    layout: 'centered'
  },
  decorators: [
    (Story) => (
      <div style={{ width: 560, maxWidth: '100%' }}>
        <Story />
      </div>
    )
  ],
  argTypes: {
    open: {
      control: { type: 'boolean' },
      description: 'Controlled open state of the command palette.',
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
      description:
        'Initial open state used when the command palette is uncontrolled.',
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
      description: 'Called whenever the open state changes.',
      table: {
        type: {
          summary: '(open: boolean) => void'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    onSelect: {
      action: 'command selected',
      description: 'Called when a command item is selected.',
      table: {
        type: {
          summary: '(value: string) => void'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    children: {
      control: false,
      description:
        'Composed trigger, content, input, list, group, item, empty and shortcut elements.',
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
} satisfies Meta<CommandPaletteStoryProps>;

export default meta;

type Story = StoryObj<CommandPaletteStoryProps>;

export const basic_command_palette: Story = {
  args: {
    defaultOpen: false,
    onSelect: fn()
  },
  render: (args) => (
    <CommandPalette {...args}>
      <CommandPalette.Trigger asChild>
        <Button>Open command palette</Button>
      </CommandPalette.Trigger>
      <CommandPalette.Content>
        <CommandPalette.Input label='Search commands' />
        <CommandPalette.List>{base_palette_items()}</CommandPalette.List>
      </CommandPalette.Content>
    </CommandPalette>
  ),
  play: async ({ canvas, args }) => {
    await userEvent.click(
      await canvas.findByRole('button', {
        name: 'Open command palette'
      })
    );

    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');

    await expect(args.onSelect).toHaveBeenCalledWith('invite-member');
  }
} satisfies Story;

export const grouped_actions: Story = {
  args: {
    defaultOpen: false
  },
  render: (args) => (
    <CommandPalette {...args}>
      <CommandPalette.Trigger asChild>
        <Button>Command menu</Button>
      </CommandPalette.Trigger>
      <CommandPalette.Content>
        <CommandPalette.Input label='Filter actions' />
        <CommandPalette.List>{base_palette_items()}</CommandPalette.List>
      </CommandPalette.Content>
    </CommandPalette>
  )
} satisfies Story;

export const empty_results_state: Story = {
  args: {
    defaultOpen: false
  },
  render: (args) => (
    <CommandPalette {...args}>
      <CommandPalette.Trigger asChild>
        <Button>Search actions</Button>
      </CommandPalette.Trigger>
      <CommandPalette.Content>
        <CommandPalette.Input label='Search actions' />
        <CommandPalette.List>{base_palette_items()}</CommandPalette.List>
      </CommandPalette.Content>
    </CommandPalette>
  ),
  play: async ({ canvas }) => {
    await userEvent.click(
      await canvas.findByRole('button', {
        name: 'Search actions'
      })
    );

    await userEvent.type(
      await canvas.findByRole('combobox', {
        name: 'Search actions'
      }),
      'no-match-value'
    );

    await expect(canvas.getByText('No commands found.')).toBeInTheDocument();
  }
} satisfies Story;

export const disabled_items: Story = {
  args: {
    defaultOpen: false,
    onSelect: fn()
  },
  render: (args) => (
    <CommandPalette {...args}>
      <CommandPalette.Trigger asChild>
        <Button>Open actions</Button>
      </CommandPalette.Trigger>
      <CommandPalette.Content>
        <CommandPalette.Input label='Find project action' />
        <CommandPalette.List>{base_palette_items()}</CommandPalette.List>
      </CommandPalette.Content>
    </CommandPalette>
  ),
  play: async ({ canvas, args }) => {
    await userEvent.click(
      await canvas.findByRole('button', {
        name: 'Open actions'
      })
    );

    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{Enter}');

    await expect(args.onSelect).toHaveBeenCalledWith('archive-project');
  }
} satisfies Story;

export const controlled_open_state: Story = {
  args: {
    defaultOpen: false
  },
  render: function ControlledOpenStateStory(args) {
    const [open, setOpen] = useState(Boolean(args.defaultOpen));

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
      <div style={{ display: 'grid', gap: 10, justifyItems: 'start' }}>
        <Button onClick={() => handleOpenChange(true)}>
          Open controlled palette
        </Button>
        <CommandPalette
          open={resolvedOpen}
          onOpenChange={handleOpenChange}
          onSelect={args.onSelect}
        >
          <CommandPalette.Content>
            <CommandPalette.Input label='Search workspace actions' />
            <CommandPalette.List>{base_palette_items()}</CommandPalette.List>
          </CommandPalette.Content>
        </CommandPalette>
      </div>
    );
  }
} satisfies Story;

export const search_driven_workspace_switcher: Story = {
  args: {
    defaultOpen: false
  },
  render: (args) => (
    <CommandPalette {...args}>
      <CommandPalette.Trigger asChild>
        <Button>Switch workspace</Button>
      </CommandPalette.Trigger>
      <CommandPalette.Content>
        <CommandPalette.Input label='Search workspace' />
        <CommandPalette.List>
          <CommandPalette.Group heading='Workspaces'>
            <CommandPalette.Item
              value='frey-ui-design-system'
              keywords={['design', 'components']}
              searchText='Frey UI design system'
            >
              Frey UI design system
              <CommandPalette.Shortcut>1</CommandPalette.Shortcut>
            </CommandPalette.Item>
            <CommandPalette.Item
              value='admin-portal'
              keywords={['ops', 'dashboard']}
              searchText='Admin portal'
            >
              Admin portal
              <CommandPalette.Shortcut>2</CommandPalette.Shortcut>
            </CommandPalette.Item>
            <CommandPalette.Item
              value='billing-console'
              keywords={['finance', 'invoice']}
              searchText='Billing console'
            >
              Billing console
              <CommandPalette.Shortcut>3</CommandPalette.Shortcut>
            </CommandPalette.Item>
          </CommandPalette.Group>
          <CommandPalette.Empty>
            No workspace matched your query.
          </CommandPalette.Empty>
        </CommandPalette.List>
      </CommandPalette.Content>
    </CommandPalette>
  )
} satisfies Story;
