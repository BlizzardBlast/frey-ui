import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Popover, type PopoverProps } from 'frey-ui';
import { useEffect, useState } from 'react';

type PopoverStoryProps = Pick<
  PopoverProps,
  | 'children'
  | 'open'
  | 'defaultOpen'
  | 'onOpenChange'
  | 'placement'
  | 'offset'
  | 'closeOnEscape'
  | 'closeOnOutsideClick'
>;

const meta: Meta<PopoverStoryProps> = {
  component: Popover,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    placement: {
      control: { type: 'select' },
      options: ['top', 'right', 'bottom', 'left'],
      description: 'Preferred placement of the popover content',
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
      description: 'Whether pressing Escape closes the popover',
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
      description: 'Whether clicking outside closes the popover',
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
      description: 'Controlled open state of the popover',
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
      description: 'Initial open state when the popover is uncontrolled',
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
      description: 'Called when the popover open state changes',
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
      description: 'Distance in pixels between the trigger and popover content',
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
      description: 'Composed trigger and popover content elements',
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
} satisfies Meta<PopoverStoryProps>;

export default meta;

type Story = StoryObj<PopoverStoryProps>;

export const basic_popover: Story = {
  render: (args) => (
    <Popover {...args}>
      <Popover.Trigger asChild>
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
          <Popover.Trigger asChild>
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
      <div style={{ display: 'grid', gap: 10 }}>
        <Popover {...args} open={resolvedOpen} onOpenChange={handleOpenChange}>
          <Popover.Trigger asChild>
            <Button>Toggle settings</Button>
          </Popover.Trigger>
          <Popover.Content>
            <p style={{ margin: 0 }}>Controlled popover content.</p>
          </Popover.Content>
        </Popover>

        <small>Popover state: {resolvedOpen ? 'open' : 'closed'}</small>
      </div>
    );
  },
  args: {
    placement: 'bottom'
  }
} satisfies Story;
