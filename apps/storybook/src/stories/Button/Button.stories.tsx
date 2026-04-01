import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ButtonSize, ButtonVariant } from 'frey-ui';
import { Button } from 'frey-ui';
import { expect, fn, userEvent, within } from 'storybook/test';

type ButtonStoryProps = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  asChild?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLElement>;
};

const meta: Meta<ButtonStoryProps> = {
  component: Button,
  parameters: {
    layout: 'centered'
  },
  argTypes: {
    children: {
      control: { type: 'text' },
      description: 'Button label content',
      table: {
        type: {
          summary: 'ReactNode'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'ghost', 'destructive'],
      description: 'Visual variant of the button',
      table: {
        type: {
          summary: "'primary' | 'secondary' | 'ghost' | 'destructive'"
        },
        defaultValue: {
          summary: "'primary'"
        }
      }
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size of the button',
      table: {
        type: {
          summary: "'sm' | 'md' | 'lg'"
        },
        defaultValue: {
          summary: "'md'"
        }
      }
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the button is disabled',
      table: {
        type: {
          summary: 'boolean'
        },
        defaultValue: {
          summary: 'false'
        }
      }
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Whether the button is in a loading state',
      table: {
        type: {
          summary: 'boolean'
        },
        defaultValue: {
          summary: 'false'
        }
      }
    },
    asChild: {
      control: false,
      description:
        'Whether the button should pass its behavior and styling to a single child element',
      table: {
        type: {
          summary: 'boolean'
        },
        defaultValue: {
          summary: 'false'
        }
      }
    },
    className: {
      control: { type: 'text' },
      description: 'Additional class names applied to the button element',
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
      description: 'Inline styles applied to the button element',
      table: {
        type: {
          summary: 'CSSProperties'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    },
    onClick: {
      action: 'clicked',
      description: 'Called when the button is clicked',
      table: {
        type: {
          summary: 'MouseEventHandler<HTMLElement>'
        },
        defaultValue: {
          summary: 'None'
        }
      }
    }
  }
} satisfies Meta<ButtonStoryProps>;

export default meta;
type Story = StoryObj<ButtonStoryProps>;

export const basic_button: Story = {
  args: {
    children: 'Button'
  },
  render: (args) => (
    <div className='flex gap-4'>
      <Button {...args} variant='primary' />
      <Button {...args} variant='secondary' />
      <Button {...args} variant='ghost' />
      <Button {...args} variant='destructive' />
    </div>
  )
} satisfies Story;

export const sizes: Story = {
  render: () => (
    <div className='flex items-center gap-4'>
      <Button size='sm'>Small</Button>
      <Button size='md'>Medium</Button>
      <Button size='lg'>Large</Button>
    </div>
  )
} satisfies Story;

export const disabled_button: Story = {
  render: () => (
    <div className='flex gap-4'>
      <Button disabled>Primary</Button>
      <Button variant='secondary' disabled>
        Secondary
      </Button>
      <Button variant='destructive' disabled>
        Destructive
      </Button>
    </div>
  )
} satisfies Story;

export const loading_button: Story = {
  render: () => (
    <div className='flex gap-4'>
      <Button loading>Submitting...</Button>
      <Button variant='secondary' loading>
        Loading
      </Button>
    </div>
  )
} satisfies Story;

export const as_link: Story = {
  args: {
    children: 'Visit docs',
    variant: 'secondary'
  },
  render: (args) => (
    <Button {...args} asChild>
      <a href='https://storybook.js.org' target='_blank' rel='noreferrer'>
        {args.children}
      </a>
    </Button>
  )
} satisfies Story;

export const click_interaction: Story = {
  args: {
    children: 'Click me',
    onClick: fn()
  },
  render: (args) => <Button {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Click me' });

    await userEvent.click(button);

    expect(args.onClick).toHaveBeenCalledTimes(1);
  }
} satisfies Story;

export const disabled_interaction: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
    onClick: fn()
  },
  render: (args) => <Button {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Disabled' });

    expect(button).toBeDisabled();

    await userEvent.click(button);

    expect(args.onClick).not.toHaveBeenCalled();
  }
} satisfies Story;
