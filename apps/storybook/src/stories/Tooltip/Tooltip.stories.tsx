import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, Tooltip, type TooltipProps } from 'frey-ui';
import { useEffect, useState } from 'react';

type TooltipStoryProps = Pick<
  TooltipProps,
  | 'children'
  | 'asChild'
  | 'content'
  | 'open'
  | 'defaultOpen'
  | 'onOpenChange'
  | 'placement'
  | 'offset'
  | 'delay'
  | 'id'
  | 'className'
  | 'style'
>;

const meta: Meta<TooltipStoryProps> = {
  component: Tooltip,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    placement: {
      control: { type: 'select' },
      options: ['top', 'right', 'bottom', 'left'],
      description: 'Preferred placement of the tooltip bubble',
      table: {
        type: {
          summary: "'top' | 'right' | 'bottom' | 'left'"
        },
        defaultValue: {
          summary: "'top'"
        }
      }
    },
    delay: {
      control: { type: 'number' },
      description: 'Delay in milliseconds before the tooltip opens on hover',
      table: {
        type: {
          summary: 'number'
        },
        defaultValue: {
          summary: '120'
        }
      }
    },
    asChild: {
      control: false,
      description:
        'Whether the tooltip should attach its behavior to a single child element',
      table: {
        type: {
          summary: 'boolean'
        },
        defaultValue: {
          summary: 'false'
        }
      }
    },
    content: {
      control: { type: 'text' },
      description:
        'Tooltip content shown when the trigger is hovered or focused',
      table: {
        type: {
          summary: 'ReactNode'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    open: {
      control: { type: 'boolean' },
      description: 'Controlled open state of the tooltip',
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
      description: 'Initial open state when the tooltip is uncontrolled',
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
      description: 'Called when the tooltip open state changes',
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
      description: 'Distance in pixels between the trigger and tooltip bubble',
      table: {
        type: {
          summary: 'number'
        },
        defaultValue: {
          summary: '8'
        }
      }
    },
    id: {
      control: { type: 'text' },
      description: 'Id applied to the tooltip element',
      table: {
        type: {
          summary: 'string'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    className: {
      control: { type: 'text' },
      description: 'Additional class names applied to the tooltip bubble',
      table: {
        type: {
          summary: 'string'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    style: {
      control: { type: 'object' },
      description: 'Inline styles applied to the tooltip bubble',
      table: {
        type: {
          summary: 'CSSProperties'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    children: {
      control: false,
      description: 'Trigger element that shows the tooltip on interaction',
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
} satisfies Meta<TooltipStoryProps>;

export default meta;

type Story = StoryObj<TooltipStoryProps>;

export const basic_tooltip: Story = {
  render: (args) => (
    <Tooltip {...args} asChild content={args.content ?? 'Copy to clipboard'}>
      <Button variant='secondary'>Hover or focus me</Button>
    </Tooltip>
  ),
  args: {
    placement: 'top',
    delay: 120,
    content: 'Copy to clipboard'
  }
} satisfies Story;

export const placement_variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 10 }}>
      {(['top', 'right', 'bottom', 'left'] as const).map((placement) => (
        <Tooltip
          key={placement}
          asChild
          placement={placement}
          delay={0}
          content={`Placement: ${placement}`}
        >
          <Button variant='ghost'>{placement}</Button>
        </Tooltip>
      ))}
    </div>
  )
} satisfies Story;

export const controlled_tooltip: Story = {
  render: function ControlledTooltipStory(args) {
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
      <div style={{ display: 'grid', gap: 10, justifyItems: 'center' }}>
        <Tooltip
          {...args}
          asChild
          content={args.content ?? 'Controlled tooltip'}
          open={resolvedOpen}
          onOpenChange={handleOpenChange}
        >
          <Button variant='secondary'>Controlled target</Button>
        </Tooltip>

        <Button variant='ghost' onClick={() => handleOpenChange(!resolvedOpen)}>
          Toggle tooltip
        </Button>
      </div>
    );
  },
  args: {
    placement: 'top',
    delay: 0,
    content: 'Controlled tooltip'
  }
} satisfies Story;
