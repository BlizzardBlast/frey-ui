import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Drawer, type DrawerProps } from 'frey-ui';
import { useEffect, useState } from 'react';

type DrawerStoryProps = Pick<
  DrawerProps,
  'children' | 'open' | 'defaultOpen' | 'onOpenChange' | 'placement'
>;

const meta: Meta<DrawerStoryProps> = {
  component: Drawer,
  parameters: {
    layout: 'fullscreen'
  },
  argTypes: {
    placement: {
      control: { type: 'select' },
      options: ['left', 'right', 'top', 'bottom'],
      description: 'Placement of the drawer panel relative to the viewport',
      table: {
        type: {
          summary: "'left' | 'right' | 'top' | 'bottom'"
        },
        defaultValue: {
          summary: "'right'"
        }
      }
    },
    open: {
      control: { type: 'boolean' },
      description: 'Controlled open state of the drawer',
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
      description: 'Initial open state when the drawer is uncontrolled',
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
      description: 'Called when the drawer open state changes',
      table: {
        type: {
          summary: '(open: boolean) => void'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    children: {
      control: false,
      description: 'Composed trigger and drawer content elements',
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
} satisfies Meta<DrawerStoryProps>;

export default meta;

type Story = StoryObj<DrawerStoryProps>;

export const basic_drawer: Story = {
  args: {
    placement: 'right',
    defaultOpen: false
  },
  render: (args) => (
    <div style={{ padding: 24 }}>
      <Drawer {...args}>
        <Drawer.Trigger asChild>
          <Button>Open drawer</Button>
        </Drawer.Trigger>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Workspace settings</Drawer.Title>
            <Drawer.Description>
              Update project-level preferences in one place.
            </Drawer.Description>
          </Drawer.Header>
          <Drawer.Body>
            <p style={{ margin: 0, fontSize: 14 }}>
              Configure notifications, collaboration permissions, and defaults.
            </p>
          </Drawer.Body>
          <Drawer.Footer>
            <Button variant='secondary'>Cancel</Button>
            <Button variant='primary'>Save changes</Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </div>
  )
} satisfies Story;

export const placement_variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 10, padding: 24 }}>
      {(['left', 'right', 'top', 'bottom'] as const).map((placement) => (
        <Drawer key={placement} placement={placement}>
          <Drawer.Trigger asChild>
            <Button variant='ghost'>{placement} drawer</Button>
          </Drawer.Trigger>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>{placement} placement</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              <p style={{ margin: 0, fontSize: 14 }}>Placement: {placement}</p>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer>
      ))}
    </div>
  )
} satisfies Story;

export const controlled_drawer: Story = {
  args: {
    placement: 'right',
    defaultOpen: false
  },
  render: function ControlledDrawerStory(args) {
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
      <div style={{ padding: 24, display: 'grid', gap: 10 }}>
        <Button onClick={() => handleOpenChange(true)}>
          Open controlled drawer
        </Button>
        <Drawer
          placement={args.placement}
          open={resolvedOpen}
          onOpenChange={handleOpenChange}
        >
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>Controlled drawer</Drawer.Title>
              <Drawer.Description>
                This drawer is controlled by external state.
              </Drawer.Description>
            </Drawer.Header>
            <Drawer.Body>
              <p style={{ margin: 0, fontSize: 14 }}>
                Current state: {resolvedOpen ? 'open' : 'closed'}
              </p>
            </Drawer.Body>
            <Drawer.Footer>
              <Button
                variant='secondary'
                onClick={() => handleOpenChange(false)}
              >
                Close
              </Button>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer>
      </div>
    );
  }
} satisfies Story;
